"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import BrandLogo from "@/components/layout/header/BrandLogo";
import "../styles/account.css";

type FormMode = "login" | "register" | "recover";

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmation: string;
  remember: boolean;
  agreed: boolean;
};

const INITIAL_VALUES: FormValues = {
  name: "",
  email: "",
  password: "",
  confirmation: "",
  remember: true,
  agreed: false,
};

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={direction === "left" ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M4 12h16m-7-7 7 7-7 7" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {visible ? (
        <>
          <path d="M2.8 12s3.25-6.5 9.2-6.5 9.2 6.5 9.2 6.5-3.25 6.5-9.2 6.5S2.8 12 2.8 12Z" />
          <circle cx="12" cy="12" r="3.1" />
        </>
      ) : (
        <>
          <path d="M3 3 21 21" />
          <path d="M9.2 5.9A11.4 11.4 0 0 1 12 5.5c5.95 0 9.2 6.5 9.2 6.5a15.1 15.1 0 0 1-3.5 4.05M6.2 7.15C4.05 8.65 2.8 12 2.8 12s3.25 6.5 9.2 6.5a9.2 9.2 0 0 0 3.7-.75" />
        </>
      )}
    </svg>
  );
}

function PrecisionDial() {
  return (
    <svg className="petrolero-account-dial" viewBox="0 0 740 740" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="petrolero-account-dial-gold" x1="100" y1="120" x2="620" y2="650" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#594028" stopOpacity=".06" />
          <stop offset=".42" stopColor="#D2A061" stopOpacity=".58" />
          <stop offset=".68" stopColor="#FFE0A7" stopOpacity=".12" />
          <stop offset="1" stopColor="#96622B" stopOpacity=".36" />
        </linearGradient>
        <radialGradient id="petrolero-account-dial-core">
          <stop offset="0" stopColor="#B77F3F" stopOpacity=".12" />
          <stop offset=".72" stopColor="#3B2919" stopOpacity=".08" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="370" cy="370" r="345" fill="url(#petrolero-account-dial-core)" />
      <circle cx="370" cy="370" r="319" stroke="url(#petrolero-account-dial-gold)" strokeWidth="1.2" />
      <circle cx="370" cy="370" r="288" stroke="#9F794B" strokeOpacity=".14" />
      <circle cx="370" cy="370" r="257" stroke="url(#petrolero-account-dial-gold)" strokeWidth="1.6" />
      <circle cx="370" cy="370" r="248" stroke="#D1A36A" strokeOpacity=".1" strokeWidth="7" />
      <circle cx="370" cy="370" r="184" stroke="url(#petrolero-account-dial-gold)" strokeWidth="1.1" />
      <circle cx="370" cy="370" r="152" stroke="#BD915C" strokeOpacity=".21" strokeWidth="22" strokeDasharray="3 18" />
      <circle cx="370" cy="370" r="105" stroke="#B88B55" strokeOpacity=".2" />
      <circle cx="370" cy="370" r="62" stroke="#D7AC76" strokeOpacity=".38" />
      <circle cx="370" cy="370" r="11" fill="#D4AB76" fillOpacity=".55" />
      <path d="M370 29v44M370 667v44M29 370h44M667 370h44" stroke="#C9A16E" strokeOpacity=".4" />
      <path d="M168 168 218 218M522 522l50 50M168 572l50-50M522 218l50-50" stroke="#C9A16E" strokeOpacity=".16" />
      <path d="M370 113v73M555 370h73M370 554v73M112 370h74" stroke="#D7A365" strokeOpacity=".35" strokeWidth="2" />
      <path d="M370 370 552 191" stroke="#F2C789" strokeOpacity=".28" strokeWidth="1.5" />
    </svg>
  );
}

export default function AccountEntryPage() {
  const [mode, setMode] = useState<FormMode>("login");
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  };

  const changeMode = (next: FormMode) => {
    setMode(next);
    setFeedback(null);
    setPasswordVisible(false);
    setValues((current) => ({
      ...current,
      password: "",
      confirmation: "",
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "register" && values.password.length < 8) {
      setFeedback("Пароль должен содержать не менее 8 символов.");
      return;
    }

    if (mode === "register" && values.password !== values.confirmation) {
      setFeedback("Пароли не совпадают. Проверьте повторный ввод.");
      return;
    }

    setFeedback(
      mode === "recover"
        ? "Восстановление пароля пока не подключено. Письмо не отправлено."
        : mode === "register"
          ? "Регистрация пока не подключена к серверу. Аккаунт не создан."
          : "Авторизация пока не подключена к серверу. Вход не выполнен.",
    );
  };

  return (
    <div className="petrolero-account-page">
      <header className="petrolero-account-header">
        <div className="petrolero-account-header__inner">
          <Link href="/" className="petrolero-account-brand" aria-label="Petrolero — на главную">
            <BrandLogo animated={false} variant="gold" />
          </Link>
          <nav className="petrolero-account-header__nav" aria-label="Навигация">
            <Link href="/catalog">Каталог</Link>
            <Link className="petrolero-account-header__back" href="/">
              <ArrowIcon direction="left" />
              <span>На главную</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="petrolero-account-main">
        <section className="petrolero-account-showcase" aria-label="Личный кабинет Petrolero">
          <div className="petrolero-account-showcase__grid" aria-hidden="true" />
          <PrecisionDial />
          <div className="petrolero-account-showcase__content">
            <p className="petrolero-account-eyebrow">
              <span className="petrolero-account-eyebrow__mark" />
              PETROLERO / ЛИЧНЫЙ КАБИНЕТ
            </p>
            <h1>Ваши покупки.<br /><span>Ваш контроль.</span></h1>
            <p className="petrolero-account-showcase__description">
              История заказов, сохранённые товары и адреса доставки — в одном разделе.
            </p>
          </div>
          <div className="petrolero-account-showcase__bottom" aria-label="Разделы будущего аккаунта">
            <span><b>01</b> Заказы</span>
            <span><b>02</b> Избранное</span>
            <span><b>03</b> Профиль</span>
          </div>
        </section>

        <section className="petrolero-account-form-section" aria-labelledby="petrolero-account-form-heading">
          <div className="petrolero-account-form-shell">
            <div className="petrolero-account-form-header">
              <p className="petrolero-account-eyebrow">
                {mode === "login" ? "ДОСТУП К АККАУНТУ" : mode === "register" ? "НОВЫЙ АККАУНТ" : "ВОССТАНОВЛЕНИЕ ДОСТУПА"}
              </p>
              <h2 id="petrolero-account-form-heading">
                {mode === "login" ? "Вход в аккаунт" : mode === "register" ? "Регистрация" : "Забыли пароль?"}
              </h2>
              <p>
                {mode === "login"
                  ? "Введите почту и пароль, чтобы войти в личный кабинет."
                  : mode === "register"
                    ? "Заполните данные для создания личного кабинета."
                    : "Укажите адрес электронной почты, связанный с аккаунтом."}
              </p>
            </div>

            {mode !== "recover" && (
              <div className="petrolero-account-mode-switch" role="group" aria-label="Способ входа">
                <button type="button" aria-pressed={mode === "login"} onClick={() => changeMode("login")}>Вход</button>
                <button type="button" aria-pressed={mode === "register"} onClick={() => changeMode("register")}>Регистрация</button>
              </div>
            )}

            <form className="petrolero-account-form" onSubmit={submit}>
              {mode === "register" && (
                <div className="petrolero-account-field">
                  <label htmlFor="petrolero-account-name">Имя</label>
                  <input
                    id="petrolero-account-name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => update("name", event.target.value)}
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Как к вам обращаться"
                  />
                </div>
              )}

              <div className="petrolero-account-field">
                <label htmlFor="petrolero-account-email">Электронная почта</label>
                <input
                  id="petrolero-account-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => update("email", event.target.value)}
                  required
                  placeholder="example@mail.ru"
                />
              </div>

              {mode !== "recover" && (
                <div className="petrolero-account-field">
                  <div className="petrolero-account-field__label-row">
                    <label htmlFor="petrolero-account-password">Пароль</label>
                    {mode === "login" && (
                      <button className="petrolero-account-text-action" type="button" onClick={() => changeMode("recover")}>
                        Забыли пароль?
                      </button>
                    )}
                  </div>
                  <div className="petrolero-account-password">
                    <input
                      id="petrolero-account-password"
                      type={passwordVisible ? "text" : "password"}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      value={values.password}
                      onChange={(event) => update("password", event.target.value)}
                      required
                      minLength={mode === "register" ? 8 : undefined}
                      placeholder="Введите пароль"
                    />
                    <button
                      type="button"
                      className="petrolero-account-password__toggle"
                      aria-label={passwordVisible ? "Скрыть пароль" : "Показать пароль"}
                      aria-pressed={passwordVisible}
                      onClick={() => setPasswordVisible((previous) => !previous)}
                    >
                      <EyeIcon visible={passwordVisible} />
                    </button>
                  </div>
                </div>
              )}

              {mode === "register" && (
                <div className="petrolero-account-field">
                  <label htmlFor="petrolero-account-password-confirm">Повторите пароль</label>
                  <input
                    id="petrolero-account-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={values.confirmation}
                    onChange={(event) => update("confirmation", event.target.value)}
                    minLength={8}
                    required
                    placeholder="Повторите пароль"
                  />
                </div>
              )}

              {mode === "login" && (
                <label className="petrolero-account-checkbox">
                  <input type="checkbox" checked={values.remember} onChange={(event) => update("remember", event.target.checked)} />
                  <span>Запомнить меня</span>
                </label>
              )}

              {mode === "register" && (
                <label className="petrolero-account-checkbox petrolero-account-checkbox--terms">
                  <input type="checkbox" checked={values.agreed} onChange={(event) => update("agreed", event.target.checked)} required />
                  <span>Принимаю <Link href="/terms">условия пользования</Link> и <Link href="/privacy">политику конфиденциальности</Link></span>
                </label>
              )}

              <button className="petrolero-account-submit" type="submit">
                <span>{mode === "login" ? "Войти" : mode === "register" ? "Создать аккаунт" : "Восстановить доступ"}</span>
                <ArrowIcon />
              </button>

              {feedback && <p className="petrolero-account-feedback" role="status">{feedback}</p>}
            </form>

            {mode === "recover" ? (
              <button className="petrolero-account-switch-back" type="button" onClick={() => changeMode("login")}>
                <ArrowIcon direction="left" /> Вернуться ко входу
              </button>
            ) : (
              <p className="petrolero-account-form-note">
                {mode === "login" ? "Ещё нет аккаунта?" : "Уже зарегистрированы?"}
                {" "}
                <button type="button" onClick={() => changeMode(mode === "login" ? "register" : "login")}>
                  {mode === "login" ? "Зарегистрироваться" : "Войти"}
                </button>
              </p>
            )}

            <p className="petrolero-account-demo-note">
              Демонстрационный интерфейс. Вход, регистрация и восстановление пароля станут доступны после подключения серверной авторизации.
            </p>
          </div>
        </section>
      </main>

      <footer className="petrolero-account-footer">
        <span>© 2026 Petrolero</span>
        <nav aria-label="Документы">
          <Link href="/privacy">Конфиденциальность</Link>
          <Link href="/terms">Условия пользования</Link>
        </nav>
      </footer>
    </div>
  );
}
