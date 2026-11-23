import { adminError, adminIdentity } from "@/lib/admin-auth";
import { adminCustomerSummary, searchParamsForAdmin } from "@/lib/admin-management";
import { getPrisma } from "@/lib/prisma";

const TAKE = 25;

export async function GET(request: Request) {
  const admin = await adminIdentity(request.headers);
  if (!admin.userId) return adminError(admin.status);

  const { page, q, params } = searchParamsForAdmin(request);
  const verified = params.get("verified") ?? "all";
  if (!["all", "yes", "no"].includes(verified)) {
    return Response.json({ error: "Недопустимый фильтр." }, { status: 400 });
  }
  const where = {
    role: "CUSTOMER",
    ...(verified === "all" ? {} : { emailVerified: verified === "yes" }),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
        { phone: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };
  const db = getPrisma();
  const [total, rows] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where, take: TAKE, skip: (page - 1) * TAKE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, phone: true,
        emailVerified: true, isBlocked: true, blockedAt: true, createdAt: true,
        _count: { select: {
          demoOrders: true, addresses: true, favorites: true,
        } },
      },
    }),
  ]);
  return Response.json({
    items: rows.map(adminCustomerSummary), page,
    pages: Math.max(1, Math.ceil(total / TAKE)), total,
  }, { headers: { "Cache-Control": "no-store" } });
}
