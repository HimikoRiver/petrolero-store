import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { accountSectionPath, type AccountSection } from "../data/accountNavigation";
import AccountWorkspace from "./AccountWorkspace";
import "../styles/workspaceStates.css";

async function AuthorizedWorkspace({ section }: { section: AccountSection }) {
  if (!isAuthConfigured()) {
    return (
      <main className="pa-workspace pa-unavailable">
        <div className="pa-unavailable__panel">
          <span className="pa-kicker">PETROLERO / ЛИЧНЫЙ КАБИНЕТ</span>
          <h1>Страницы готовы к просмотру</h1>
          <p>Для работы персональных данных и истории заказов ещё требуется подключить базу данных и почтовый сервис. Пока можно открыть все страницы в режиме предпросмотра.</p>
          <Link className="pa-button pa-button--gold" href={accountSectionPath(section, true)}>Посмотреть интерфейс</Link>
          <Link className="pa-unavailable__home" href="/">На главную</Link>
        </div>
      </main>
    );
  }

  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    const requested = accountSectionPath(section, false);
    redirect("/account/login?next=" + encodeURIComponent(requested));
  }

  return (
    <AccountWorkspace
      section={section}
      name={session.user.name}
      email={session.user.email}
      emailVerified={session.user.emailVerified}
    />
  );
}

export default function ProtectedAccountWorkspace({ section }: { section: AccountSection }) {
  return (
    <Suspense fallback={<main className="pa-loading" role="status">Проверка сеанса…</main>}>
      <AuthorizedWorkspace section={section} />
    </Suspense>
  );
}
