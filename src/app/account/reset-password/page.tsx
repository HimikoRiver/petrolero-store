import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Смена пароля — Petrolero",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

async function ResetPasswordContent({ searchParams }: Props) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token || ""} />;
}

export default function ResetPasswordPage(props: Props) {
  return (
    <Suspense fallback={<p>Загрузка формы восстановления…</p>}>
      <ResetPasswordContent {...props} />
    </Suspense>
  );
}
