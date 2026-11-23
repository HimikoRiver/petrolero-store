import "server-only";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function adminIdentity(headers: Headers) {
  if (!isAuthConfigured()) return { status: 503 as const, userId: null };
  const session = await getAuth().api.getSession({ headers });
  if (!session?.user) return { status: 401 as const, userId: null };
  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: { role: true, emailVerified: true, twoFactorEnabled: true },
  });
  if (!user?.emailVerified || user.role !== "ADMIN") {
    return { status: 403 as const, userId: null };
  }
  // The second factor must be enrolled before ANY privileged operation.
  // Better Auth then requires the TOTP/backup-code challenge on subsequent
  // password sign-ins before issuing an authenticated session.
  if (!user.twoFactorEnabled) {
    return { status: 428 as const, userId: null };
  }
  return { status: 200 as const, userId: session.user.id };
}

export function adminError(status: number) {
  return Response.json({
    error: status === 503 ? "База данных или авторизация ещё не настроена."
      : status === 401 ? "Необходимо войти в аккаунт."
      : status === 428 ? "Для работы в админ-панели необходимо включить двухфакторную защиту."
      : "Недостаточно прав для управления магазином.",
    ...(status === 428 ? { setupUrl: "/account/security" } : {}),
  }, { status, headers: { "Cache-Control": "no-store" } });
}
