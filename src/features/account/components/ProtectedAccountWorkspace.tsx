import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { accountSectionPath, type AccountSection } from "../data/accountNavigation";
import AccountWorkspace from "./AccountWorkspace";
import "../styles/workspaceStates.css";

async function AuthorizedWorkspace({ section }: { section: AccountSection }) {
  if (!isAuthConfigured()) redirect(accountSectionPath(section, true));

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
