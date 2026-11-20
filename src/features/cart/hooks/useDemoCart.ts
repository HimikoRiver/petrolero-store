"use client";

import { useEffect, useState } from "react";
import type { CartLine } from "../types";

export type CartProduct = { id: string; priceKopecks: number | null };

export default function useDemoCart(products: readonly CartProduct[]) {
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);

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
          products.some((product) => product.id === item.id),
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


  const updateQuantity = (id: string, delta: number) => {
    setCartLines((current) => {
      const existing = current.find((line) => line.id === id);
      if (!existing) return delta > 0 ? [...current, { id, quantity: delta }] : current;
      return current
        .map((line) => line.id === id ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line)
        .filter((line) => line.quantity > 0);
    });
  };


  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  const cartTotal = cartLines.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.id);
    return sum + (product?.priceKopecks || 0) * line.quantity;
  }, 0);


  return { cartLines, cartCount, cartTotal, updateQuantity };
}
