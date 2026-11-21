import type { Metadata } from "next";
import HelpCenterPage from "@/features/help/HelpCenterPage";

export const metadata: Metadata = {
  title: "Частые вопросы — Petrolero",
  description: "Ответы о продукции, оформлении заказов и работе магазина Petrolero.",
};

export default function FaqPage() {
  return <HelpCenterPage topic="faq" />;
}
