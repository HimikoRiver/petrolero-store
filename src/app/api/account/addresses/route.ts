import { randomUUID } from "node:crypto";
import { accountPrisma, addressInput, authAccount, isTrustedWrite, jsonError } from "@/lib/account-api";

const select = {
  id: true, label: true, recipient: true, phone: true,
  city: true, street: true, apartment: true,
  postalCode: true, isDefault: true,
} as const;

const unavailableMessage = "Требуется авторизация.";

async function userIdOrError(request: Request) {
  const auth = await authAccount(request);
  return auth.userId
    ? { userId: auth.userId, error: null }
    : { userId: null, error: jsonError(unavailableMessage, auth.status) };
}

export async function GET(request: Request) {
  const { userId, error } = await userIdOrError(request);
  if (!userId) return error!;
  const items = await accountPrisma().deliveryAddress.findMany({
    where: { userId },
    select,
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return Response.json({ addresses: items }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);
  const { userId, error } = await userIdOrError(request);
  if (!userId) return error!;

  let data: unknown;
  try { data = await request.json(); } catch { return jsonError("Некорректные данные.", 400); }
  const input = addressInput(data);
  if (!input) return jsonError("Проверьте адрес и контактные данные.", 400);

  const db = accountPrisma();
  const count = await db.deliveryAddress.count({ where: { userId } });
  if (count >= 10) return jsonError("Можно сохранить не больше десяти адресов.", 409);

  const created = await db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.deliveryAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return tx.deliveryAddress.create({
      data: { ...input, id: randomUUID(), userId, isDefault: count === 0 || input.isDefault },
      select,
    });
  });
  return Response.json({ address: created }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);
  const { userId, error } = await userIdOrError(request);
  if (!userId) return error!;

  let data: unknown;
  try { data = await request.json(); } catch { return jsonError("Некорректные данные.", 400); }
  const input = addressInput(data);
  const id = data && typeof data === "object" && !Array.isArray(data) &&
    typeof (data as Record<string, unknown>).id === "string"
    ? (data as { id: string }).id : "";
  if (!input || !id || id.length > 80) return jsonError("Проверьте адрес и контактные данные.", 400);

  const db = accountPrisma();
  const existing = await db.deliveryAddress.findFirst({ where: { id, userId } });
  if (!existing) return jsonError("Адрес не найден.", 404);
  // The only saved address must always be the default.
  const updated = await db.$transaction(async (tx) => {
    const count = await tx.deliveryAddress.count({ where: { userId } });
    if (input.isDefault) {
      await tx.deliveryAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return tx.deliveryAddress.update({
      where: { id, userId },
      data: { ...input, isDefault: count === 1 || input.isDefault || existing.isDefault },
      select,
    });
  });
  return Response.json({ address: updated }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);
  const { userId, error } = await userIdOrError(request);
  if (!userId) return error!;

  let data: unknown;
  try { data = await request.json(); } catch { return jsonError("Некорректные данные.", 400); }
  const id = data && typeof data === "object" && !Array.isArray(data) &&
    typeof (data as Record<string, unknown>).id === "string"
    ? (data as { id: string }).id : "";
  if (!id || id.length > 80) return jsonError("Укажите адрес.", 400);

  const db = accountPrisma();
  const existing = await db.deliveryAddress.findFirst({ where: { id, userId } });
  if (!existing) return jsonError("Адрес не найден.", 404);

  await db.$transaction(async (tx) => {
    await tx.deliveryAddress.delete({ where: { id, userId } });
    if (existing.isDefault) {
      const next = await tx.deliveryAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      if (next) await tx.deliveryAddress.update({
        where: { id: next.id, userId }, data: { isDefault: true },
      });
    }
  });
  return Response.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
}
