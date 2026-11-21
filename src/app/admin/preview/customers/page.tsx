import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import AdminCustomers from "@/features/admin/AdminCustomers";

export const metadata: Metadata = {
  title: "Предпросмотр покупателей — Petrolero",
  robots: { index: false, follow: false },
};

async function Content() {
  await connection();
  if (process.env.DATABASE_URL) notFound();
  return <AdminCustomers preview />;
}
export default function CustomersPreviewRoute() {
  return <StorefrontChrome>
    <Suspense fallback={<main className="pt-admin pt-admin__loading">Загрузка…</main>}>
      <Content />
    </Suspense>
  </StorefrontChrome>;
}
