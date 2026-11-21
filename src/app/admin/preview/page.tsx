import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import AdminProducts from "@/features/admin/AdminProducts";

export const metadata: Metadata = {
  title: "Предпросмотр админ-панели — Petrolero",
  robots: { index: false, follow: false },
};

async function PreviewContent() {
  await connection();
  // This client-only sandbox never writes to the database. Once a real store
  // is connected, previews are disabled; use authenticated /admin instead.
  if (process.env.DATABASE_URL) notFound();
  return <AdminProducts preview />;
}

export default function AdminPreviewPage() {
  return <StorefrontChrome>
    <Suspense fallback={<main className="pa-loading">Загрузка предпросмотра…</main>}>
      <PreviewContent />
    </Suspense>
  </StorefrontChrome>;
}
