import "server-only";

import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isAuthConfigured } from "@/lib/auth";
import { adminIdentity } from "@/lib/admin-auth";

export default async function AdminGate({
  next, previewUrl, children,
}: { next: string; previewUrl: string; children: ReactNode }) {
  if (!isAuthConfigured()) {
    return (
      <main className="pt-admin">
        <div className="pt-admin__layout">
          <span className="pt-admin__kicker">PETROLERO / УПРАВЛЕНИЕ</span>
          <h1>Административная панель</h1>
          <p>Для работы с покупателями и заявками подключите PostgreSQL, Better Auth и SMTP. Примените миграции и назначьте аккаунту роль администратора.</p>
          <Link href={previewUrl} className="pt-admin__preview-link">
            Посмотреть интерфейс без базы данных
          </Link>
        </div>
      </main>
    );
  }

  const admin = await adminIdentity(await headers());
  if (admin.status === 401) {
    redirect("/account/login?next=" + encodeURIComponent(next));
  }
  if (admin.status !== 200) notFound();
  return children;
}
