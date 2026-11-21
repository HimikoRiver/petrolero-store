import type { Metadata } from "next";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import CheckoutPage from "@/features/checkout/CheckoutPage";

export const metadata: Metadata = {
  title: "Оформление заказа — Petrolero",
  description: "Демонстрационное оформление заказа в Petrolero.",
  robots: { index: false, follow: false },
};

export default function CheckoutRoute() {
  return <StorefrontChrome><CheckoutPage /></StorefrontChrome>;
}
