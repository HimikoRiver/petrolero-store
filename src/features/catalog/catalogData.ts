/**
 * UI-facing product contract. The storage adapter will be connected when
 * the admin panel and database are implemented. No fictional inventory.
 */
export type ProductCategory = "passenger" | "motorcycle" | "commercial" | "additives";
export type CatalogSelection = ProductCategory | "all";

export interface CatalogProduct {
  id: string;
  slug: string;
  title: string;
  sku: string;
  category: ProductCategory;
  description: string;
  image: string | null;
  priceKopecks: number | null;
  stockQuantity: number;
  published: boolean;
  viscosity?: string;
  volumeLiters?: number;
  createdAt: string;
}

export interface CatalogCategoryInfo {
  id: ProductCategory;
  index: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const CATALOG_CATEGORIES: readonly CatalogCategoryInfo[] = [
  {
    id: "passenger",
    index: "01",
    title: "Легковые",
    description: "Моторные масла для легковых автомобилей",
    image: "/home/images/cards/1.webp",
    imageAlt: "Легковой автомобиль",
  },
  {
    id: "motorcycle",
    index: "02",
    title: "Мото",
    description: "Моторные масла для мототехники",
    image: "/home/images/cards/2.webp",
    imageAlt: "Мотоцикл",
  },
  {
    id: "commercial",
    index: "03",
    title: "Грузовые",
    description: "Моторные масла для грузового транспорта",
    image: "/home/images/cards/3.webp",
    imageAlt: "Грузовой автомобиль",
  },
  {
    id: "additives",
    index: "04",
    title: "Присадки",
    description: "Составы для обслуживания двигателя",
    image: "/menu/images/1.webp",
    imageAlt: "Продукция Petrolero",
  },
] as const;

// Published products will be supplied by the server-side catalog repository.
// Intentionally empty until the admin panel is connected.
export const CATALOG_PRODUCTS: readonly CatalogProduct[] = [];
