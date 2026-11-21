"use client";

import { useEffect, useState } from "react";
import type { CartLine } from "../types";

export type CartProduct = { id: string; priceKopecks: number | null; stockQuantity?: number; isDemo?: boolean };
const STORAGE_KEY = "petrolero-demo-cart";
const MAX_QUANTITY = 20;
const limitFor = (product: CartProduct) => product.isDemo
  ? MAX_QUANTITY : Math.min(MAX_QUANTITY, Math.max(0, product.stockQuantity ?? 0));

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
          const product = products.find(p => p.id === item.id);
          if (!product) continue;
          const quantity = Math.min(limitFor(product), (counts.get(item.id) ?? 0) + (item.quantity as number));
          if (quantity > 0) counts.set(item.id, quantity);
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
    const product = products.find(product => product.id === id);
    if (!product || !Number.isInteger(delta)) return;
    const limit = limitFor(product);
    setCartLines((current) => {
      const existing = current.find((line) => line.id === id);
      if (!existing) {
        return delta > 0 && limit > 0 ? [...current, { id, quantity: Math.min(limit, delta) }] : current;
      }
      return current
        .map((line) => line.id === id
          ? { ...line, quantity: Math.min(limit, Math.max(0, line.quantity + delta)) }
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
