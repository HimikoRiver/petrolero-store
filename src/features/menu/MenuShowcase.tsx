"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import BrandLogo from "../home/header/BrandLogo";
import { MENU_ITEMS } from "./menuItems";
import "./MenuShowcase.css";

type MenuShowcaseProps = {
  open?: boolean;
  onClose?: () => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
};

const MENU_DETAILS = [
  {
    kicker: "01 / ПРОДУКЦИЯ",
    heading: "Для каждого двигателя.",
    detail: "Моторные масла и присадки Petrolero.",
  },
  {
    kicker: "02 / О КОМПАНИИ",
    heading: "Больше, чем масло.",
    detail: "Компания Petrolero, её подход и продукция.",
  },
  {
    kicker: "03 / ТЕХНОЛОГИИ",
    heading: "Инженерия защиты.",
    detail: "Технологии, составы и работа масла.",
  },
  {
    kicker: "04 / СВЯЗЬ",
    heading: "Остаёмся на связи.",
    detail: "Контактная информация и обратная связь.",
  },
] as const;

export default function MenuShowcase({
  open,
  onClose,
  triggerRef,
}: MenuShowcaseProps = {}) {
  const embedded = typeof open === "boolean";
  const [demoOpen, setDemoOpen] = useState(true);
  const isOpen = embedded ? Boolean(open) : demoOpen;
  const [activeIndex, setActiveIndex] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const demoButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback(() => {
    if (embedded) {
      onClose?.();
    } else {
      setDemoOpen(false);
    }
  }, [embedded, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        )
      ).filter((element) => element.tabIndex >= 0);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (embedded) triggerRef?.current?.focus();
      else demoButtonRef.current?.focus();
    };
  }, [isOpen, closeMenu, embedded, triggerRef]);

  const handleMenuLink = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // Preserve standard navigation for new tabs and separate pages.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const destination = new URL(href, window.location.href);

    if (
      destination.origin !== window.location.origin ||
      destination.pathname !== window.location.pathname ||
      !destination.hash
    ) {
      closeMenu();
      return;
    }

    const sectionId = decodeURIComponent(destination.hash.slice(1));
    const section = document.getElementById(sectionId);

    if (!section) {
      // Let the browser handle an unknown anchor normally.
      closeMenu();
      return;
    }

    event.preventDefault();
    closeMenu();

    // Update the address bar without triggering the browser's abrupt hash jump.
    const nextLocation =
      destination.pathname + destination.search + destination.hash;
    const currentLocation =
      window.location.pathname + window.location.search + window.location.hash;

    if (nextLocation !== currentLocation) {
      window.history.pushState(null, "", nextLocation);
    }

    // Let React close the menu and release the scroll lock first.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        section.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
    });
  };

  const activeDetail = MENU_DETAILS[activeIndex];

  return (
    <div className={embedded ? "petrolero-menu-root" : "petrolero-menu-demo"}>
      {!isOpen && !embedded && (
        <button
          ref={demoButtonRef}
          type="button"
          className="petrolero-menu-demo-trigger"
          onClick={() => setDemoOpen(true)}
        >
          ОТКРЫТЬ МЕНЮ
        </button>
      )}

      {isOpen && (
        <button
          type="button"
          className="petrolero-menu-backdrop"
          aria-label="Закрыть меню"
          onClick={closeMenu}
          tabIndex={-1}
        />
      )}

      <section
        id="petrolero-site-menu"
        ref={dialogRef}
        className={
          "petrolero-menu-overlay" +
          (isOpen ? " petrolero-menu-overlay--open" : "")
        }
        role="dialog"
        aria-modal={isOpen ? true : undefined}
        aria-label="Меню Petrolero"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="petrolero-menu-shell">
          <header className="petrolero-menu-header">
            <a
              className="petrolero-menu-logo"
              href="/"
              aria-label="Petrolero — главная"
              tabIndex={isOpen ? 0 : -1}
            >
              <BrandLogo animated={false} variant="gold" />
            </a>

            <span className="petrolero-menu-header-label" aria-hidden="true">
              PETROLERO / НАВИГАЦИЯ
            </span>

            <button
              ref={closeButtonRef}
              className="petrolero-menu-close"
              type="button"
              onClick={closeMenu}
              aria-label="Закрыть меню"
              tabIndex={isOpen ? 0 : -1}
            >
              <svg
                viewBox="0 0 28 28"
                width="23"
                height="23"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6L22 22M22 6L6 22" />
              </svg>
            </button>
          </header>

          <div className="petrolero-menu-body">
            <nav
              className="petrolero-menu-nav"
              aria-label="Основные разделы Petrolero"
            >
              <p className="petrolero-menu-eyebrow">ВЫБЕРИТЕ РАЗДЕЛ</p>

              <ul className="petrolero-menu-list">
                {MENU_ITEMS.map((item, index) => (
                  <li className="petrolero-menu-item" key={item.number}>
                    <a
                      className={
                        "petrolero-menu-link" +
                        (activeIndex === index
                          ? " petrolero-menu-link--active"
                          : "")
                      }
                      href={item.href}
                      tabIndex={isOpen ? 0 : -1}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={(event) => handleMenuLink(event, item.href)}
                    >
                      <span className="petrolero-menu-link-number">
                        {item.number}
                      </span>
                      <span className="petrolero-menu-link-text">
                        {item.title}
                      </span>
                      <span className="petrolero-menu-link-arrow" aria-hidden="true">
                        <svg
                          width="29"
                          height="29"
                          viewBox="0 0 32 32"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 16H27M19 8L27 16L19 24" />
                        </svg>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <aside className="petrolero-menu-feature">
              {isOpen && (
                <video
                  className="petrolero-menu-oil"
                  src="/home/video/oil.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
              )}
              <div className="petrolero-menu-feature-grain" />
              <a
                className="petrolero-menu-feature-details"
                key={activeIndex}
                href={MENU_ITEMS[activeIndex].href}
                onClick={(event) =>
                  handleMenuLink(event, MENU_ITEMS[activeIndex].href)
                }
                tabIndex={isOpen ? 0 : -1}
                aria-label={`Перейти: ${MENU_ITEMS[activeIndex].title}`}
              >
                <span className="petrolero-menu-feature-kicker">
                  {activeDetail.kicker}
                </span>
                <span className="petrolero-menu-feature-heading">
                  {activeDetail.heading}
                </span>
                <span className="petrolero-menu-feature-description">
                  {activeDetail.detail}
                </span>
              </a>
              <div className="petrolero-menu-feature-index" aria-hidden="true">
                {MENU_ITEMS[activeIndex].number}
              </div>
            </aside>
          </div>

          <div className="petrolero-menu-bottom" aria-hidden="true">
            <span>МОТОРНЫЕ МАСЛА</span>
            <span>ПРИСАДКИ</span>
            <span>ТЕХНОЛОГИИ</span>
            <span className="petrolero-menu-bottom-brand">PETROLERO</span>
          </div>
        </div>
      </section>
    </div>
  );
}
