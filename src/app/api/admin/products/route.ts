import { randomUUID } from "node:crypto";
import { adminError, adminIdentity } from "@/lib/admin-auth";
import { isTrustedWrite, jsonError, readJsonLimited } from "@/lib/account-api";
import { getPrisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/product-validation";

const noCache = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const admin = await adminIdentity(request.headers);
  if (!admin.userId) return adminError(admin.status);
  const items = await getPrisma().product.findMany({
    where: { archivedAt: null }, orderBy: { updatedAt: "desc" }, take: 500,
  });
  return Response.json({ products: items }, { headers: noCache });
}

export async function POST(request: Request) {
  const admin = await adminIdentity(request.headers);
  if (!admin.userId) return adminError(admin.status);
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);

  let body: unknown;
  try { body = await readJsonLimited(request); } catch { return jsonError("Некорректные данные.", 400); }
  const parsed = parseProduct(body);
  if (!parsed.data) return jsonError(parsed.error || "Ошибка проверки карточки.", 400);

  const db = getPrisma();
  const duplicates = await db.product.findFirst({
    where: { OR: [{ sku: parsed.data.sku }, { slug: parsed.data.slug }] },
    select: { id: true },
  });
  if (duplicates) return jsonError("Такой артикул или адрес товара уже существует.", 409);

  try {
    const product = await db.product.create({
      data: { id: randomUUID(), ...parsed.data },
    });
    return Response.json({ product }, { status: 201, headers: noCache });
  } catch {
    return jsonError("Не удалось создать товар. Проверьте уникальность артикула и slug.", 409);
  }
}
