import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { getPrisma } from "./prisma";
import { isAuthMailConfigured, sendAuthMail } from "./auth-mail";

type Auth = ReturnType<typeof betterAuth>;
const authGlobal = globalThis as unknown as { petroleroAuth?: Auth };

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL &&
    process.env.BETTER_AUTH_URL &&
    process.env.BETTER_AUTH_SECRET &&
    process.env.BETTER_AUTH_SECRET.length >= 32 &&
    isAuthMailConfigured(),
  );
}

export function getAuth(): Auth {
  if (!isAuthConfigured()) {
    throw new Error("Petrolero authentication requires database, secret, URL and SMTP configuration");
  }

  if (!authGlobal.petroleroAuth) {
    authGlobal.petroleroAuth = betterAuth({
      baseURL: process.env.BETTER_AUTH_URL!,
      secret: process.env.BETTER_AUTH_SECRET!,
      database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 10,
        requireEmailVerification: true,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url }) => {
          await sendAuthMail({
            to: user.email,
            subject: "Petrolero — восстановление пароля",
            description: "Для изменения пароля перейдите по ссылке:",
            link: url,
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
  return authGlobal.petroleroAuth;
}
