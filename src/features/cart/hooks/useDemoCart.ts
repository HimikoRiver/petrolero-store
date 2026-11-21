"use client";

import { useEffect, useState } from "react";
import type { CartLine } from "../types";

export type CartProduct = { id: string; priceKopecks: number | null };
const STORAGE_KEY = "petrolero-demo-cart";
const MAX_QUANTITY = 20;

export default function useDemoCart(products: readonly CartProduct[]) {
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as unknown;
        if (!Array.isArray(saved)) return [] as CartLine[];
        const counts = new Map<string, number>();
        for (const item of saved) {
          if (!item || typeof item !== "object" || !("id" in item) || !("quantity" in item)) continue;
          if (typeof item.id !== "string" || !Number.isInteger(item.quantity) ||
              (item.quantity as number) <= 0 || !products.some(p => p.id === item.id)) continue;
          counts.set(item.id, Math.min(MAX_QUANTITY,
            (counts.get(item.id) ?? 0) + (item.quantity as number)));
        }
        return [...counts].map(([id, quantity]) => ({ id, quantity }));
      } catch {
        return [] as CartLine[];
      }
    };
    setCartLines(read());
    setCartHydrated(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setCartLines(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [products]);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartLines));
    } catch {
      // The demo remains functional without localStorage.
    }
  }, [cartLines, cartHydrated]);

  const updateQuantity = (id: string, delta: number) => {
    if (!products.some(product => product.id === id) || !Number.isInteger(delta)) return;
    setCartLines((current) => {
      const existing = current.find((line) => line.id === id);
      if (!existing) {
        return delta > 0 ? [...current, { id, quantity: Math.min(MAX_QUANTITY, delta) }] : current;
      }
      return current
        .map((line) => line.id === id
          ? { ...line, quantity: Math.min(MAX_QUANTITY, Math.max(0, line.quantity + delta)) }
          : line)
        .filter((line) => line.quantity > 0);
    });
  };

  const clearCart = () => {
    setCartLines([]);
    try { localStorage.setItem(STORAGE_KEY, "[]"); } catch { /* storage unavailable */ }
  };

  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cartLines.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.id);
    return sum + (product?.priceKopecks || 0) * line.quantity;
  }, 0);

  return { cartLines, cartCount, cartTotal, cartHydrated, updateQuantity, clearCart };
}
