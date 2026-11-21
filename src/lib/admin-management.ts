import "server-only";
import type {
  AdminCustomerDetails, AdminCustomerSummary, AdminOrderDetails,
  AdminOrderSummary, ReviewStatus,
} from "@/features/admin/data/types";

export function adminOrderSummary(row: {
  id: string; reference: string; createdAt: Date; recipient: string; phone: string;
  subtotalKopecks: number; reviewStatus: string; staffNote: string | null;
  reviewedAt: Date | null;
  user: { id: string; name: string; email: string };
  _count: { items: number };
}): AdminOrderSummary {
  return {
    id: row.id, reference: row.reference, createdAt: row.createdAt.toISOString(),
    recipient: row.recipient, phone: row.phone,
    subtotalKopecks: row.subtotalKopecks, reviewStatus: row.reviewStatus as ReviewStatus,
    staffNote: row.staffNote, reviewedAt: row.reviewedAt?.toISOString() ?? null,
    itemCount: row._count.items, buyer: row.user,
  };
}

export function adminOrderDetails(row: Parameters<typeof adminOrderSummary>[0] & {
  city: string; street: string; apartment: string | null; postalCode: string | null;
  note: string | null; reviewedById: string | null;
  items: AdminOrderDetails["items"];
}): AdminOrderDetails {
  return {
    ...adminOrderSummary(row), city: row.city, street: row.street,
    apartment: row.apartment, postalCode: row.postalCode,
    note: row.note, reviewedById: row.reviewedById,
    items: row.items,
  };
}

export function adminCustomerSummary(row: {
  id: string; name: string; email: string; phone: string | null;
  emailVerified: boolean; createdAt: Date;
  _count: { demoOrders: number; addresses: number; favorites: number };
}): AdminCustomerSummary {
  return {
    id: row.id, name: row.name, email: row.email, phone: row.phone,
    emailVerified: row.emailVerified, createdAt: row.createdAt.toISOString(),
    ordersCount: row._count.demoOrders,
    addressesCount: row._count.addresses,
    favoritesCount: row._count.favorites,
  };
}

export function adminCustomerDetails(row: Parameters<typeof adminCustomerSummary>[0] & {
  adminNote: string | null;
  addresses: AdminCustomerDetails["addresses"];
  demoOrders: {
    id: string; reference: string; createdAt: Date;
    subtotalKopecks: number; reviewStatus: string;
  }[];
}): AdminCustomerDetails {
  return {
    ...adminCustomerSummary(row),
    adminNote: row.adminNote,
    addresses: row.addresses,
    orders: row.demoOrders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      reviewStatus: order.reviewStatus as ReviewStatus,
    })),
  };
}

export function searchParamsForAdmin(request: Request) {
  const url = new URL(request.url);
  const rawPage = Number(url.searchParams.get("page") || 1);
  const page = Number.isSafeInteger(rawPage) && rawPage >= 1
    ? Math.min(rawPage, 10000) : 1;
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  return { page, q, params: url.searchParams };
}
