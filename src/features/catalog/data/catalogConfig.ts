import type { FilterKey, FilterSelections, SortOrder } from "../types";

export const FILTERS: readonly { key: FilterKey; label: string }[] = [
  { key: "viscosity", label: "Вязкость, SAE" },
  { key: "acea", label: "ACEA" },
  { key: "api", label: "API" },
  { key: "approvals", label: "Одобрения" },
  { key: "ilsac", label: "ILSAC" },
];

export const EMPTY_FILTERS: FilterSelections = {
  viscosity: [], acea: [], api: [], approvals: [], ilsac: [],
};

export const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "newest", label: "Сначала новые" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
];

