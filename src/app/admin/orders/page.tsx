import type { Metadata } from "next";
import { Suspense } from "react";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import AdminGate from "@/features/admin/AdminGate";
import AdminOrders from "@/features/admin/AdminOrders";

export const metadata: Metadata = {
  title: "Заказы — Админ-панель Petrolero",
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  return (
    <StorefrontChrome>
      <Suspense fallback={<main className="pt-admin pt-admin__loading" role="status">Проверка доступа…</main>}>
        <AdminGate next="/admin/orders" previewUrl="/admin/preview/orders">
          <AdminOrders />
        </AdminGate>
      </Suspense>
    </StorefrontChrome>
  );
}
