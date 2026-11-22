"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import GoldShimmerButton from "@/components/ui/GoldShimmerButton";
import GoldenThreadsOrb from "@/components/account/GoldenThreadsOrb";
import "../styles/account.css";

type AuthMode = "login" | "register" | "forgot" | "two-factor";

const LOGO_SRC = "/home/images/petrolero-logo.svg";

type Feedback = { type: "error" | "success" | "info"; text: string };

type AccountEntryPageProps = {
  next?: string;
  verified?: boolean;
  invalidLink?: boolean;
};

export default function AccountEntryPage({
  next = "/account",
  verified = false,
  invalidLink = false,
}: AccountEntryPageProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [backupMode, setBackupMode] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(
    verified
      ? { type: "success", text: "Почта подтверждена. Теперь войдите в аккаунт." }
      : invalidLink
        ? { type: "error", text: "Ссылка подтверждения недействительна или устарела. Запросите новую." }
        : null,
  );

  const verificationCallback = "/account/login?verified=1&next=" + encodeURIComponent(next);

  const changeMode = (nextMode: AuthMode) => {
    if (pending) return;
    setMode(nextMode);
    setShowPassword(false);
    setBackupMode(false);
    setFeedback(null);
    setVerificationEmail("");
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const loginEmail = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    setPending(true);
    setFeedback(null);
    setVerificationEmail("");

    try {
      const result = await authClient.signIn.email({
        email: loginEmail,
        password,
        rememberMe: data.has("rememberMe"),
      });

      if (result.error) {
        if (result.error.status === 403 || result.error.code === "EMAIL_NOT_VERIFIED") {
          setVerificationEmail(loginEmail);
          setFeedback({ type: "info", text: "Подтвердите адрес электронной почты по ссылке из письма." });
        } else if (result.error.status === 503) {
          setFeedback({ type: "error", text: "Авторизация пока не настроена на сервере." });
        } else if (result.error.status === 429) {
          setFeedback({ type: "error", text: "Слишком много попыток. Повторите немного позже." });
        } else {
          setFeedback({ type: "error", text: "Неверная почта или пароль. Проверьте данные и попробуйте снова." });
        }
        return;
      }

      // Better Auth deliberately does NOT create an authenticated session
      // until the second factor has been verified.
      if (result.data && "twoFactorRedirect" in result.data && result.data.twoFactorRedirect === true) {
        setBackupMode(false);
        setMode("two-factor");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Не удалось связаться с сервером. Попробуйте снова." });
    } finally {
      setPending(false);
    }
  };

  const handleTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const code = String(data.get("code") ?? "").trim();

    if (!backupMode && !/^\d{6}$/.test(code)) {
      setFeedback({ type: "error", text: "Введите шестизначный код из приложения." });
      return;
    }
    if (backupMode && !code) {
      setFeedback({ type: "error", text: "Введите резервный код." });
      return;
    }

    setPending(true);
    setFeedback(null);
    try {
      const result = backupMode
        ? await authClient.twoFactor.verifyBackupCode({ code, trustDevice: false })
        : await authClient.twoFactor.verifyTotp({ code, trustDevice: false });
      if (result.error) {
        setFeedback({
          type: "error",
          text: result.error.status === 429
            ? "Слишком много попыток. Попробуйте позже."
            : "Код не подошёл или срок его действия истёк. Попробуйте снова.",
        });
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Не удалось подтвердить код. Попробуйте снова." });
    } finally {
      setPending(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const registerEmail = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("confirmation") ?? "");

    if (name.length < 2) {
      setFeedback({ type: "error", text: "Укажите имя длиной не менее двух символов." });
      return;
    }
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
      const result = await authClient.signUp.email({
        name,
        email: registerEmail,
        password,
        callbackURL: verificationCallback,
      });

      if (result.error) {
        setFeedback({
          type: "error",
          text: result.error.status === 503
            ? "Регистрация пока не настроена на сервере."
            : result.error.status === 429
              ? "Слишком много попыток. Повторите немного позже."
              : "Не удалось создать аккаунт. Проверьте данные и повторите попытку.",
        });
        return;
      }

      setEmail(registerEmail);
      setVerificationEmail(registerEmail);
      setMode("login");
      setFeedback({
        type: "success",
        text: "Если регистрация выполнена, на указанную почту отправлено письмо. Подтвердите адрес, затем войдите.",
      });
    } catch {
      setFeedback({ type: "error", text: "Не удалось связаться с сервером. Попробуйте снова." });
    } finally {
      setPending(false);
    }
  };

  const handleForgot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const resetEmail = String(data.get("email") ?? "").trim().toLowerCase();

    setPending(true);
    setFeedback(null);
    try {
      const result = await authClient.requestPasswordReset({
        email: resetEmail,
        redirectTo: window.location.origin + "/account/reset-password",
      });
      if (result.error) {
        setFeedback({
          type: "error",
          text: result.error.status === 503
            ? "Восстановление пароля пока недоступно: сервис не настроен."
            : result.error.status === 429
              ? "Слишком много запросов. Попробуйте немного позже."
              : "Не удалось обработать запрос. Попробуйте снова.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: "Если такой аккаунт существует, мы отправили ссылку для смены пароля на указанную почту.",
      });
    } catch {
      setFeedback({ type: "error", text: "Не удалось связаться с сервером. Попробуйте снова." });
    } finally {
      setPending(false);
    }
  };

  const handleResendVerification = async () => {
    if (pending || !verificationEmail) return;
    setPending(true);
    setFeedback(null);
    try {
      const result = await authClient.sendVerificationEmail({
        email: verificationEmail,
        callbackURL: verificationCallback,
      });
      if (result.error) {
        setFeedback({ type: "error", text: "Не удалось отправить письмо. Попробуйте немного позже." });
      } else {
        setFeedback({ type: "success", text: "Если адрес ожидает подтверждения, письмо отправлено повторно." });
      }
    } catch {
      setFeedback({ type: "error", text: "Не удалось связаться с сервером. Попробуйте снова." });
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="petrolero-account-page">
      <section className="petrolero-account-hero">
        <div className="petrolero-account-media" aria-hidden="true" />
        <GoldenThreadsOrb />

        <Link href="/" className="petrolero-account-logo-link" aria-label="Petrolero — на главную">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Petrolero" className="petrolero-account-logo" />
        </Link>

        <Link href="/" className="petrolero-account-home-link">
          На главную
        </Link>

        <div className="petrolero-account-center">
          <div className="petrolero-account-panel">
            <div className="petrolero-account-panel-inner">
              <div className="petrolero-account-panel-line" aria-hidden="true" />
              <div className="petrolero-account-top-label">PETROLERO / ЛИЧНЫЙ КАБИНЕТ</div>

              {feedback && (
                <p
                  className="petrolero-account-feedback"
                  data-type={feedback.type}
                  role={feedback.type === "error" ? "alert" : "status"}
                >
                  {feedback.text}
                </p>
              )}
              {verificationEmail && mode === "login" && (
                <button
                  type="button"
                  className="petrolero-account-link-button petrolero-account-resend"
                  onClick={handleResendVerification}
                  disabled={pending}
                >
                  {pending ? "Отправка…" : "Отправить письмо подтверждения повторно"}
                </button>
              )}

              {mode === "login" && (
                <>
                  <h1 className="petrolero-account-form-title">Вход в аккаунт</h1>
                  <p className="petrolero-account-form-subtitle">
                    Управляйте заказами и покупками в Petrolero.
                  </p>

                  <form className="petrolero-account-form" onSubmit={handleLogin}>
                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">E-mail</span>
                      <input
                        type="email"
                        name="email"
                        placeholder="Введите e-mail"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </label>

                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">Пароль</span>
                      <div className="petrolero-account-password-wrap">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Введите пароль"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          className="petrolero-account-password-toggle"
                          onClick={() => setShowPassword((previous) => !previous)}
                          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                        >
                          {showPassword ? "Скрыть" : "Показать"}
                        </button>
                      </div>
                    </label>

                    <div className="petrolero-account-form-row">
                      <label className="petrolero-account-checkbox">
                        <input type="checkbox" name="rememberMe" />
                        <span>Запомнить меня</span>
                      </label>

                      <button
                        type="button"
                        className="petrolero-account-link-button"
                        onClick={() => changeMode("forgot")}
                      >
                        Забыли пароль?
                      </button>
                    </div>

                    <GoldShimmerButton type="submit" className="petrolero-account-submit" disabled={pending}>
                      {pending ? "Выполняется вход…" : "Войти"}
                    </GoldShimmerButton>
                  </form>

                  <div className="petrolero-account-bottom-text">
                    Нет аккаунта?{" "}
                    <button
                      type="button"
                      className="petrolero-account-link-button"
                      onClick={() => changeMode("register")}
                    >
                      Зарегистрироваться
                    </button>
                  </div>
                </>
              )}

              {mode === "two-factor" && (
                <>
                  <h1 className="petrolero-account-form-title">Подтверждение входа</h1>
                  <p className="petrolero-account-form-subtitle">
                    {backupMode
                      ? "Введите один из сохранённых резервных кодов."
                      : "Введите одноразовый код из приложения-аутентификатора."}
                  </p>
                  <form className="petrolero-account-form" onSubmit={handleTwoFactor}>
                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">
                        {backupMode ? "Резервный код" : "Код подтверждения"}
                      </span>
                      <input
                        key={backupMode ? "backup" : "totp"}
                        type="text"
                        name="code"
                        inputMode={backupMode ? "text" : "numeric"}
                        autoComplete="one-time-code"
                        maxLength={backupMode ? 100 : 6}
                        pattern={backupMode ? undefined : "[0-9]{6}"}
                        placeholder={backupMode ? "Введите резервный код" : "000000"}
                        required
                        autoFocus
                      />
                    </label>
                    <GoldShimmerButton type="submit" className="petrolero-account-submit" disabled={pending}>
                      {pending ? "Проверка кода…" : "Подтвердить вход"}
                    </GoldShimmerButton>
                  </form>
                  <div className="petrolero-account-bottom-text">
                    <button
                      type="button" className="petrolero-account-link-button"
                      disabled={pending}
                      onClick={() => { setBackupMode(value => !value); setFeedback(null); }}
                    >
                      {backupMode ? "Ввести код из приложения" : "Использовать резервный код"}
                    </button>
                  </div>
                  <div className="petrolero-account-bottom-text">
                    <button type="button" className="petrolero-account-link-button"
                      disabled={pending} onClick={() => changeMode("login")}>
                      Вернуться ко входу
                    </button>
                  </div>
                </>
              )}

              {mode === "register" && (
                <>
                  <h1 className="petrolero-account-form-title">Регистрация</h1>
                  <p className="petrolero-account-form-subtitle">
                    Создайте аккаунт для заказов и сохранённых товаров.
                  </p>

                  <form className="petrolero-account-form" onSubmit={handleRegister}>
                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">Имя</span>
                      <input name="name" type="text" placeholder="Введите имя" autoComplete="name" minLength={2} maxLength={120} required />
                    </label>

                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">E-mail</span>
                      <input name="email" type="email" placeholder="Введите e-mail" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </label>

                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">Пароль</span>
                      <input name="password" type="password" placeholder="Создайте пароль" autoComplete="new-password" minLength={10} maxLength={128} required />
                    </label>

                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">Повторите пароль</span>
                      <input name="confirmation" type="password" placeholder="Повторите пароль" autoComplete="new-password" minLength={10} maxLength={128} required />
                    </label>

                    <GoldShimmerButton type="submit" className="petrolero-account-submit" disabled={pending}>
                      {pending ? "Создание аккаунта…" : "Зарегистрироваться"}
                    </GoldShimmerButton>
                  </form>

                  <div className="petrolero-account-bottom-text">
                    Уже есть аккаунт?{" "}
                    <button
                      type="button"
                      className="petrolero-account-link-button"
                      onClick={() => changeMode("login")}
                    >
                      Войти
                    </button>
                  </div>
                </>
              )}

              {mode === "forgot" && (
                <>
                  <h1 className="petrolero-account-form-title">Восстановление пароля</h1>
                  <p className="petrolero-account-form-subtitle">
                    Укажите e-mail, связанный с аккаунтом.
                  </p>

                  <form className="petrolero-account-form" onSubmit={handleForgot}>
                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">E-mail</span>
                      <input name="email" type="email" placeholder="Введите e-mail" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </label>

                    <GoldShimmerButton type="submit" className="petrolero-account-submit" disabled={pending}>
                      {pending ? "Отправка…" : "Отправить ссылку"}
                    </GoldShimmerButton>
                  </form>

                  <div className="petrolero-account-bottom-text">
                    <button
                      type="button"
                      className="petrolero-account-link-button"
                      onClick={() => changeMode("login")}
                    >
                      Вернуться ко входу
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
