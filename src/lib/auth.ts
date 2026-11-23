import "server-only";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { twoFactor } from "better-auth/plugins";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { getPrisma } from "./prisma";
import { isAuthMailConfigured, sendAuthMail } from "./auth-mail";

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL &&
    process.env.BETTER_AUTH_URL &&
    process.env.BETTER_AUTH_SECRET &&
    process.env.BETTER_AUTH_SECRET.length >= 32 &&
    isAuthMailConfigured(),
  );
}

function createAuth() {
  return betterAuth({
    appName: "Petrolero",
    plugins: [twoFactor({ issuer: "Petrolero" })],
    // Enforce bans at the session creation boundary (password and 2FA flows).
    // Deleting existing sessions alone cannot stop a fresh sign-in.
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const user = await getPrisma().user.findUnique({
              where: { id: session.userId },
              select: { isBlocked: true },
            });
            if (!user || user.isBlocked) {
              throw new APIError("FORBIDDEN", {
                message: "Доступ к аккаунту заблокирован. Свяжитесь с администрацией магазина.",
              });
            }
            return { data: session };
          },
        },
      },
    },
    // Default Better Auth throttling is off under `next dev` and memory-only
    // under production. Persist counters so restarts/instances cannot reset them.
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 240,
      customRules: {
        "/sign-in/email": { window: 60, max: 12 },
        "/sign-up/email": { window: 60, max: 5 },
        "/forget-password": { window: 60, max: 5 },
        "/reset-password": { window: 60, max: 5 },
        // Better Auth's twoFactor plugin has stricter rules of its own.
      },
    },
    advanced: {
      // Never trust raw X-Forwarded-For: callers can forge it. When deploying,
      // configure a header that a trusted edge proxy REPLACES on every request.
      ipAddress: {
        ipAddressHeaders: process.env.PETROLERO_TRUSTED_IP_HEADER
          ? [process.env.PETROLERO_TRUSTED_IP_HEADER.toLowerCase()]
          : [],
      },
    },
    baseURL: process.env.BETTER_AUTH_URL!,
    secret: process.env.BETTER_AUTH_SECRET!,
    database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, token }) => {
        // The Better Auth API link is not our password form.
        // Send the token directly to the actual storefront reset page.
        const resetPage = new URL("/account/reset-password", process.env.BETTER_AUTH_URL!);
        resetPage.searchParams.set("token", token);

        await sendAuthMail({
          to: user.email,
          subject: "Petrolero — восстановление пароля",
          description: "Для изменения пароля перейдите по ссылке:",
          link: resetPage.toString(),
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthMail({
          to: user.email,
          subject: "Petrolero — подтверждение почты",
          description: "Для подтверждения адреса электронной почты перейдите по ссылке:",
          link: url,
        });
      },
    },
  });
}

type PetroleroAuth = ReturnType<typeof createAuth>;
const authGlobal = globalThis as unknown as { petroleroAuth?: PetroleroAuth };

export function getAuth(): PetroleroAuth {
  if (!isAuthConfigured()) {
    throw new Error("Petrolero authentication requires database, secret, URL and SMTP configuration");
  }

  if (!authGlobal.petroleroAuth) authGlobal.petroleroAuth = createAuth();
  return authGlobal.petroleroAuth;
}
