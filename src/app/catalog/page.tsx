import type { Metadata } from "next";
import CatalogPage from "@/features/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Каталог моторных масел и присадок — Petrolero",
  description:
    "Моторные масла Petrolero для легковых автомобилей, мототехники, грузового транспорта и присадки.",
};

export default function CatalogRoute() {
  return <CatalogPage />;
}
