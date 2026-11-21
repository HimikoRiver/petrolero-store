import type { Metadata } from "next";
import AccountEntryPage from "@/features/account/components/AccountEntryPage";

export const metadata: Metadata = {
  title: "Вход в личный кабинет — Petrolero",
  description: "Личный кабинет Petrolero: вход и регистрация.",
  robots: { index: false, follow: true },
};

type Props = {
  searchParams: Promise<{ next?: string; verified?: string; error?: string }>;
};

export default async function AccountLoginRoute({ searchParams }: Props) {
  const { next: requestedNext, verified, error } = await searchParams;

  // Accept redirects only to private account pages on this website.
  const next = requestedNext &&
    requestedNext.startsWith("/account") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.includes("\\") &&
    !requestedNext.startsWith("/account/login") &&
    !requestedNext.startsWith("/account/reset-password") &&
    !requestedNext.startsWith("/account/preview") &&
    /^\/account(?:\/|\?|$)/.test(requestedNext)
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
