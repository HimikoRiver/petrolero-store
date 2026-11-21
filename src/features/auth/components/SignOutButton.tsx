"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    setPending(true);
    setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(true);
        return;
      }
      router.replace("/account/login");
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={signOut} disabled={pending}>
        {pending ? "Выход…" : "Выйти из аккаунта"}
      </button>
      {error && <p role="alert">Не удалось завершить сеанс. Повторите попытку.</p>}
    </div>
  );
}
