import type { Metadata } from "next";
import { Suspense } from "react";
import AccountEntryPage from "@/features/account/components/AccountEntryPage";

export const metadata: Metadata = {
  title: "Вход в личный кабинет — Petrolero",
  description: "Личный кабинет Petrolero: вход и регистрация.",
  robots: { index: false, follow: true },
};

type Props = {
  searchParams: Promise<{ next?: string; verified?: string; error?: string }>;
};

async function AccountLoginContent({ searchParams }: Props) {
  const { next: requestedNext, verified, error } = await searchParams;

  // Accept only private account pages or the checkout on this origin.
  const next = requestedNext &&
    (requestedNext.startsWith("/account") || requestedNext === "/checkout") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.includes("\\") &&
    !requestedNext.startsWith("/account/login") &&
    !requestedNext.startsWith("/account/reset-password") &&
    !requestedNext.startsWith("/account/preview") &&
    (/^\/account(?:\/|\?|$)/.test(requestedNext) || requestedNext === "/checkout")
      ? requestedNext
      : "/account";

  return (
    <AccountEntryPage
      next={next}
      verified={verified === "1"}
      invalidLink={Boolean(error)}
    />
  );
}

export default function AccountLoginRoute({ searchParams }: Props) {
  return (
    <Suspense fallback={null}>
      <AccountLoginContent searchParams={searchParams} />
    </Suspense>
  );
}
