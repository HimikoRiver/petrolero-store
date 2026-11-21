import { accountPrisma, authAccount, field, isTrustedWrite, jsonError, validPhone } from "@/lib/account-api";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);
  const auth = await authAccount(request);
  if (!auth.userId) return jsonError("Требуется авторизация.", auth.status);

  let input: unknown;
  try { input = await request.json(); } catch { return jsonError("Некорректные данные.", 400); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return jsonError("Некорректные данные.", 400);
  const data = input as Record<string, unknown>;
  const name = field(data.name, 100);
  const phone = field(data.phone ?? "", 32);
  if (!name || name.length < 2 || phone === null || (phone && !validPhone(phone))) {
    return jsonError("Проверьте имя и номер телефона.", 400);
  }

  const user = await accountPrisma().user.update({
    where: { id: auth.userId },
    data: { name, phone: phone || null },
    select: { name: true, phone: true },
  });
  return Response.json({ profile: user }, { headers: { "Cache-Control": "no-store" } });
}
