import { adminError, adminIdentity } from "@/lib/admin-auth";
import { isTrustedWrite, jsonError } from "@/lib/account-api";
import { getPrisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/product-validation";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  const admin = await adminIdentity(request.headers);
  if (!admin.userId) return adminError(admin.status);
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);
  const { id } = await params;
  if (!id || id.length > 128) return jsonError("Товар не найден.", 404);

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Некорректные данные.", 400); }
  const parsed = parseProduct(body);
  if (!parsed.data) return jsonError(parsed.error || "Ошибка проверки карточки.", 400);
  const db = getPrisma();
  const old = await db.product.findFirst({ where: { id, archivedAt: null }, select: { id: true } });
  if (!old) return jsonError("Товар не найден.", 404);
  const duplicate = await db.product.findFirst({
    where: { id: { not: id }, OR: [{ sku: parsed.data.sku }, { slug: parsed.data.slug }] },
    select: { id: true },
  });
  if (duplicate) return jsonError("Такой артикул или адрес товара уже существует.", 409);
  try {
    const product = await db.product.update({ where: { id }, data: parsed.data });
    return Response.json({ product }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("Не удалось сохранить товар.", 409);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const admin = await adminIdentity(request.headers);
  if (!admin.userId) return adminError(admin.status);
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);
  const { id } = await params;
  if (!id || id.length > 128) return jsonError("Товар не найден.", 404);
  const found = await getPrisma().product.updateMany({
    where: { id, archivedAt: null },
    data: { published: false, archivedAt: new Date() },
  });
  if (!found.count) return jsonError("Товар не найден.", 404);
  // Archived product snapshots remain in historic demo orders.
  return Response.json({ archived: true }, { headers: { "Cache-Control": "no-store" } });
}
