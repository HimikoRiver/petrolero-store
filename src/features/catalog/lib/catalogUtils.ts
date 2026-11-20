import type { CatalogProduct } from "../data/catalogData";
import type { FilterKey } from "../types";

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency", currency: "RUB", maximumFractionDigits: 0,
});

export function priceLabel(kopecks: number | null): string {
  return kopecks === null ? "Цена уточняется" : currency.format(kopecks / 100);
}

export function filterValues(product: CatalogProduct, key: FilterKey): string[] {
  return key === "viscosity"
    ? (product.viscosity ? [product.viscosity] : [])
    : product[key];
}
