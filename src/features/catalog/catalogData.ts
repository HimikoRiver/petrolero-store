/**
 * Frontend catalog contract. Demo inventory is isolated in this file.
 * Replace DEMO_PRODUCTS with a server-side repository when admin/API go live.
 */
export type ProductCategory = "passenger" | "motorcycle" | "commercial" | "additives";
export type CatalogSelection = ProductCategory | "all";
export type ProductPackaging = "drum" | "canister" | "bottle";

/** Extra angles are kept separate from the product's cover image. */
export type CatalogGalleryFrame =
  | { kind: "image"; src: string; label: string }
  | { kind: "sprite"; src: string; label: string; index: number; columns: number };

export interface CatalogProduct {
  id: string;
  slug: string;
  title: string;
  sku: string;
  category: ProductCategory;
  description: string;
  image: string | null;
  gallery?: readonly CatalogGalleryFrame[];
  packaging: ProductPackaging;
  priceKopecks: number | null;
  stockQuantity: number;
  published: boolean;
  viscosity?: string;
  volumeLiters?: number;
  acea: string[];
  api: string[];
  approvals: string[];
  ilsac: string[];
  createdAt: string;
  isDemo: boolean;
}

export interface CatalogCategoryInfo {
  id: Exclude<ProductCategory, "additives">;
  index: string;
  title: string;
  description: string;
}

export const CATALOG_CATEGORIES: readonly CatalogCategoryInfo[] = [
  { id: "passenger", index: "01", title: "Легковые масла", description: "Для легковых автомобилей" },
  { id: "motorcycle", index: "02", title: "Мото масла", description: "Для мотоциклов" },
  { id: "commercial", index: "03", title: "Грузовые автомобили", description: "Для коммерческого транспорта" },
];

type DemoInput = Omit<CatalogProduct, "isDemo" | "published" | "image" | "createdAt" | "stockQuantity" | "description"> & {
  image?: string;
  description?: string;
};

const DEMO_OIL_IMAGE = "/catalog/products/oils/petrolero-drum.avif";

const DEMO_ADDITIVE_IMAGES = {
  caremaker: "/catalog/products/additives/caremaker-5.avif",
  extraLife: "/catalog/products/additives/extra-life-2.avif",
  fullThrottle: "/catalog/products/additives/full-throttle-6.avif",
  performance: "/catalog/products/additives/performance-1.avif",
  turboBoost: "/catalog/products/additives/turbo-boost.avif",
} as const;

const ADDITIVE_ANGLE_LABELS = [
  "Вид спереди",
  "Вид сбоку",
  "Задняя этикетка",
  "Сторона с тиснением",
] as const;

/**
 * All frames share one transparent 4-column atlas. Their identical canvas
 * coordinates prevent bottle movement while scrubbing across the product.
 */
const additiveAngleGallery = (slug: string): readonly CatalogGalleryFrame[] => {
  const src = `/catalog/products/additives/${slug}-angles.webp`;
  return ADDITIVE_ANGLE_LABELS.map((label, index) => ({
    kind: "sprite" as const,
    src, label, index, columns: 4,
  }));
};

const createDemoProduct = (product: DemoInput): CatalogProduct => ({
  ...product,
  description: product.description ?? (product.category === "additives" ? "Присадка Petrolero. Характеристики представлены ниже." : "Моторное масло Petrolero. Характеристики представлены ниже."),
  image: product.image ?? (product.category === "additives" ? null : DEMO_OIL_IMAGE),
  published: true,
  stockQuantity: 12,
  isDemo: true,
  createdAt: "2026-11-01T00:00:00Z",
});

/** Временные демонстрационные товары и цены, не коммерческое предложение. */
export const DEMO_PRODUCTS: readonly CatalogProduct[] = [
  createDemoProduct({
    id: "demo-fusion", slug: "demo-fusion-5w30", title: "PETROLERO FUSION 5W-30",
    sku: "DEMO-FU-530", category: "passenger", packaging: "drum", priceKopecks: 750000,
    viscosity: "5W-30", volumeLiters: 20, acea: ["A5/B5", "A1/B1"], api: ["SP", "SN/CF"],
    approvals: ["BMW LL-01", "FORD WSS-M2C913-D"], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-elite", slug: "demo-elite-5w30", title: "PETROLERO ELITE 5W-30",
    sku: "DEMO-EL-530", category: "passenger", packaging: "drum", priceKopecks: 800000,
    viscosity: "5W-30", volumeLiters: 20, acea: ["C3"], api: ["SN"],
    approvals: ["VW 504.00/507.00", "BMW LL-04", "MB 229.51"], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-hurricane", slug: "demo-hurricane-5w30", title: "PETROLERO HURRICANE 5W-30",
    sku: "DEMO-HU-530", category: "passenger", packaging: "drum", priceKopecks: 790000,
    viscosity: "5W-30", volumeLiters: 20, acea: ["A3/B4"], api: ["SP", "SN/CF"],
    approvals: ["MB 229.5", "VW 502.00/505.00"], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-ninja", slug: "demo-ninja-5w30", title: "PETROLERO NINJA 5W-30",
    sku: "DEMO-NI-530", category: "passenger", packaging: "canister", priceKopecks: 259000,
    viscosity: "5W-30", volumeLiters: 4, acea: [], api: ["SP"],
    approvals: [], ilsac: ["GF-6A"],
  }),
  createDemoProduct({
    id: "demo-new-era", slug: "demo-new-era-0w20", title: "PETROLERO NEW ERA 0W-20",
    sku: "DEMO-NE-020", category: "passenger", packaging: "canister", priceKopecks: 279000,
    viscosity: "0W-20", volumeLiters: 4, acea: [], api: ["SP"],
    approvals: [], ilsac: ["GF-6A"],
  }),
  createDemoProduct({
    id: "demo-moto-1", slug: "demo-moto-10w40", title: "PETROLERO MOTO 4T 10W-40",
    sku: "DEMO-MT-1040", category: "motorcycle", packaging: "canister", priceKopecks: 195000,
    viscosity: "10W-40", volumeLiters: 4, acea: [], api: ["SN"],
    approvals: [], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-moto-2", slug: "demo-moto-5w40", title: "PETROLERO MOTO 4T 5W-40",
    sku: "DEMO-MT-540", category: "motorcycle", packaging: "bottle", priceKopecks: 69000,
    viscosity: "5W-40", volumeLiters: 1, acea: [], api: ["SN"],
    approvals: [], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-heavy-e9", slug: "demo-heavy-e9-10w30", title: "PETROLERO HEAVY DUTY E9 10W-30",
    sku: "DEMO-HD-E9", category: "commercial", packaging: "drum", priceKopecks: 790000,
    viscosity: "10W-30", volumeLiters: 20, acea: ["E9"], api: ["CK-4"],
    approvals: ["VOLVO VDS-4.5"], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-heavy-e7", slug: "demo-heavy-e7-15w40", title: "PETROLERO HEAVY DUTY E7 15W-40",
    sku: "DEMO-HD-E7", category: "commercial", packaging: "drum", priceKopecks: 750000,
    viscosity: "15W-40", volumeLiters: 20, acea: ["E7"], api: ["CI-4"],
    approvals: ["MB 228.3"], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-heavy-e6", slug: "demo-heavy-e6-10w40", title: "PETROLERO HEAVY DUTY E6 10W-40",
    sku: "DEMO-HD-E6", category: "commercial", packaging: "drum", priceKopecks: 800000,
    viscosity: "10W-40", volumeLiters: 20, acea: ["E6"], api: ["CJ-4"],
    approvals: ["MAN M 3477"], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-caremaker", slug: "demo-caremaker-5", title: "PETROLERO CAREMAKER 5",
    sku: "DEMO-AD-CM5", category: "additives", packaging: "bottle",
    image: DEMO_ADDITIVE_IMAGES.caremaker,
    gallery: additiveAngleGallery("caremaker-5"), priceKopecks: 139000,
    volumeLiters: .25, acea: [], api: [], approvals: [], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-full-throttle", slug: "demo-full-throttle-6", title: "PETROLERO FULL THROTTLE 6",
    sku: "DEMO-AD-FT6", category: "additives", packaging: "bottle",
    image: DEMO_ADDITIVE_IMAGES.fullThrottle,
    gallery: additiveAngleGallery("full-throttle-6"), priceKopecks: 159000,
    volumeLiters: .25, acea: [], api: [], approvals: [], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-performance", slug: "demo-performance-1", title: "PETROLERO PERFORMANCE 1",
    sku: "DEMO-AD-P1", category: "additives", packaging: "bottle",
    image: DEMO_ADDITIVE_IMAGES.performance,
    gallery: additiveAngleGallery("performance-1"), priceKopecks: 139000,
    volumeLiters: .25, acea: [], api: [], approvals: [], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-extra-life", slug: "demo-extra-life-2", title: "PETROLERO EXTRA LIFE 2",
    sku: "DEMO-AD-EL2", category: "additives", packaging: "bottle",
    image: DEMO_ADDITIVE_IMAGES.extraLife,
    gallery: additiveAngleGallery("extra-life-2"),
    priceKopecks: 149000,
    volumeLiters: .25, acea: [], api: [], approvals: [], ilsac: [],
  }),
  createDemoProduct({
    id: "demo-turbo", slug: "demo-turbo-boost", title: "PETROLERO TURBO BOOST",
    sku: "DEMO-AD-TB3", category: "additives", packaging: "bottle",
    image: DEMO_ADDITIVE_IMAGES.turboBoost,
    gallery: additiveAngleGallery("turbo-boost"), priceKopecks: 159000,
    volumeLiters: .25, acea: [], api: [], approvals: [], ilsac: [],
  }),
];

export const CATALOG_PRODUCTS: readonly CatalogProduct[] = DEMO_PRODUCTS;
