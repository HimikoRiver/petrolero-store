import "server-only";
import { betterAuth } from "better-auth";
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
