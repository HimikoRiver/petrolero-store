import type { Metadata } from "next";
import HelpCenterPage from "@/features/help/HelpCenterPage";

export const metadata: Metadata = {
  title: "Доставка и оплата — Petrolero",
  description: "Доставка и оплата заказов Petrolero: информация для покупателей.",
};

export default function DeliveryPaymentPage() {
  return <HelpCenterPage topic="delivery-payment" />;
}
