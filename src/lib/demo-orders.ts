import "server-only";
import { getPrisma } from "@/lib/prisma";
import type { DemoOrder } from "@/features/checkout/types";

export async function findDemoOrders(userId: string, take = 50): Promise<DemoOrder[]> {
  const rows = await getPrisma().demoOrder.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(toDemoOrder);
}

export async function findDemoOrder(userId: string, id: string): Promise<DemoOrder | null> {
  const row = await getPrisma().demoOrder.findFirst({
    where: { id, userId },
    include: { items: true },
  });
  return row ? toDemoOrder(row) : null;
}

function toDemoOrder(row: {
  id: string; reference: string; recipient: string; phone: string;
  city: string; street: string; apartment: string | null;
  postalCode: string | null; note: string | null; subtotalKopecks: number; createdAt: Date;
  items: { id: string; productId: string; sku: string; title: string; image: string | null;
    quantity: number; unitPriceKopecks: number; lineTotalKopecks: number }[];
}): DemoOrder {
  return {
    id: row.id,
    reference: row.reference,
    recipient: row.recipient,
    phone: row.phone,
    city: row.city,
    street: row.street,
    apartment: row.apartment,
    postalCode: row.postalCode,
    note: row.note,
    subtotalKopecks: row.subtotalKopecks,
    createdAt: row.createdAt.toISOString(),
    items: row.items.map(({ id, productId, sku, title, image, quantity, unitPriceKopecks, lineTotalKopecks }) =>
      ({ id, productId, sku, title, image, quantity, unitPriceKopecks, lineTotalKopecks }),
    ),
  };
}
