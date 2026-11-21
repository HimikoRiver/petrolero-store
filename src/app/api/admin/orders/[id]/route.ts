import { adminError, adminIdentity } from "@/lib/admin-auth";
import { jsonError, isTrustedWrite } from "@/lib/account-api";
import { adminOrderDetails } from "@/lib/admin-management";
import { getPrisma } from "@/lib/prisma";
import { REVIEW_STATUSES } from "@/features/admin/data/types";

type Context = { params: Promise<{ id: string }> };
const select = {
  id: true, reference: true, createdAt: true, recipient: true, phone: true,
  city: true, street: true, apartment: true, postalCode: true,
  note: true, subtotalKopecks: true, reviewStatus: true, staffNote: true,
  reviewedAt: true, reviewedById: true,
  items: { select: {
    id: true, productId: true, sku: true, title: true, image: true,
    quantity: true, unitPriceKopecks: true, lineTotalKopecks: true,
  } },
  user: { select: { id: true, name: true, email: true } },
  _count: { select: { items: true } },
} as const;

export async function GET(request: Request, { params }: Context) {
  const admin = await adminIdentity(request.headers);
  if (!admin.userId) return adminError(admin.status);
  const { id } = await params;
  if (!id || id.length > 128) return jsonError("Заявка не найдена.", 404);

  const order = await getPrisma().demoOrder.findUnique({
    where: { id }, select,
  });
  if (!order) return jsonError("Заявка не найдена.", 404);
  return Response.json({ order: adminOrderDetails(order) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(request: Request, { params }: Context) {
  const admin = await adminIdentity(request.headers);
  if (!admin.userId) return adminError(admin.status);
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);
  const { id } = await params;
  if (!id || id.length > 128) return jsonError("Заявка не найдена.", 404);

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Некорректные данные.", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Некорректные данные.", 400);
  }
  const value = body as Record<string, unknown>;
  // Only status and staff note can be edited; prices and buyer data are immutable snapshots.
  if (Object.keys(value).some(key => !["reviewStatus", "staffNote"].includes(key))) {
    return jsonError("Изменять можно только статус и внутреннюю заметку.", 400);
  }
  const status = value.reviewStatus;
  const note = value.staffNote;
  if (!REVIEW_STATUSES.some(s => s.value === status) ||
    typeof note !== "string" || note.length > 2000) {
    return jsonError("Проверьте статус и текст заметки.", 400);
  }

  const db = getPrisma();
  const found = await db.demoOrder.findUnique({ where: { id }, select: { id: true } });
  if (!found) return jsonError("Заявка не найдена.", 404);
  const order = await db.demoOrder.update({
    where: { id },
    data: {
      reviewStatus: status as string,
      staffNote: note.trim() || null,
      reviewedAt: new Date(),
      reviewedById: admin.userId,
    },
    select,
  });
  return Response.json({ order: adminOrderDetails(order) }, {
    headers: { "Cache-Control": "no-store" },
  });
}
