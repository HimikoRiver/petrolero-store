import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import CatalogPage from "@/features/catalog/CatalogPage";
import { getCatalogProducts } from "@/lib/product-repository";

export const metadata: Metadata = {
  title: "Каталог моторных масел и присадок — Petrolero",
  description: "Моторные масла Petrolero для автомобилей, мотоциклов и грузового транспорта, а также присадки.",
};

async function CatalogContent() {
  await connection();
  const products = await getCatalogProducts();
  return <CatalogPage catalogProducts={products} />;
}

export default function CatalogRoute() {
  return (
    <Suspense fallback={<main className="pa-loading" role="status">Загрузка каталога…</main>}>
      <CatalogContent />
    </Suspense>
  );
}
