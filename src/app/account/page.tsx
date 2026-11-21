import type { Metadata } from "next";
import ProtectedAccountWorkspace from "@/features/account/components/ProtectedAccountWorkspace";

export const metadata: Metadata = {
  title: "Личный кабинет — Petrolero",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <ProtectedAccountWorkspace section="overview" />;
}
