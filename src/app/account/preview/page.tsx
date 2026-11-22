import type { Metadata } from "next";
import { Suspense } from "react";
import AccountWorkspace from "@/features/account/components/AccountWorkspace";
import { isAccountSection } from "@/features/account/data/accountNavigation";
import "@/features/account/styles/workspaceStates.css";

export const metadata: Metadata = {
  title: "Личный кабинет — Petrolero",
  description: "Личный кабинет Petrolero: заказы, адреса и избранное.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ section?: string }> };

async function PreviewWorkspace({ searchParams }: Props) {
  const query = await searchParams;
  const section = query.section || "overview";
  const safeSection = isAccountSection(section) ? section : "overview";
  return <AccountWorkspace section={safeSection} preview />;
}

export default function PreviewPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<main className="pa-loading" role="status">Загрузка личного кабинета…</main>}>
      <PreviewWorkspace searchParams={searchParams} />
    </Suspense>
  );
}
