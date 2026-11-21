import "server-only";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function adminIdentity(headers: Headers) {
  if (!isAuthConfigured()) return { status: 503 as const, userId: null };
  const session = await getAuth().api.getSession({ headers });
  if (!session?.user) return { status: 401 as const, userId: null };
  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: { role: true, emailVerified: true },
  });
  if (!user?.emailVerified || user.role !== "ADMIN") {
    return { status: 403 as const, userId: null };
  }
  return { status: 200 as const, userId: session.user.id };
}

export function adminError(status: number) {
  return Response.json({
    error: status === 503 ? "База данных или авторизация ещё не настроена."
      : status === 401 ? "Необходимо войти в аккаунт."
      : "Недостаточно прав для управления магазином.",
  }, { status, headers: { "Cache-Control": "no-store" } });
}
