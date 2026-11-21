import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { findDemoOrders, findDemoOrder } from "@/lib/demo-orders";
import { accountSectionPath, type AccountSection } from "../data/accountNavigation";
import AccountWorkspace from "./AccountWorkspace";
import "../styles/workspaceStates.css";

async function AuthorizedWorkspace({ section, orderId }: { section: AccountSection; orderId?: string }) {
  if (!isAuthConfigured()) redirect(accountSectionPath(section, true));

  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    const requested = accountSectionPath(section, false);
    redirect("/account/login?next=" + encodeURIComponent(requested));
  }

  const profile = section === "profile"
    ? await getPrisma().user.findUnique({ where: { id: session.user.id }, select: { phone: true } })
    : null;
  const addresses = section === "addresses"
    ? await getPrisma().deliveryAddress.findMany({
        where: { userId: session.user.id },
        select: { id: true, label: true, recipient: true, phone: true, city: true, street: true, apartment: true, postalCode: true, isDefault: true },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      })
    : [];

  const orders = section === "overview" || section === "orders"
    ? await findDemoOrders(session.user.id, section === "overview" ? 3 : 50)
    : [];
  const order = section === "order-detail" && orderId
    ? await findDemoOrder(session.user.id, orderId)
    : null;

  return (
    <AccountWorkspace
      section={section}
      name={session.user.name}
      email={session.user.email}
      emailVerified={session.user.emailVerified}
      phone={profile?.phone ?? null}
      addresses={addresses}
      orders={orders}
      order={order}
    />
  );
}

export default function ProtectedAccountWorkspace({ section, orderId }: { section: AccountSection; orderId?: string }) {
  return (
    <Suspense fallback={<main className="pa-loading" role="status">Проверка сеанса…</main>}>
      <AuthorizedWorkspace section={section} orderId={orderId} />
    </Suspense>
  );
}
