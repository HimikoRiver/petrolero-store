import type { Metadata } from "next";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Смена пароля — Petrolero",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token || ""} />;
}
