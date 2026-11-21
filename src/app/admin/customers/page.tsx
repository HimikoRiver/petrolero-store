import type { Metadata } from "next";
import { Suspense } from "react";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import AdminGate from "@/features/admin/AdminGate";
import AdminCustomers from "@/features/admin/AdminCustomers";

export const metadata: Metadata = {
  title: "Покупатели — Админ-панель Petrolero",
  robots: { index: false, follow: false },
};

export default function AdminCustomersPage() {
  return (
    <StorefrontChrome>
      <Suspense fallback={<main className="pt-admin pt-admin__loading" role="status">Проверка доступа…</main>}>
        <AdminGate next="/admin/customers" previewUrl="/admin/preview/customers">
          <AdminCustomers />
        </AdminGate>
      </Suspense>
    </StorefrontChrome>
  );
}
