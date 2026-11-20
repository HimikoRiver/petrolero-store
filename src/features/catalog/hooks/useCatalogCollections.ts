"use client";

import { useEffect, useState } from "react";

type ProductIdentity = { id: string };

export default function useCatalogCollections(products: readonly ProductIdentity[]) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [collectionsReady, setCollectionsReady] = useState(false);

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
            (id): id is string => typeof id === "string" && products.some((item) => item.id === id),
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


  return { favoriteIds, setFavoriteIds, compareIds, setCompareIds };
}
