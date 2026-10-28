"use client";

import { useState, type FormEvent } from "react";
import "./ContactsSection.css";

const CONTACT_EMAIL = "info@petrolero.ru";
const CONTACT_PHONE = "88007006146";

type ContactIconName = "phone" | "mail" | "map" | "shield" | "delivery" | "support";

function ContactIcon({ name }: { name: ContactIconName }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.55,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "phone":
      return (
        <svg {...common}>
          <path d="M7.2 3.6 4.6 5.1c-1.3.8-1.6 2.5-.8 4.8 1.9 5.3 6 9.4 11.4 11.3 2.2.8 4 .4 4.8-.9l1.5-2.6-5.1-3.2-2 2.1a16.5 16.5 0 0 1-6.7-6.7l2.1-2-3.2-5.1Z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="2.7" y="5" width="18.6" height="14" rx="2" />
          <path d="m3.5 6 8.5 7 8.5-7" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M19 10.2c0 5-7 10.5-7 10.5S5 15.2 5 10.2a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2.4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 2.7 19.5 6v5.6c0 4.6-3.1 7.8-7.5 9.7-4.4-1.9-7.5-5.1-7.5-9.7V6L12 2.7Z" />
          <path d="m8.8 11.6 2.2 2.2 4.3-4.4" />
        </svg>
      );
    case "delivery":
      return (
        <svg {...common}>
          <path d="M2.8 5h11v11h-11zM13.8 8h3.6l3.8 4v4h-7.4V8Z" />
          <circle cx="7" cy="17.5" r="1.8" />
          <circle cx="17.5" cy="17.5" r="1.8" />
        </svg>
      );
    case "support":
      return (
        <svg {...common}>
          <circle cx="12" cy="8.2" r="3.1" />
          <path d="M5.4 20.2c.2-3.7 2.7-5.7 6.6-5.7s6.4 2 6.6 5.7M2.5 8.4v4.2M21.5 8.4v4.2" />
        </svg>
      );
  }
}

function RightArrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h16m-7-7 7 7-7 7" />
    </svg>
  );
}

export default function ContactsSection() {
  const [prepared, setPrepared] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message || !form.reportValidity()) return;

    const subject = "Обращение с сайта Petrolero";
    const body = [
      "Здравствуйте!",
      "",
      message,
      "",
      "Контактные данные:",
      "Имя: " + name,
      "Электронная почта: " + email,
      "Телефон: " + (phone || "Не указан"),
    ].join("\n");

    const draft = "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    // A real message is sent only by the user's mail client.
    window.location.href = draft;
    setPrepared(true);
  };

  return (
    <section
      id="contacts"
      className="petrolero-contacts"
      aria-labelledby="petrolero-contacts-title"
    >
      <div className="petrolero-contacts-backdrop" aria-hidden="true" />
      <div className="petrolero-contacts-inner">
        <div className="petrolero-contacts-intro">
          <div className="petrolero-contacts-copy">
            <p className="petrolero-contacts-index">КОНТАКТЫ</p>
            <h2 id="petrolero-contacts-title">Свяжитесь с нами</h2>
            <p className="petrolero-contacts-lead">Мы всегда на связи</p>
            <p className="petrolero-contacts-description">
              Поможем разобраться в продукции Petrolero,
              ответим на вопросы и подскажем, где приобрести
              моторные масла и присадки.
            </p>

            <div className="petrolero-contacts-details">
              <div className="petrolero-contacts-detail">
                <span className="petrolero-contacts-detail-icon"><ContactIcon name="phone" /></span>
                <div>
                  <span className="petrolero-contacts-detail-label">Телефон</span>
                  <a href={"tel:" + CONTACT_PHONE} className="petrolero-contacts-detail-value">
                    8 800 700-61-46
                  </a>
                  <span className="petrolero-contacts-detail-sub">Пн–Сб, 10:00–19:00</span>
                </div>
              </div>

              <div className="petrolero-contacts-detail">
                <span className="petrolero-contacts-detail-icon"><ContactIcon name="mail" /></span>
                <div>
                  <span className="petrolero-contacts-detail-label">Электронная почта</span>
                  <a href={"mailto:" + CONTACT_EMAIL} className="petrolero-contacts-detail-value">
                    {CONTACT_EMAIL}
                  </a>
                  <span className="petrolero-contacts-detail-sub">Вопросы и предложения</span>
                </div>
              </div>

              <div className="petrolero-contacts-detail petrolero-contacts-detail--locations">
                <span className="petrolero-contacts-detail-icon"><ContactIcon name="map" /></span>
                <div>
                  <span className="petrolero-contacts-detail-label">Дилеры и точки продаж</span>
                  <span className="petrolero-contacts-detail-value">По всей России</span>
                  <a
                    className="petrolero-contacts-detail-link"
                    href="https://petrolero.ru/contacts/stores/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Посмотреть адреса <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="petrolero-contacts-globe-label" aria-hidden="true">
            <span className="petrolero-contacts-globe-point" />
            <span>PETROLERO · RUSSIA</span>
          </div>
        </div>

        <div className="petrolero-contacts-bottom">
          <div className="petrolero-contact-form-panel">
            <div className="petrolero-contact-panel-heading">
              <span className="petrolero-contacts-panel-number">01 / ОБРАТНАЯ СВЯЗЬ</span>
              <h3>Напишите нам</h3>
              <p>Расскажите, что вас интересует, — подготовим письмо для отправки.</p>
            </div>

            <form className="petrolero-contact-form" onSubmit={handleSubmit}>
              <div className="petrolero-contact-form-grid">
                <label className="petrolero-contact-field">
                  <span>Ваше имя <em>*</em></span>
                  <input name="name" type="text" placeholder="Как к вам обращаться" autoComplete="name" maxLength={120} required onChange={() => setPrepared(false)} />
                </label>

                <label className="petrolero-contact-field">
                  <span>E-mail <em>*</em></span>
                  <input name="email" type="email" placeholder="example@mail.ru" autoComplete="email" maxLength={254} required onChange={() => setPrepared(false)} />
                </label>

                <label className="petrolero-contact-field">
                  <span>Телефон</span>
                  <input name="phone" type="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" maxLength={35} onChange={() => setPrepared(false)} />
                </label>

                <label className="petrolero-contact-field petrolero-contact-field--message">
                  <span>Сообщение <em>*</em></span>
                  <textarea name="message" placeholder="Ваш вопрос..." rows={3} maxLength={4000} required onChange={() => setPrepared(false)} />
                </label>
              </div>

              <div className="petrolero-contact-form-footer">
                <button type="submit" className="petrolero-contact-submit">
                  Подготовить письмо <RightArrow />
                </button>
              </div>
              <p className="petrolero-contact-form-privacy">
                Отправляя письмо, вы соглашаетесь с{" "}
                <a href="/privacy">политикой конфиденциальности</a>.
              </p>
              {prepared && (
                <p className="petrolero-contact-form-status" role="status">
                  Если почтовое приложение не открылось, напишите на{" "}
                  <a href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>.
                </p>
              )}
            </form>
          </div>

          <aside className="petrolero-contacts-dealer">
            <div className="petrolero-contacts-dealer-art" aria-hidden="true" />
            <div className="petrolero-contacts-dealer-content">
              <span className="petrolero-contacts-panel-number">02 / PETROLERO</span>
              <h3>Дилерская сеть <em>Petrolero</em></h3>
              <p>
                Оригинальная продукция и помощь с подбором
                моторных масел для вашей техники.
              </p>
              <div className="petrolero-contacts-benefits">
                <div><span><ContactIcon name="shield" /></span><small>Оригинальная<br />продукция</small></div>
                <div><span><ContactIcon name="delivery" /></span><small>Точки продаж<br />по России</small></div>
                <div><span><ContactIcon name="support" /></span><small>Помощь<br />с подбором</small></div>
              </div>
              <a
                className="petrolero-contacts-dealer-link"
                href="https://petrolero.ru/contacts/stores/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Найти дилера <RightArrow />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
