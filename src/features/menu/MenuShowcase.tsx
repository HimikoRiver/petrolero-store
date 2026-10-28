"use client";

import Image from "next/image";
import BrandLogo from "../home/header/BrandLogo";
import { MENU_ITEMS } from "./menuItems";
import "./MenuShowcase.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  RefObject,
  PointerEvent as ReactPointerEvent,
} from "react";

type MenuShowcaseProps = {
  open?: boolean;
  onClose?: () => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
};

// Without props this is the original /menu-demo showcase.
// When controlled, the same overlay opens from the homepage header.
export default function MenuShowcase({
  open,
  onClose,
  triggerRef,
}: MenuShowcaseProps = {}) {
  const embedded = typeof open === "boolean";
  const [demoOpen, setDemoOpen] = useState(true);
  const isOpen = embedded ? Boolean(open) : demoOpen;
  const [activeCard, setActiveCard] = useState<number | null>(
    null
  );

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback(() => {
    setActiveCard(null);
    if (embedded) onClose?.();
    else setDemoOpen(false);
  }, [embedded, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !menuRef.current) {
        return;
      }

      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        )
      ).filter((element) => element.tabIndex !== -1);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) return;

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (embedded) triggerRef?.current?.focus();
      else openButtonRef.current?.focus();
    };
  }, [isOpen, closeMenu, embedded, triggerRef]);

  const handleCardMove = (
    event: ReactPointerEvent<HTMLAnchorElement>
  ) => {
    if (event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    event.currentTarget.style.setProperty(
      "--rotate-x",
      `${(-y * 5).toFixed(2)}deg`
    );

    event.currentTarget.style.setProperty(
      "--rotate-y",
      `${(x * 6).toFixed(2)}deg`
    );
  };

  const resetCardTilt = (element: HTMLAnchorElement) => {
    element.style.setProperty("--rotate-x", "0deg");
    element.style.setProperty("--rotate-y", "0deg");
  };

  const Wrapper = embedded ? "div" : "main";

  return (
    <Wrapper className={embedded ? "menu-inline-root" : "menu-demo-page"}>
      {embedded && isOpen && (
        <button
          type="button"
          className="menu-inline-scrim"
          onClick={closeMenu}
          aria-label="Закрыть меню"
          tabIndex={-1}
        />
      )}
      {!isOpen && !embedded && (
        <button
          ref={openButtonRef}
          type="button"
          className="menu-open-button"
          onClick={() => setDemoOpen(true)}
        >
          ОТКРЫТЬ МЕНЮ
        </button>
      )}

      <section
        id="petrolero-site-menu"
        ref={menuRef}
        className={`menu-overlay ${
          isOpen ? "menu-overlay--open" : ""
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen}
        role="dialog"
        aria-modal={isOpen ? true : undefined}
        aria-label="Навигация Petrolero"
      >
        <div className="menu-shell">
          <header className="menu-header">
            <a
              href="/"
              className="menu-logo"
              tabIndex={isOpen ? 0 : -1}
            >
              <BrandLogo animated={false} variant="gold" />
            </a>

            <button
              ref={closeButtonRef}
              type="button"
              className="menu-close"
              onClick={closeMenu}
              tabIndex={isOpen ? 0 : -1}
              aria-label="Закрыть меню"
            >
              <span className="menu-close-circle" aria-hidden="true">×</span>
            </button>
          </header>

          <section className="menu-stage">
            <nav
              aria-label="Основные разделы Petrolero"
              className="menu-nav"
            >
              <ul
                className="menu-card-list"
                data-active={
                  activeCard === null
                    ? "none"
                    : String(activeCard)
                }
              >
                {MENU_ITEMS.map((item, index) => (
                  <li
                    key={item.number}
                    className="menu-card-slot"
                    style={
                      {
                        "--entry-delay": `${
                          120 + index * 90
                        }ms`,
                      } as CSSProperties
                    }
                  >
                    <a
                      href={item.href}
                      className={`menu-card ${
                        activeCard === index
                          ? "menu-card--active"
                          : ""
                      }`}
                      tabIndex={isOpen ? 0 : -1}
                      style={
                        {
                          "--rotate-x": "0deg",
                          "--rotate-y": "0deg",
                        } as CSSProperties
                      }
                      onPointerEnter={() =>
                        setActiveCard(index)
                      }
                      onPointerMove={handleCardMove}
                      onPointerLeave={(event) => {
                        setActiveCard(null);
                        resetCardTilt(event.currentTarget);
                      }}
                      onFocus={() => setActiveCard(index)}
                      onBlur={(event) => {
                        setActiveCard(null);
                        resetCardTilt(event.currentTarget);
                      }}
                    >
                      <div
                        className="menu-card-float"
                        style={
                          {
                            "--float-x1": item.float.x1,
                            "--float-y1": item.float.y1,
                            "--float-r1": item.float.r1,
                            "--float-x2": item.float.x2,
                            "--float-y2": item.float.y2,
                            "--float-r2": item.float.r2,
                            "--float-x3": item.float.x3,
                            "--float-y3": item.float.y3,
                            "--float-r3": item.float.r3,
                            "--float-duration":
                              item.float.duration,
                            "--float-delay": item.float.delay,
                          } as CSSProperties
                        }
                      >
                        <Image
                          src={item.image}
                          alt=""
                          width={656}
                          height={1642}
                          sizes="(max-width: 520px) 42vw, (max-width: 860px) 180px, 205px"
                          className="menu-card-image"
                          priority={index < 2}
                          draggable={false}
                        />

                        <span className="menu-card-content">
                          <span className="menu-card-number">
                            {item.number}
                          </span>

                          {/* Градиент только за названием */}
                          <span className="menu-card-title">
                            {item.title}
                          </span>
                        </span>

                        <span
                          className="menu-card-arrow"
                          aria-hidden="true"
                        >
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 32 32"
                            fill="none"
                          >
                            <path
                              d="M7 16H25M17 8L25 16L17 24"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>
        </div>
      </section>

      
    </Wrapper>
  );
}
