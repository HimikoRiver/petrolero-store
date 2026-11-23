import { adminError, adminIdentity } from "@/lib/admin-auth";
import { isTrustedWrite, jsonError, readJsonLimited } from "@/lib/account-api";
import { adminCustomerDetails } from "@/lib/admin-management";
import { getPrisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };
const select = {
  id: true, name: true, email: true, phone: true,
  emailVerified: true, createdAt: true, adminNote: true,
  addresses: { orderBy: { isDefault: "desc" as const },
    select: {
      id: true, label: true, recipient: true, phone: true,
      city: true, street: true, apartment: true, postalCode: true, isDefault: true,
    },
  },
  demoOrders: {
    orderBy: { createdAt: "desc" as const }, take: 10,
    select: {
      id: true, reference: true, createdAt: true,
      subtotalKopecks: true, reviewStatus: true,
    },
  },
  _count: { select: {
    demoOrders: true, addresses: true, favorites: true,
  } },
} as const;

export async function GET(request: Request, { params }: Context) {
  const admin = await adminIdentity(request.headers);
  if (!admin.userId) return adminError(admin.status);
  const { id } = await params;
  if (!id || id.length > 128) return jsonError("Покупатель не найден.", 404);
  const customer = await getPrisma().user.findFirst({
    where: { id, role: "CUSTOMER" }, select,
  });
  if (!customer) return jsonError("Покупатель не найден.", 404);
  return Response.json({ customer: adminCustomerDetails(customer) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(request: Request, { params }: Context) {
  const admin = await adminIdentity(request.headers);
  if (!admin.userId) return adminError(admin.status);
  if (!isTrustedWrite(request)) return jsonError("Недопустимый источник запроса.", 403);
  const { id } = await params;
  if (!id || id.length > 128) return jsonError("Покупатель не найден.", 404);
  let body: unknown;
  try { body = await readJsonLimited(request); } catch { return jsonError("Некорректные данные.", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      Object.keys(body).length !== 1 || !("adminNote" in body)) {
    return jsonError("Разрешено изменять только внутреннюю заметку.", 400);
  }
  const note = (body as { adminNote: unknown }).adminNote;
  if (typeof note !== "string" || note.length > 2000) {
    return jsonError("Заметка должна содержать не более 2000 символов.", 400);
  }
  const db = getPrisma();
  const customer = await db.user.findFirst({ where: { id, role: "CUSTOMER" },
    select: { id: true } });
  if (!customer) return jsonError("Покупатель не найден.", 404);
  await db.user.update({
    where: { id }, data: { adminNote: note.trim() || null },
  });
  const refreshed = await db.user.findUnique({ where: { id }, select });
  if (!refreshed) return jsonError("Покупатель не найден.", 404);
  return Response.json({ customer: adminCustomerDetails(refreshed) }, {
    headers: { "Cache-Control": "no-store" },
  });
}
