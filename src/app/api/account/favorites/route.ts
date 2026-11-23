import { accountPrisma, authAccount, isTrustedWrite, jsonError, readJsonLimited } from "@/lib/account-api";
import { getCatalogProducts } from "@/lib/product-repository";

async function allowedIds() {
  return new Set((await getCatalogProducts()).map((item) => item.id));
}
const MAX_FAVORITES = 100;

function validId(value: unknown, allowed: ReadonlySet<string>): value is string {
  return typeof value === "string" && value.length > 0 &&
    value.length <= 128 && allowed.has(value);
}

function favorites(userId: string, allowed: ReadonlySet<string>) {
  return accountPrisma().favorite.findMany({
    where: { userId },
    orderBy: [{ createdAt: "asc" }, { productId: "asc" }],
    select: { productId: true },
  }).then((items) => items.map((item) => item.productId).filter((id) => allowed.has(id)));
}

function success(ids: string[]) {
  return Response.json({ ids }, { headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const auth = await authAccount(request);
  if (!auth.userId) return jsonError("Требуется авторизация.", auth.status);
  return success(await favorites(auth.userId, await allowedIds()));
}

export async function POST(request: Request) {
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);
  const auth = await authAccount(request);
  if (!auth.userId) return jsonError("Требуется авторизация.", auth.status);

  let body: unknown;
  try { body = await readJsonLimited(request); } catch { return jsonError("Некорректный запрос.", 400); }
  if (!body || Array.isArray(body) || typeof body !== "object") {
    return jsonError("Некорректный запрос.", 400);
  }
  const data = body as Record<string, unknown>;
  if (data.ownerId !== undefined && data.ownerId !== auth.userId) {
    return jsonError("Аккаунт изменился. Обновите страницу.", 403);
  }
  // A batch operation merges a guest list into the account without replacing
  // favorites saved from other devices.
  const submitted = Array.isArray(data.ids) ? data.ids : [data.id];
  if (submitted.length > MAX_FAVORITES || !submitted.every((item) => typeof item === "string" && item.length <= 128)) {
    return jsonError("Некорректные идентификаторы товаров.", 400);
  }
  const allowed = await allowedIds();
  if (!submitted.every((item) => validId(item, allowed))) {
    return jsonError("Товар больше не доступен.", 400);
  }
  const unique = [...new Set(submitted)];
  if (unique.length) {
    await accountPrisma().favorite.createMany({
      data: unique.map((productId) => ({ userId: auth.userId!, productId })),
      skipDuplicates: true,
    });
  }
  return success(await favorites(auth.userId, await allowedIds()));
}

export async function DELETE(request: Request) {
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);
  const auth = await authAccount(request);
  if (!auth.userId) return jsonError("Требуется авторизация.", auth.status);

  let body: unknown;
  try { body = await readJsonLimited(request); } catch { return jsonError("Некорректный запрос.", 400); }
  const id = body && typeof body === "object" && !Array.isArray(body)
    ? (body as Record<string, unknown>).id : null;
  if (body && typeof body === "object" && !Array.isArray(body) &&
    "ownerId" in body && (body as { ownerId: unknown }).ownerId !== auth.userId) {
    return jsonError("Аккаунт изменился. Обновите страницу.", 403);
  }
  if (typeof id !== "string" || id.length < 1 || id.length > 128) {
    return jsonError("Некорректный идентификатор товара.", 400);
  }
  await accountPrisma().favorite.deleteMany({
    where: { userId: auth.userId, productId: id },
  });
  return success(await favorites(auth.userId, await allowedIds()));
}
