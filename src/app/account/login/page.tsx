import type { Metadata } from "next";
import AccountEntryPage from "@/features/account/components/AccountEntryPage";

export const metadata: Metadata = {
  title: "Вход в личный кабинет — Petrolero",
  description: "Личный кабинет Petrolero: вход и регистрация.",
  robots: { index: false, follow: true },
};

export default function AccountLoginRoute() {
  return <AccountEntryPage />;
}
