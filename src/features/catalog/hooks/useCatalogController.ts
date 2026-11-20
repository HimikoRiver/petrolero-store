"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CATALOG_CATEGORIES, CATALOG_PRODUCTS, type CatalogProduct } from "../data/catalogData";
import { FILTERS, EMPTY_FILTERS, SORT_OPTIONS } from "../data/catalogConfig";
import { filterValues } from "../lib/catalogUtils";
import type { Department, OilCategory, SortOrder, FilterKey, FilterSelections, CartLine, CatalogFeedback } from "../types";

export default function useCatalogController() {
  const [department, setDepartment] = useState<Department>("oils");
  const [category, setCategory] = useState<OilCategory>("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [selectedFilters, setSelectedFilters] = useState<FilterSelections>(EMPTY_FILTERS);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [preview, setPreview] = useState<CatalogProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [collectionsReady, setCollectionsReady] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [feedback, setFeedback] = useState<CatalogFeedback | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("petrolero-demo-cart") || "[]") as unknown;
      if (Array.isArray(saved)) {
        const valid = saved.filter((item): item is CartLine =>
          Boolean(item) &&
          typeof item === "object" &&
          "id" in item &&
          "quantity" in item &&
          typeof item.id === "string" &&
          typeof item.quantity === "number" &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          CATALOG_PRODUCTS.some((product) => product.id === item.id),
        );
        setCartLines(valid);
      }
    } catch {
      // Invalid or unavailable localStorage; use an empty demo cart.
    }
    setCartHydrated(true);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem("petrolero-demo-cart", JSON.stringify(cartLines));
    } catch {
      // This demo remains usable when storage is restricted.
    }
  }, [cartLines, cartHydrated]);

  // Favorites and comparison selections are a local demo until accounts are available.
  useEffect(() => {
    try {
      for (const [key, update] of [
        ["petrolero-demo-favorites", setFavoriteIds],
        ["petrolero-demo-comparison", setCompareIds],
      ] as const) {
        const saved: unknown = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(saved)) {
          const uniqueIds = [...new Set(saved.filter(
            (id): id is string => typeof id === "string" && CATALOG_PRODUCTS.some((item) => item.id === id),
          ))];
          update(key === "petrolero-demo-comparison" ? uniqueIds.slice(0, 3) : uniqueIds);
        }
      }
    } catch {
      // Storage may be disabled or contain invalid data.
    }
    setCollectionsReady(true);
  }, []);

  useEffect(() => {
    if (!collectionsReady) return;
    try {
      localStorage.setItem("petrolero-demo-favorites", JSON.stringify(favoriteIds));
      localStorage.setItem("petrolero-demo-comparison", JSON.stringify(compareIds));
    } catch {
      // Keep the demo interactive even with restricted storage.
    }
  }, [collectionsReady, favoriteIds, compareIds]);

  useEffect(() => {
    if (!openFilter) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !filtersRef.current?.contains(event.target)) {
        setOpenFilter(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenFilter(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openFilter]);

  useEffect(() => {
    if (!preview && !cartOpen && !accountOpen && !compareOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreview(null);
        setCartOpen(false);
        setAccountOpen(false);
        setCompareOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [preview, cartOpen, accountOpen, compareOpen]);

  const scopedProducts = useMemo(
    () => CATALOG_PRODUCTS.filter((product) =>
      product.published &&
      (department === "additives"
        ? product.category === "additives"
        : product.category !== "additives" && (category === "all" || product.category === category)),
    ),
    [department, category],
  );

  const filterOptions = useMemo(() => {
    const entries = FILTERS.map(({ key }) => [
      key,
      [...new Set(scopedProducts.flatMap((product) => filterValues(product, key)))].sort(
        (a, b) => a.localeCompare(b, "ru", { numeric: true }),
      ),
    ]);
    return Object.fromEntries(entries) as Record<FilterKey, string[]>;
  }, [scopedProducts]);

  const products = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("ru");
    const filtered = scopedProducts.filter((product) => {
      if (favoritesOnly && !favoriteIds.includes(product.id)) return false;
      if (normalizedSearch && ![
        product.title, product.sku, product.description, product.viscosity || "",
      ].join(" ").toLocaleLowerCase("ru").includes(normalizedSearch)) return false;

      const price = product.priceKopecks === null ? null : product.priceKopecks / 100;
      const from = minPrice === "" ? null : Number(minPrice);
      const to = maxPrice === "" ? null : Number(maxPrice);
      if (from !== null && (price === null || price < from)) return false;
      if (to !== null && (price === null || price > to)) return false;

      return FILTERS.every(({ key }) =>
        selectedFilters[key].length === 0 ||
        selectedFilters[key].some((value) => filterValues(product, key).includes(value)),
      );
    });

    if (sortOrder === "newest") {
      filtered.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    } else if (sortOrder.startsWith("price-")) {
      const direction = sortOrder === "price-asc" ? 1 : -1;
      filtered.sort((a, b) => {
        if (a.priceKopecks === null) return 1;
        if (b.priceKopecks === null) return -1;
        return (a.priceKopecks - b.priceKopecks) * direction;
      });
    }
    return filtered;
  }, [scopedProducts, search, minPrice, maxPrice, selectedFilters, sortOrder, favoritesOnly, favoriteIds]);

  const filterCount = Object.values(selectedFilters).reduce((total, selected) => total + selected.length, 0)
    + Number(Boolean(minPrice || maxPrice));
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const comparedProducts = useMemo(() => compareIds.map((id) => CATALOG_PRODUCTS.find((item) => item.id === id)).filter((item): item is CatalogProduct => Boolean(item)), [compareIds]);
  const cartTotal = cartLines.reduce((sum, line) => {
    const product = CATALOG_PRODUCTS.find((item) => item.id === line.id);
    return sum + (product?.priceKopecks || 0) * line.quantity;
  }, 0);

  const resetFilters = () => {
    setSelectedFilters(EMPTY_FILTERS);
    setMinPrice("");
    setMaxPrice("");
    setOpenFilter(null);
  };

  const changeDepartment = (value: Department) => {
    setDepartment(value);
    setCategory("all");
    resetFilters();
  };

  const changeCategory = (value: OilCategory) => {
    setCategory(value);
    resetFilters();
  };

  const toggleValue = (key: FilterKey, value: string) => {
    setSelectedFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((selected) => selected !== value)
        : [...current[key], value],
    }));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartLines((current) => {
      const existing = current.find((line) => line.id === id);
      if (!existing) return delta > 0 ? [...current, { id, quantity: delta }] : current;
      return current
        .map((line) => line.id === id ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line)
        .filter((line) => line.quantity > 0);
    });
  };

  const addToCart = (product: CatalogProduct) => {
    updateQuantity(product.id, 1);
    setFeedback({ message: "Товар добавлен в корзину", target: "cart" });
  };

  const toggleFavorite = (product: CatalogProduct) => {
    const wasFavorite = favoriteIds.includes(product.id);
    setFavoriteIds((current) => current.includes(product.id)
      ? current.filter((id) => id !== product.id)
      : [...current, product.id],
    );
    setFeedback({ message: wasFavorite ? "Убрано из избранного" : "Добавлено в избранное" });
  };

  const toggleCompare = (product: CatalogProduct) => {
    const alreadyCompared = compareIds.includes(product.id);
    if (!alreadyCompared && compareIds.length >= 3) {
      setFeedback({ message: "Для сравнения можно выбрать до трёх товаров", target: "compare" });
      return;
    }
    setCompareIds((current) => current.includes(product.id)
      ? current.filter((id) => id !== product.id)
      : [...current, product.id],
    );
    setFeedback({
      message: alreadyCompared ? "Убрано из сравнения" : "Добавлено в сравнение",
      target: "compare",
    });
  };

  const heading = department === "additives"
    ? "ПРИСАДКИ"
    : category === "all"
      ? "МОТОРНЫЕ МАСЛА"
      : CATALOG_CATEGORIES.find((item) => item.id === category)?.title.toLocaleUpperCase("ru-RU")
        || "МОТОРНЫЕ МАСЛА";

  const closeLayers = () => {
    setPreview(null);
    setCartOpen(false);
    setAccountOpen(false);
    setCompareOpen(false);
  };


  return { department, category, search, setSearch, sortOrder, setSortOrder, selectedFilters, minPrice, setMinPrice, maxPrice, setMaxPrice, openFilter, setOpenFilter, view, setView, preview, setPreview, cartOpen, setCartOpen, accountOpen, setAccountOpen, cartLines, favoriteIds, compareIds, setCompareIds, favoritesOnly, setFavoritesOnly, compareOpen, setCompareOpen, feedback, setFeedback, filtersRef, filterOptions, products, filterCount, cartCount, comparedProducts, cartTotal, resetFilters, changeDepartment, changeCategory, toggleValue, updateQuantity, addToCart, toggleFavorite, toggleCompare, heading, closeLayers };
}
