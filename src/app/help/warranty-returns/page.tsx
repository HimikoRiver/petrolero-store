import type { Metadata } from "next";
import HelpCenterPage from "@/features/help/HelpCenterPage";

export const metadata: Metadata = {
  title: "Гарантия и возврат — Petrolero",
  description: "Информация о гарантии, обращениях, обмене и возврате продукции Petrolero.",
};

export default function WarrantyReturnsPage() {
  return <HelpCenterPage topic="warranty-returns" />;
}
