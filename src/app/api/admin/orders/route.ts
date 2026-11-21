import { adminError, adminIdentity } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { adminOrderSummary, searchParamsForAdmin } from "@/lib/admin-management";
import type { ReviewStatus } from "@/features/admin/data/types";

const TAKE = 25;

export async function GET(request: Request) {
  const admin = await adminIdentity(request.headers);
  if (!admin.userId) return adminError(admin.status);

  const { page, q, params } = searchParamsForAdmin(request);
  const status = params.get("status") ?? "all";
  if (!["all", "NEW", "REVIEWED", "CLOSED"].includes(status)) {
    return Response.json({ error: "Недопустимый фильтр." }, { status: 400 });
  }
  const where = {
    ...(status === "all" ? {} : { reviewStatus: status as ReviewStatus }),
    ...(q ? {
      OR: [
        { reference: { contains: q, mode: "insensitive" as const } },
        { recipient: { contains: q, mode: "insensitive" as const } },
        { phone: { contains: q, mode: "insensitive" as const } },
        { user: { email: { contains: q, mode: "insensitive" as const } } },
      ],
    } : {}),
  };
  const db = getPrisma();
  const [total, rows] = await Promise.all([
    db.demoOrder.count({ where }),
    db.demoOrder.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * TAKE,
      take: TAKE,
      select: {
        id: true, reference: true, createdAt: true, recipient: true, phone: true,
        subtotalKopecks: true, reviewStatus: true, staffNote: true, reviewedAt: true,
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
  ]);
  return Response.json({
    items: rows.map(adminOrderSummary), page,
    pages: Math.max(1, Math.ceil(total / TAKE)), total,
  }, { headers: { "Cache-Control": "no-store" } });
}
