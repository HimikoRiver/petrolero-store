import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProtectedAccountWorkspace from "@/features/account/components/ProtectedAccountWorkspace";
import { isAccountSection } from "@/features/account/data/accountNavigation";

export const metadata: Metadata = {
  title: "Личный кабинет — Petrolero",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ section: string }> };

async function SectionContent({ params }: Props) {
  const { section } = await params;
  if (!isAccountSection(section) || section === "overview" || section === "order-detail") {
    notFound();
  }
  return <ProtectedAccountWorkspace section={section} />;
}

export default function AccountSectionPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="pa-loading" role="status">Загрузка страницы…</main>}>
      <SectionContent params={params} />
    </Suspense>
  );
}
