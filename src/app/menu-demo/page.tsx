
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";

const MENU_ITEMS = [
  {
    number: "01",
    title: "Каталог",
    image: "/home/images/menu/1.webp",
    href: "/catalog/motornye-masla/legkovye-masla-moto/",
    float: {
      x1: "4px",
      y1: "-14px",
      r1: "-0.8deg",
      x2: "-7px",
      y2: "7px",
      r2: "0.6deg",
      x3: "8px",
      y3: "-4px",
      r3: "-1deg",
      duration: "7.8s",
      delay: "-0.6s",
    },
  },
  {
    number: "02",
    title: "О бренде",
    image: "/home/images/menu/2.webp",
    href: "/about",
    float: {
      x1: "-6px",
      y1: "-10px",
      r1: "0.7deg",
      x2: "9px",
      y2: "6px",
      r2: "-0.5deg",
      x3: "-5px",
      y3: "-7px",
      r3: "0.9deg",
      duration: "8.6s",
      delay: "-2.2s",
    },
  },
  {
    number: "03",
    title: "Технологии",
    image: "/home/images/menu/3.webp",
    href: "/technologies",
    float: {
      x1: "7px",
      y1: "-9px",
      r1: "-0.6deg",
      x2: "-5px",
      y2: "8px",
      r2: "0.8deg",
      x3: "10px",
      y3: "-6px",
      r3: "-0.7deg",
      duration: "7.2s",
      delay: "-1.4s",
    },
  },
  {
    number: "04",
    title: "Контакты",
    image: "/home/images/menu/4.webp",
    href: "/contacts",
    float: {
      x1: "-5px",
      y1: "-13px",
      r1: "0.6deg",
      x2: "8px",
      y2: "5px",
      r2: "-0.7deg",
      x3: "-9px",
      y3: "-4px",
      r3: "0.8deg",
      duration: "8.1s",
      delay: "-3.1s",
    },
  },
] as const;

export default function MenuDemoPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeCard, setActiveCard] = useState<number | null>(
    null
  );

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveCard(null);
        setIsOpen(false);
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
      openButtonRef.current?.focus();
    };
  }, [isOpen]);

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

  const closeMenu = () => {
    setActiveCard(null);
    setIsOpen(false);
  };

  return (
    <main className="menu-demo-page">
      {!isOpen && (
        <button
          ref={openButtonRef}
          type="button"
          className="menu-open-button"
          onClick={() => setIsOpen(true)}
        >
          ОТКРЫТЬ МЕНЮ
        </button>
      )}

      <section
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
              <span>P</span> petrolero
            </a>

            <button
              ref={closeButtonRef}
              type="button"
              className="menu-close"
              onClick={closeMenu}
              tabIndex={isOpen ? 0 : -1}
              aria-label="Закрыть меню"
            >
              <span>ЗАКРЫТЬ</span>
              <span className="menu-close-circle">×</span>
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

      <style jsx global>{`
        .menu-demo-page {
          min-height: 100svh;
          background: #000;
          font-family: Arial, Helvetica, sans-serif;
          color: #fff;
        }

        .menu-demo-page *,
        .menu-demo-page *::before,
        .menu-demo-page *::after {
          box-sizing: border-box;
        }

        .menu-open-button {
          position: fixed;
          top: 32px;
          left: 32px;
          z-index: 20;
          padding: 14px 18px;
          border: 1px solid rgba(231, 185, 104, 0.45);
          background: rgba(0, 0, 0, 0.88);
          color: #e8be7b;
          font-size: 11px;
          letter-spacing: 1.8px;
          cursor: pointer;
        }

        .menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #000;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          overflow-y: auto;
          overscroll-behavior: contain;
          transition:
            opacity 320ms ease,
            visibility 320ms ease;
        }

        .menu-overlay--open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .menu-shell {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          background: #000;
        }

        .menu-header {
          height: 84px;
          padding: 0 3.2vw;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .menu-logo {
          text-decoration: none;
          color: #fff;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -1.2px;
        }

        .menu-logo span {
          color: #e2b66f;
        }

        .menu-close {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          border: 0;
          background: transparent;
          color: #dcb470;
          cursor: pointer;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .menu-close-circle {
          width: 46px;
          height: 46px;
          border: 1px solid rgba(226, 180, 99, 0.55);
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 28px;
          line-height: 1;
          transition:
            transform 300ms ease,
            box-shadow 300ms ease;
        }

        .menu-close:hover .menu-close-circle {
          transform: rotate(90deg);
          box-shadow: 0 0 18px rgba(243, 190, 108, 0.28);
        }

        .menu-stage {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 2vw 28px;
        }

        .menu-nav {
          width: 100%;
        }

        .menu-card-list {
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(10px, 1.25vw, 20px);
          width: min(1160px, 100%);
          margin: 0 auto;
          padding: 0;
          perspective: 1600px;
        }

        .menu-card-slot {
          position: relative;
          width: clamp(150px, 14vw, 205px);
          flex: 0 0 auto;
          transition: transform 420ms
            cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .menu-card-slot:has(.menu-card--active) {
          z-index: 10;
        }

        .menu-overlay--open .menu-card-slot {
          animation:
            cardSlotIn 800ms
            cubic-bezier(0.2, 0.9, 0.2, 1)
            var(--entry-delay) backwards;
        }

        @keyframes cardSlotIn {
          from {
            opacity: 0;
            transform: translateY(44px) scale(0.94);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Соседние карточки раздвигаются */

        .menu-card-list[data-active="0"]
        .menu-card-slot:nth-child(n + 2) {
          transform: translateX(10px);
        }

        .menu-card-list[data-active="1"]
        .menu-card-slot:nth-child(1) {
          transform: translateX(-10px);
        }

        .menu-card-list[data-active="1"]
        .menu-card-slot:nth-child(n + 3) {
          transform: translateX(10px);
        }

        .menu-card-list[data-active="2"]
        .menu-card-slot:nth-child(-n + 2) {
          transform: translateX(-10px);
        }

        .menu-card-list[data-active="2"]
        .menu-card-slot:nth-child(4) {
          transform: translateX(10px);
        }

        .menu-card-list[data-active="3"]
        .menu-card-slot:nth-child(-n + 3) {
          transform: translateX(-10px);
        }

        .menu-card {
          display: block;
          position: relative;
          width: 100%;
          text-decoration: none;
          color: #fff;
          transform:
            perspective(1600px)
            rotateX(var(--rotate-x))
            rotateY(var(--rotate-y))
            scale(1);
          transition: transform 420ms
            cubic-bezier(0.2, 0.8, 0.2, 1);
          outline: none;
        }

        .menu-card:hover,
        .menu-card:focus-visible,
        .menu-card--active {
          transform:
            perspective(1600px)
            translateY(-16px)
            rotateX(var(--rotate-x))
            rotateY(var(--rotate-y))
            scale(1.08);
          z-index: 5;
        }

        /* Независимое хаотичное парение */

        .menu-card-float {
          position: relative;
          width: 100%;
          animation:
            chaoticFloat var(--float-duration) ease-in-out
            var(--float-delay) infinite;
        }

        @keyframes chaoticFloat {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }

          22% {
            transform:
              translate3d(
                var(--float-x1),
                var(--float-y1),
                0
              )
              rotate(var(--float-r1));
          }

          48% {
            transform:
              translate3d(
                var(--float-x2),
                var(--float-y2),
                0
              )
              rotate(var(--float-r2));
          }

          73% {
            transform:
              translate3d(
                var(--float-x3),
                var(--float-y3),
                0
              )
              rotate(var(--float-r3));
          }

          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
        }

        /* Оригинальное изображение без затемнения */

        .menu-card-image {
          display: block;
          width: 100%;
          height: auto;
          user-select: none;
          pointer-events: none;
          filter: none;
          transition: filter 320ms ease;
        }

        .menu-card:hover .menu-card-image,
        .menu-card:focus-visible .menu-card-image,
        .menu-card--active .menu-card-image {
          animation:
            cardGoldGlow 2.5s ease-in-out infinite;
        }

        @keyframes cardGoldGlow {
          0%,
          100% {
            filter: drop-shadow(
              0 0 5px rgba(255, 185, 74, 0.25)
            );
          }

          50% {
            filter: drop-shadow(
              0 0 13px rgba(255, 209, 124, 0.65)
            );
          }
        }

        /* Цифра и название */

        .menu-card-content {
          position: absolute;
          top: 6.2%;
          left: 8%;
          right: 8%;
          z-index: 2;

          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;

          pointer-events: none;
          text-align: center;
        }

        .menu-card-number {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(26px, 2.2vw, 42px);
          line-height: 1;
          font-weight: 400;
          letter-spacing: -0.03em;

          background: linear-gradient(
            115deg,
            #9e6419 0%,
            #f4cb87 22%,
            #fff6d9 45%,
            #dfa34e 67%,
            #fff2cb 84%,
            #b67725 100%
          );

          background-size: 240% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;

          animation: goldNumberShift 3.8s linear infinite;
        }

        @keyframes goldNumberShift {
          from {
            background-position: 100% 50%;
          }

          to {
            background-position: -100% 50%;
          }
        }

        /*
           Единственная область затемнения:
           непосредственно под белым названием.

           Псевдоэлемент имеет размеры,
           зависящие от фактической ширины текста.
           Никакой общей подложки сверху карточки.
        */

        .menu-card-title {
          position: relative;
          isolation: isolate;

          display: inline-block;
          width: max-content;
          max-width: 100%;

          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(18px, 1.55vw, 32px);
          line-height: 1.06;
          font-weight: 400;
          letter-spacing: -0.04em;
          color: #fff3dd;

          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .menu-card-title::before {
          content: "";
          position: absolute;

          top: -12px;
          bottom: -12px;
          left: -17px;
          right: -17px;

          z-index: -1;
          pointer-events: none;

          background: radial-gradient(
            ellipse 75% 78% at 50% 50%,
            rgba(0, 0, 0, 0.88) 0%,
            rgba(0, 0, 0, 0.75) 28%,
            rgba(0, 0, 0, 0.43) 55%,
            rgba(0, 0, 0, 0.12) 78%,
            rgba(0, 0, 0, 0) 100%
          );
        }

        /* Стрелка внутри изображения */

        .menu-card-arrow {
          position: absolute;
          left: 50%;
          bottom: 8.2%;
          transform: translateX(-50%);

          width: 48px;
          height: 48px;
          border-radius: 50%;

          border: 1px solid rgba(240, 187, 97, 0.62);
          background: rgba(0, 0, 0, 0.62);
          color: #f0c177;

          display: grid;
          place-items: center;
          z-index: 3;
          pointer-events: none;

          box-shadow:
            inset 0 0 8px rgba(255, 196, 101, 0.08),
            0 0 14px rgba(255, 188, 85, 0.12);

          animation: arrowPulse 2.4s ease-in-out infinite;
        }

        .menu-card-arrow::before {
          content: "";
          position: absolute;
          inset: -9px;
          border-radius: 50%;
          border: 1px solid rgba(243, 194, 111, 0.14);

          animation: arrowRing 2.4s ease-out infinite;
        }

        .menu-card-arrow svg {
          animation: arrowMove 1.6s ease-in-out infinite;
        }

        @keyframes arrowPulse {
          0%,
          100% {
            box-shadow:
              inset 0 0 8px rgba(255, 196, 101, 0.08),
              0 0 14px rgba(255, 188, 85, 0.12);
          }

          50% {
            box-shadow:
              inset 0 0 12px rgba(255, 214, 135, 0.12),
              0 0 22px rgba(255, 194, 104, 0.28),
              0 0 42px rgba(231, 154, 48, 0.12);
          }
        }

        @keyframes arrowRing {
          from {
            opacity: 0.65;
            transform: scale(0.88);
          }

          to {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        @keyframes arrowMove {
          0%,
          100% {
            transform: translateX(0);
          }

          50% {
            transform: translateX(3px);
          }
        }

        .menu-card:hover .menu-card-arrow,
        .menu-card:focus-visible .menu-card-arrow,
        .menu-card--active .menu-card-arrow {
          background: rgba(13, 9, 3, 0.82);
          color: #ffd08a;
          border-color: rgba(255, 206, 126, 0.82);
        }

        .menu-card:focus-visible,
        .menu-close:focus-visible,
        .menu-open-button:focus-visible,
        .menu-logo:focus-visible {
          outline: 2px solid #f4c57a;
          outline-offset: 6px;
        }

        /* Tablet */

        @media (max-width: 1180px) {
          .menu-card-list {
            gap: 12px;
          }

          .menu-card-slot {
            width: clamp(135px, 17vw, 175px);
          }
        }

        /* Mobile */

        @media (max-width: 860px) {
          .menu-header {
            height: 72px;
            padding: 0 18px;
          }

          .menu-logo {
            font-size: 20px;
          }

          .menu-close span:first-child {
            display: none;
          }

          .menu-close-circle {
            width: 42px;
            height: 42px;
            font-size: 24px;
          }

          .menu-stage {
            padding: 10px 18px 22px;
          }

          .menu-card-list {
            flex-wrap: wrap;
            gap: 10px;
            width: min(520px, 100%);
          }

          .menu-card-slot {
            width: calc(50% - 5px);
            max-width: 180px;
          }

          .menu-card-list[data-active]
          .menu-card-slot {
            transform: none !important;
          }

          .menu-card:hover,
          .menu-card:focus-visible,
          .menu-card--active {
            transform:
              perspective(1400px)
              translateY(-10px)
              rotateX(var(--rotate-x))
              rotateY(var(--rotate-y))
              scale(1.04);
          }
        }

        @media (max-width: 520px) {
          .menu-card-slot {
            width: calc(50% - 5px);
            max-width: none;
          }

          .menu-card-title {
            font-size: 16px;
          }

          .menu-card-title::before {
            left: -10px;
            right: -10px;
            top: -8px;
            bottom: -8px;
          }

          .menu-card-number {
            font-size: 24px;
          }

          .menu-card-arrow {
            width: 40px;
            height: 40px;
            bottom: 8%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .menu-demo-page *,
          .menu-demo-page *::before,
          .menu-demo-page *::after {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
