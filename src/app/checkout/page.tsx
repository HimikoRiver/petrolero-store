import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import CheckoutPage from "@/features/checkout/CheckoutPage";
import { getCatalogProducts } from "@/lib/product-repository";

export const metadata: Metadata = {
  title: "Оформление заказа — Petrolero",
  description: "Демонстрационное оформление заказа в Petrolero.",
  robots: { index: false, follow: false },
};

async function CheckoutContent() {
  await connection();
  return <CheckoutPage catalogProducts={await getCatalogProducts()} />;
}

export default function CheckoutRoute() {
  return (
    <StorefrontChrome>
      <Suspense fallback={<main className="pa-loading" role="status">Загрузка корзины…</main>}>
        <CheckoutContent />
      </Suspense>
    </StorefrontChrome>
  );
}
