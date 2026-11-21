import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isAuthConfigured } from "@/lib/auth";
import { adminIdentity } from "@/lib/admin-auth";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import AdminProducts from "@/features/admin/AdminProducts";

export const metadata: Metadata = {
  title: "Управление товарами — Petrolero",
  robots: { index: false, follow: false },
};

async function AdminContent() {
  if (!isAuthConfigured()) {
    return (
      <main className="pt-admin">
        <div className="pt-admin__layout">
          <span className="pt-admin__kicker">PETROLERO / УПРАВЛЕНИЕ</span>
          <h1>Настройка административной панели</h1>
          <p>Для доступа к товарам подключите PostgreSQL, Better Auth и SMTP, примените миграции и назначьте подтверждённому аккаунту роль ADMIN.</p>
          <p>Порядок подключения описан в README проекта. Пароли и ключи не указываются на этой странице.</p>
        </div>
      </main>
    );
  }
  const admin = await adminIdentity(await headers());
  if (admin.status === 401) redirect("/account/login?next=%2Fadmin");
  if (admin.status !== 200) notFound();
  return <AdminProducts />;
}

export default function AdminPage() {
  return (
    <StorefrontChrome>
      <Suspense fallback={<main className="pt-admin pt-admin__loading" role="status">Проверка прав доступа…</main>}>
        <AdminContent />
      </Suspense>
    </StorefrontChrome>
  );
}
