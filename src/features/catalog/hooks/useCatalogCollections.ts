"use client";

import { useEffect, useState } from "react";
import useFavoriteProducts from "@/features/favorites/useFavoriteProducts";

type ProductIdentity = { id: string };

export default function useCatalogCollections(products: readonly ProductIdentity[]) {
  const favorites = useFavoriteProducts();
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [comparisonReady, setComparisonReady] = useState(false);

  // Comparison stays a local, three-product demo. Account favorites use
  // the independent shared hook and are never written to guest storage.
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("petrolero-demo-comparison") || "[]");
      if (Array.isArray(saved)) {
        const ids = [...new Set(saved.filter(
          (id): id is string => typeof id === "string" && products.some((item) => item.id === id),
        ))];
        setCompareIds(ids.slice(0, 3));
      }
    } catch {
      // Local storage may be unavailable.
    }
    setComparisonReady(true);
  }, [products]);

  useEffect(() => {
    if (!comparisonReady) return;
    try {
      localStorage.setItem("petrolero-demo-comparison", JSON.stringify(compareIds));
    } catch {
      // Continue running in memory if storage is restricted.
    }
  }, [compareIds, comparisonReady]);

  return { ...favorites, compareIds, setCompareIds };
}
