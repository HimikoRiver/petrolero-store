import "server-only";
import { getPrisma } from "@/lib/prisma";
import { CATALOG_PRODUCTS, type CatalogProduct } from "@/features/catalog/data/catalogData";

/**
 * Without a configured DB, keep the existing isolated demo for presentation.
 * Once PostgreSQL is connected, ONLY products published in the admin panel
 * become visible to buyers; no demo products are seeded into a live store.
 */
export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!process.env.DATABASE_URL) return [...CATALOG_PRODUCTS];
  const rows = await getPrisma().product.findMany({
    where: { published: true, archivedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCatalogProduct);
}

export function toCatalogProduct(row: {
  id: string; slug: string; title: string; sku: string; category: string;
  description: string; packaging: string; image: string | null;
  galleryImages: string[]; priceKopecks: number | null; stockQuantity: number;
  published: boolean; viscosity: string | null; volumeLiters: number | null;
  acea: string[]; api: string[]; approvals: string[]; ilsac: string[]; createdAt: Date;
}): CatalogProduct {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    sku: row.sku,
    category: row.category as CatalogProduct["category"],
    description: row.description,
    packaging: row.packaging as CatalogProduct["packaging"],
    image: row.image,
    gallery: [
      ...(row.image ? [{ kind: "image" as const, src: row.image, label: "Основное фото" }] : []),
      ...row.galleryImages.map((src, index) => ({
        kind: "image" as const, src, label: "Фото " + (index + 2),
      })),
    ],
    priceKopecks: row.priceKopecks,
    stockQuantity: row.stockQuantity,
    published: row.published,
    viscosity: row.viscosity ?? undefined,
    volumeLiters: row.volumeLiters ?? undefined,
    acea: row.acea, api: row.api,
    approvals: row.approvals, ilsac: row.ilsac,
    createdAt: row.createdAt.toISOString(),
    isDemo: false,
  };
}
