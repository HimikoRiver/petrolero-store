"use client";

import { useState } from "react";
import Link from "next/link";
import GoldShimmerButton from "@/components/ui/GoldShimmerButton";
import "../styles/account.css";

type AuthMode = "login" | "register" | "forgot";

const LOGO_SRC = "/home/images/petrolero-logo.svg";

export default function AccountEntryPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);

  const changeMode = (next: AuthMode) => {
    setMode(next);
    setShowPassword(false);
  };

  return (
    <main className="petrolero-account-page">
      <section className="petrolero-account-hero">
        <div className="petrolero-account-media" aria-hidden="true" />

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

              {mode === "login" && (
                <>
                  <h1 className="petrolero-account-form-title">Вход в аккаунт</h1>
                  <p className="petrolero-account-form-subtitle">
                    Управляйте заказами и покупками в Petrolero.
                  </p>

                  <form className="petrolero-account-form" onSubmit={(event) => event.preventDefault()}>
                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">E-mail</span>
                      <input
                        type="email"
                        placeholder="Введите e-mail"
                        autoComplete="email"
                        required
                      />
                    </label>

                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">Пароль</span>
                      <div className="petrolero-account-password-wrap">
                        <input
                          type={showPassword ? "text" : "password"}
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
                        <input type="checkbox" />
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

                    <GoldShimmerButton type="submit" className="petrolero-account-submit">
                      Войти
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

              {mode === "register" && (
                <>
                  <h1 className="petrolero-account-form-title">Регистрация</h1>
                  <p className="petrolero-account-form-subtitle">
                    Создайте аккаунт для заказов и сохранённых товаров.
                  </p>

                  <form className="petrolero-account-form" onSubmit={(event) => event.preventDefault()}>
                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">Имя</span>
                      <input type="text" placeholder="Введите имя" autoComplete="name" minLength={2} required />
                    </label>

                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">E-mail</span>
                      <input type="email" placeholder="Введите e-mail" autoComplete="email" required />
                    </label>

                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">Пароль</span>
                      <input type="password" placeholder="Создайте пароль" autoComplete="new-password" minLength={8} required />
                    </label>

                    <GoldShimmerButton type="submit" className="petrolero-account-submit">
                      Зарегистрироваться
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

                  <form className="petrolero-account-form" onSubmit={(event) => event.preventDefault()}>
                    <label className="petrolero-account-field">
                      <span className="petrolero-account-field-label">E-mail</span>
                      <input type="email" placeholder="Введите e-mail" autoComplete="email" required />
                    </label>

                    <GoldShimmerButton type="submit" className="petrolero-account-submit">
                      Отправить ссылку
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
