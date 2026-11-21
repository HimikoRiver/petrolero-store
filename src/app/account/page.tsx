import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import SignOutButton from "@/features/auth/components/SignOutButton";
import "./account-dashboard.css";

async function AccountContent() {
  if (!isAuthConfigured()) {
    return (
      <div className="petrolero-account-private__card">
        <h1>Личный кабинет</h1>
        <p>Подключение серверной авторизации ещё не завершено.</p>
        <Link href="/catalog">Вернуться в каталог</Link>
      </div>
    );
  }

  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/account/login?next=%2Faccount");

  return (
    <div className="petrolero-account-private__card">
      <span className="petrolero-account-private__eyebrow">PETROLERO / ЛИЧНЫЙ КАБИНЕТ</span>
      <h1>Личный кабинет</h1>
      <p>Вы вошли как <strong>{session.user.name}</strong>.</p>
      <p className="petrolero-account-private__email">{session.user.email}</p>
      <div className="petrolero-account-private__actions">
        <Link href="/catalog">Каталог</Link>
        <SignOutButton />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <main className="petrolero-account-private">
      <Suspense fallback={<p>Проверка сеанса…</p>}>
        <AccountContent />
      </Suspense>
    </main>
  );
}
