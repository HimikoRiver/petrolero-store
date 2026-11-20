import type { ProductCategory } from "./data/catalogData";

export type Department = "oils" | "additives";
export type OilCategory = "all" | Exclude<ProductCategory, "additives">;
export type SortOrder = "default" | "newest" | "price-asc" | "price-desc";
export type FilterKey = "viscosity" | "acea" | "api" | "approvals" | "ilsac";
export type FilterSelections = Record<FilterKey, string[]>;
export type CartLine = { id: string; quantity: number };
export type CatalogFeedback = { message: string; target?: "cart" | "compare" };
