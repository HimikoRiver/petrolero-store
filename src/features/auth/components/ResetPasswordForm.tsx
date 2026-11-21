"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import GoldShimmerButton from "@/components/ui/GoldShimmerButton";
import "../../account/styles/account.css";

type Feedback = {
  type: "error" | "success";
  text: string;
};

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || !token) return;

    if (password.length < 10) {
      setFeedback({ type: "error", text: "Пароль должен содержать не менее десяти символов." });
      return;
    }

    if (password !== confirmation) {
      setFeedback({ type: "error", text: "Пароли не совпадают." });
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      const result = await authClient.resetPassword({ token, newPassword: password });

      if (result.error) {
        setFeedback({
          type: "error",
          text: result.error.status === 503
            ? "Сервис восстановления пароля пока не настроен."
            : "Ссылка недействительна или срок её действия истёк. Запросите новую ссылку.",
        });
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmation("");
      setFeedback({ type: "success", text: "Пароль изменён. Теперь можно войти в аккаунт." });
    } catch {
      setFeedback({ type: "error", text: "Не удалось изменить пароль. Попробуйте снова." });
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="petrolero-account-page">
      <section className="petrolero-account-hero">
        <div className="petrolero-account-media" aria-hidden="true" />

        <Link href="/" className="petrolero-account-logo-link" aria-label="Petrolero — на главную">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/images/petrolero-logo.svg" alt="Petrolero" className="petrolero-account-logo" />
        </Link>
        <Link href="/" className="petrolero-account-home-link">На главную</Link>

        <div className="petrolero-account-center">
          <div className="petrolero-account-panel">
            <div className="petrolero-account-panel-inner">
              <div className="petrolero-account-panel-line" aria-hidden="true" />
              <div className="petrolero-account-top-label">PETROLERO / БЕЗОПАСНОСТЬ</div>
              <h1 className="petrolero-account-form-title">Новый пароль</h1>
              <p className="petrolero-account-form-subtitle">
                Установите новый пароль, чтобы восстановить доступ к личному кабинету.
              </p>

              {token && !success ? (
                <form className="petrolero-account-form" onSubmit={submit}>
                  <label className="petrolero-account-field">
                    <span className="petrolero-account-field-label">Пароль</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      minLength={10}
                      maxLength={128}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Не менее 10 символов"
                    />
                  </label>
                  <label className="petrolero-account-field">
                    <span className="petrolero-account-field-label">Повторите пароль</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      minLength={10}
                      maxLength={128}
                      required
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                      placeholder="Повторите пароль"
                    />
                  </label>
                  <GoldShimmerButton className="petrolero-account-submit" type="submit" disabled={pending}>
                    {pending ? "Сохранение…" : "Изменить пароль"}
                  </GoldShimmerButton>
                </form>
              ) : !success ? (
                <p className="petrolero-account-feedback" role="alert">
                  Ссылка для восстановления не найдена или устарела.
                </p>
              ) : null}

              {feedback && (
                <p
                  className="petrolero-account-feedback"
                  data-type={feedback.type}
                  role={feedback.type === "error" ? "alert" : "status"}
                >
                  {feedback.text}
                </p>
              )}

              <Link href="/account/login" className="petrolero-account-back-home">
                Вернуться ко входу
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
