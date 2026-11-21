import type { CatalogProduct } from "@/features/catalog/data/catalogData";

export const PRODUCT_CATEGORIES = ["passenger","motorcycle","commercial","additives"] as const;
export const PRODUCT_PACKAGING = ["drum","canister","bottle"] as const;

export type ProductInput = {
  title: string;
  slug: string;
  sku: string;
  category: CatalogProduct["category"];
  description: string;
  packaging: CatalogProduct["packaging"];
  image: string | null;
  galleryImages: string[];
  priceKopecks: number | null;
  stockQuantity: number;
  published: boolean;
  viscosity: string | null;
  volumeLiters: number | null;
  acea: string[];
  api: string[];
  approvals: string[];
  ilsac: string[];
};

export function allowedProductImage(value: string) {
  // Local public/ paths and HTTPS image URLs. No data:, javascript: or HTTP.
  if (value.startsWith("/")) return /^\/(?!\/)[\w./%-]+$/.test(value) &&
    !value.split("/").includes("..");
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      url.hostname.length > 3 && url.href.length <= 1000;
  } catch { return false; }
}

function text(data: Record<string, unknown>, key: string, max: number) {
  const value = data[key];
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length <= max ? cleaned : null;
}

function tags(value: unknown) {
  return Array.isArray(value) && value.length <= 30 && value.every(
    (v) => typeof v === "string" && v.trim().length <= 80,
  ) ? [...new Set(value.map((v: string) => v.trim()).filter(Boolean))] : null;
}

export function parseProduct(input: unknown): { data?: ProductInput; error?: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Неверный формат карточки." };
  }
  const value = input as Record<string, unknown>;
  const title = text(value, "title", 180);
  const slug = text(value, "slug", 120)?.toLowerCase();
  const sku = text(value, "sku", 80)?.toUpperCase();
  const description = text(value, "description", 3000);
  const viscosity = value.viscosity == null || value.viscosity === ""
    ? null : text(value, "viscosity", 50);
  const image = value.image == null || value.image === ""
    ? null : text(value, "image", 1000);
  const galleryImages = value.galleryImages;
  const acea = tags(value.acea);
  const api = tags(value.api);
  const approvals = tags(value.approvals);
  const ilsac = tags(value.ilsac);
  const volumeLiters = value.volumeLiters === null || value.volumeLiters === ""
    ? null : value.volumeLiters;
  const price = value.priceKopecks === null || value.priceKopecks === ""
    ? null : value.priceKopecks;
  const stock = value.stockQuantity;
  const category = value.category;
  const packaging = value.packaging;
  if (!title || title.length < 3 || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      !sku || !/^[A-Z0-9][A-Z0-9._-]*$/.test(sku) ||
      description === null || description.length < 10 ||
      !PRODUCT_CATEGORIES.includes(category as typeof PRODUCT_CATEGORIES[number]) ||
      !PRODUCT_PACKAGING.includes(packaging as typeof PRODUCT_PACKAGING[number]) ||
      image === null && value.image !== null && value.image !== "" && value.image !== undefined ||
      (image !== null && !allowedProductImage(image)) ||
      !Array.isArray(galleryImages) || galleryImages.length > 10 ||
      !galleryImages.every((url: unknown) => typeof url === "string" && allowedProductImage(url)) ||
      !acea || !api || !approvals || !ilsac ||
      (price !== null && (!Number.isSafeInteger(price) || (price as number) < 0 || (price as number) > 1_000_000_000)) ||
      !Number.isInteger(stock) || (stock as number) < 0 || (stock as number) > 1000000 ||
      (volumeLiters !== null && (typeof volumeLiters !== "number" || !Number.isFinite(volumeLiters) ||
      volumeLiters <= 0 || volumeLiters > 100000)) ||
      viscosity === null && value.viscosity != null && value.viscosity !== "" ||
      typeof value.published !== "boolean") {
    return { error: "Проверьте название, артикул, slug, цену, изображения и характеристики." };
  }
  // An item cannot go live without a price and a product photo.
  if (value.published && (price === null || !image)) {
    return { error: "Для публикации необходимы цена и основное изображение." };
  }
  return {
    data: {
      title, slug, sku, category: category as ProductInput["category"],
      description, packaging: packaging as ProductInput["packaging"],
      image, galleryImages: galleryImages as string[],
      priceKopecks: price as number | null,
      stockQuantity: stock as number,
      published: value.published,
      viscosity, volumeLiters: volumeLiters as number | null,
      acea, api, approvals, ilsac,
    },
  };
}
