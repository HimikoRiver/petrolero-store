import { randomUUID } from "node:crypto";
import { accountPrisma, authAccount, field, isTrustedWrite, jsonError, validPhone } from "@/lib/account-api";
import { getCatalogProducts } from "@/lib/product-repository";
import { findDemoOrders } from "@/lib/demo-orders";



export async function GET(request: Request) {
  const auth = await authAccount(request);
  if (!auth.userId) return jsonError("Требуется авторизация.", auth.status);
  return Response.json({ orders: await findDemoOrders(auth.userId) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const auth = await authAccount(request);
  if (!auth.userId) return jsonError("Требуется авторизация.", auth.status);
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);

  let raw: unknown;
  try { raw = await request.json(); } catch { return jsonError("Некорректный запрос.", 400); }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return jsonError("Некорректный запрос.", 400);
  }
  const body = raw as Record<string, unknown>;
  const recipient = field(body.recipient, 100);
  const phone = field(body.phone, 32);
  const city = field(body.city, 120);
  const street = field(body.street, 180);
  const apartment = field(body.apartment ?? "", 50);
  const postalCode = field(body.postalCode ?? "", 16);
  const note = field(body.note ?? "", 500);
  if (!recipient || !phone || !validPhone(phone) || !city || !street ||
      apartment === null || postalCode === null || note === null ||
      (postalCode && !/^[\dA-Za-z \-]{3,16}$/.test(postalCode))) {
    return jsonError("Проверьте контактные данные и адрес.", 400);
  }

  const lines = body.lines;
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 30) {
    return jsonError("Корзина должна содержать от 1 до 30 позиций.", 400);
  }
  const productMap = new Map((await getCatalogProducts()).map((product) => [product.id, product]));
  const unique = new Set<string>();
  let itemsTotal = 0;
  let unitCount = 0;
  const items: {
    id: string; productId: string; sku: string; title: string; image: string | null;
    quantity: number; unitPriceKopecks: number; lineTotalKopecks: number;
  }[] = [];

  for (const item of lines) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return jsonError("Некорректная позиция корзины.", 400);
    }
    const { id, quantity } = item as Record<string, unknown>;
    if (typeof id !== "string" || !Number.isInteger(quantity) ||
        (quantity as number) < 1 || (quantity as number) > 20 || unique.has(id)) {
      return jsonError("Проверьте количество и уникальность товаров.", 400);
    }
    const product = productMap.get(id);
    if (!product || product.priceKopecks === null || !Number.isInteger(product.priceKopecks) ||
        product.priceKopecks < 0) {
      return jsonError("Один из товаров недоступен.", 400);
    }
    if (!product.isDemo && (quantity as number) > product.stockQuantity) {
      return jsonError("Недостаточно товара для тестовой заявки.", 400);
    }
    unique.add(id);
    unitCount += quantity as number;
    const lineTotalKopecks = product.priceKopecks * (quantity as number);
    itemsTotal += lineTotalKopecks;
    if (!Number.isSafeInteger(itemsTotal) || itemsTotal > 1_000_000_000 || unitCount > 100) {
      return jsonError("Превышен допустимый объём демонстрационной корзины.", 400);
    }
    items.push({
      id: randomUUID(),
      productId: id,
      sku: product.sku,
      title: product.title,
      image: product.image,
      quantity: quantity as number,
      unitPriceKopecks: product.priceKopecks,
      lineTotalKopecks,
    });
  }

  const db = accountPrisma();
  if (await db.demoOrder.count({ where: { userId: auth.userId } }) >= 100) {
    return jsonError("Лимит тестовых заказов достигнут.", 409);
  }
  const id = randomUUID();
  const order = await db.demoOrder.create({
    data: {
      id,
      reference: "DEMO-" + id.slice(0, 8).toUpperCase(),
      userId: auth.userId,
      recipient, phone, city, street,
      apartment: apartment || null,
      postalCode: postalCode || null,
      note: note || null,
      subtotalKopecks: itemsTotal,
      items: { create: items },
    },
    select: { id: true, reference: true },
  });
  return Response.json({ order }, {
    status: 201,
    headers: { "Cache-Control": "no-store" },
  });
}
