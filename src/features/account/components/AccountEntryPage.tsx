"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "../styles/account.css";

type AuthMode = "login" | "register" | "forgot";

// This SVG exists in public/home/images/; it was previously referenced
// as /petrolero-logo.svg, which returns 404 and shows a broken-image icon.
const LOGO_SRC = "/home/images/petrolero-logo.svg";

export default function AccountEntryPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [mode, setMode] = useState<AuthMode>("login");
  const [backgroundVisible, setBackgroundVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let backgroundTimer: ReturnType<typeof setTimeout> | undefined;
    let panelTimer: ReturnType<typeof setTimeout> | undefined;
    let finished = false;

    const handleEnded = () => {
      if (finished) return;
      finished = true;

      backgroundTimer = setTimeout(() => setBackgroundVisible(true), 80);
      panelTimer = setTimeout(() => setPanelVisible(true), 520);
    };

    video.addEventListener("ended", handleEnded);
    // The page must remain usable if the visitor's browser cannot play WebM.
    video.addEventListener("error", handleEnded);
    if (video.ended || video.error) handleEnded();

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleEnded);
      if (backgroundTimer) clearTimeout(backgroundTimer);
      if (panelTimer) clearTimeout(panelTimer);
    };
  }, []);

  const changeMode = (next: AuthMode) => {
    setMode(next);
    setShowPassword(false);
  };

  return (
    <main className="petrolero-account-page">
      <section className="petrolero-account-hero">
        <div className="petrolero-account-media">
          <video
            ref={videoRef}
            className="petrolero-account-video"
            autoPlay
            muted
            playsInline
            preload="auto"
          >
            <source src="/login/video/vidEnter.webm" type="video/webm" />
          </video>

          <div
            className={`petrolero-account-bg-overlay ${backgroundVisible ? "is-visible" : ""}`}
            style={{ backgroundImage: 'url("/login/images/fonLog.webp")' }}
          />
        </div>

        <Link href="/" className="petrolero-account-logo-link" aria-label="Petrolero — на главную">
          {/* The local logo is an actual SVG, not an HTML page or missing root asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Petrolero" className="petrolero-account-logo" />
        </Link>

        <div className="petrolero-account-top-label">
          PETROLERO / ЛИЧНЫЙ КАБИНЕТ
        </div>

        <Link href="/" className="petrolero-account-home-link">
          На главную
        </Link>

        <div className="petrolero-account-center">
          <div
            className={`petrolero-account-panel ${panelVisible ? "is-visible" : ""}`}
            aria-hidden={!panelVisible}
            inert={!panelVisible}
          >
            <div className="petrolero-account-panel-inner">
              <div className="petrolero-account-panel-line" />

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

                    <button type="submit" className="petrolero-account-submit">
                      Войти
                    </button>
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

                    <button type="submit" className="petrolero-account-submit">
                      Зарегистрироваться
                    </button>
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

                    <button type="submit" className="petrolero-account-submit">
                      Отправить ссылку
                    </button>
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
