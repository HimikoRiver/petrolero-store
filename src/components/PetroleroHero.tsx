"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";

type Direction = "left" | "right";

type AnimatedPhraseProps = {
  text: string;
  direction: Direction;
  delay: number;
  active: boolean;
  accent?: boolean;
};

const FIRST_DELAY = 100;
const SECOND_DELAY = 1350;
const DRIVE_DURATION = 680;
const IMPACT_DURATION = 720;
const WAVE_DURATION = 280;

/* =========================================
   АНИМАЦИЯ БУКВ ПЕРВОГО ЭКРАНА
========================================= */

function AnimatedPhrase({
  text,
  direction,
  delay,
  active,
  accent = false,
}: AnimatedPhraseProps) {
  const characters = Array.from(text);

  const letterCount = characters.filter(
    (character) => character !== " "
  ).length;

  let letterIndex = 0;

  return (
    <span
      aria-hidden="true"
      className={[
        "petrolero-phrase",
        `petrolero-phrase--${direction}`,
        active ? "petrolero-phrase--active" : "",
        accent ? "text-[#d5b179]" : "text-white",
      ].join(" ")}
      style={
        {
          "--phrase-delay": `${delay}ms`,
          "--drive-duration": `${DRIVE_DURATION}ms`,
        } as CSSProperties
      }
    >
      <span className="petrolero-phrase__letters">
        {characters.map((character, index) => {
          if (character === " ") {
            return (
              <span
                key={`space-${index}`}
                className="petrolero-space"
              >
                {"\u00A0"}
              </span>
            );
          }

          const currentIndex = letterIndex++;

          const waveIndex =
            direction === "left"
              ? letterCount - 1 - currentIndex
              : currentIndex;

          const waveProgress =
            waveIndex / Math.max(letterCount - 1, 1);

          const sign = direction === "left" ? 1 : -1;

          return (
            <span
              key={`${character}-${index}`}
              className="petrolero-letter"
              style={
                {
                  "--impact-delay": `${
                    delay +
                    DRIVE_DURATION +
                    waveProgress * WAVE_DURATION
                  }ms`,
                  "--impact-x": `${sign * 0.32}em`,
                  "--rebound-x": `${-sign * 0.19}em`,
                  "--settle-x": `${sign * 0.07}em`,
                  "--impact-duration": `${IMPACT_DURATION}ms`,
                } as CSSProperties
              }
            >
              {character}
            </span>
          );
        })}
      </span>
    </span>
  );
}

/* =========================================
   ПЕРВЫЙ ЭКРАН И ПРОКРУТКА
========================================= */

const HERO_MENU_CARDS = [
  {
    number: "01",
    title: "Каталог",
    image: "/home/images/menu/1.webp",
    href: "/catalog/motornye-masla/legkovye-masla-moto/",
    motion: ["3px", "-9px", "-0.6deg", "-5px", "5px", "0.5deg"],
    duration: "7.8s",
    delay: "-0.6s",
  },
  {
    number: "02",
    title: "О бренде",
    image: "/home/images/menu/2.webp",
    href: "/about/",
    motion: ["-4px", "-7px", "0.7deg", "5px", "5px", "-0.5deg"],
    duration: "8.6s",
    delay: "-2.2s",
  },
  {
    number: "03",
    title: "Технологии",
    image: "/home/images/menu/3.webp",
    href: "/technologies/",
    motion: ["5px", "-6px", "-0.5deg", "-4px", "5px", "0.6deg"],
    duration: "7.2s",
    delay: "-1.4s",
  },
  {
    number: "04",
    title: "Контакты",
    image: "/home/images/menu/4.webp",
    href: "/contacts/",
    motion: ["-3px", "-9px", "0.6deg", "6px", "4px", "-0.6deg"],
    duration: "8.1s",
    delay: "-3.1s",
  },
] as const;

export default function PetroleroHero() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenuCard, setHoveredMenuCard] = useState<number | null>(null);


  const [active, setActive] = useState(false);
  const [reducedMotion, setReducedMotion] =
    useState(false);

  const [videoEnded, setVideoEnded] =
    useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setActive(true)
    );

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () =>
      setReducedMotion(query.matches);

    update();

    query.addEventListener(
      "change",
      update
    );

    return () =>
      query.removeEventListener(
        "change",
        update
      );
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      videoRef.current?.pause();
      setVideoEnded(true);
    }
  }, [reducedMotion]);

  // The menu belongs to the hero. Escape, outside clicks and scrolling close it.
  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      setHoveredMenuCard(null);
      menuTriggerRef.current?.focus();
    };
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuTriggerRef.current?.contains(target)) return;
      if (menuPanelRef.current?.contains(target)) return;
      setMenuOpen(false);
      setHoveredMenuCard(null);
    };
    const scrollContainer = scrollRef.current;
    const handleScroll = () => {
      setMenuOpen(false);
      setHoveredMenuCard(null);
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handleOutsidePointer);
    scrollContainer?.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("pointerdown", handleOutsidePointer);
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  const handleMenuCardPointerMove = (
    event: ReactPointerEvent<HTMLAnchorElement>
  ) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--nav-tilt-x", `${(-y * 4).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--nav-tilt-y", `${(x * 5).toFixed(2)}deg`);
  };

  const resetMenuCardTilt = (element: HTMLAnchorElement) => {
    element.style.setProperty("--nav-tilt-x", "0deg");
    element.style.setProperty("--nav-tilt-y", "0deg");
  };

  return (
    <>
      {/* Временная заглушка для телефонов и планшетов. Десктопный сайт не меняем. */}
      <section className="petrolero-device-placeholder" aria-label="Султан, мобильная версия Petrolero в разработке">
        <div className="petrolero-device-placeholder__halo" aria-hidden="true" />
        <header className="petrolero-device-placeholder__brand">
          <span className="petrolero-device-placeholder__brand-letter">P</span>
          <span>petrolero</span>
        </header>

        <main className="petrolero-device-placeholder__main">
          <div className="petrolero-device-placeholder__emblem" aria-hidden="true">
            <div className="petrolero-device-placeholder__emblem-ring">
              <svg viewBox="0 0 64 64" width="58" height="58" fill="none">
                <path
                  d="M32 7C23 20 15 29 15 39a17 17 0 0 0 34 0C49 29 41 20 32 7Z"
                  stroke="currentColor"
                  strokeWidth="1.65"
                  strokeLinejoin="round"
                />
                <path
                  d="M23 40c0 5 4 9 9 9"
                  stroke="currentColor"
                  strokeWidth="1.65"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <p className="petrolero-device-placeholder__eyebrow">PETROLERO · PREMIUM MOTOR OIL</p>
          <h1>СУЛТАН, МОБИЛЬНАЯ ВЕРСИЯ<br /><span>В РАЗРАБОТКЕ</span></h1>
          <p className="petrolero-device-placeholder__description">
            Я готовлю сайт для телефонов и планшетов.
            Пока полная версия доступна на компьютере.
          </p>
          <div className="petrolero-device-placeholder__rule" aria-hidden="true" />
          <span className="petrolero-device-placeholder__soon">СКОРО ЗДЕСЬ</span>
        </main>

        <footer className="petrolero-device-placeholder__footer">© PETROLERO</footer>
      </section>

      <div
      ref={scrollRef}
      className="petrolero-page-scroll"
      tabIndex={0}
      aria-label="Страница Petrolero"
    >
      <section
        className={`petrolero-hero relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#050505] text-white ${menuOpen ? "petrolero-hero--menu-open" : ""}`}
        aria-label="Главный экран Petrolero"
      >
        {/* Статичный фон */}

        <div className="petrolero-image-layer absolute inset-0 z-0 overflow-hidden">
          <img
            src="/home/images/fon.webp"
            alt=""
            aria-hidden="true"
            className="petrolero-image"
          />
        </div>

        {/* Видео с плавным исчезновением */}

        <div
          className={`petrolero-video-layer absolute inset-0 z-[1] overflow-hidden ${
            videoEnded
              ? "petrolero-video-layer--hidden"
              : ""
          }`}
        >
          <video
            ref={videoRef}
            className="petrolero-video"
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            onEnded={(event) => {
              event.currentTarget.pause();
              setVideoEnded(true);
            }}
          >
            <source
              src="/home/video/car.webm"
              type="video/webm"
            />
          </video>
        </div>

        <div
          className="petrolero-overlay pointer-events-none absolute inset-0 z-[2]"
          aria-hidden="true"
        />

        {/* Header: original navigation replaced by the 60vh floating-card menu */}
        <header className="relative z-[80] flex h-20 shrink-0 items-center justify-between bg-black/20 px-5 backdrop-blur-md sm:px-10 lg:px-16">
          <a
            href="/"
            className="text-xl font-black tracking-[-0.045em]"
            aria-label="Petrolero — главная"
          >
            <span className="text-[#e2bd77]">P</span>{" "}petrolero
          </a>
          <span className="hidden text-[11px] font-medium tracking-[0.28em] text-[#d5b179] sm:block">
            PREMIUM MOTOR OIL
          </span>
          <button
            ref={menuTriggerRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="petrolero-hero-dropdown"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            className={`petrolero-nav-trigger ${menuOpen ? "petrolero-nav-trigger--open" : ""}`}
            onClick={() => {
              setHoveredMenuCard(null);
              setMenuOpen((previous) => !previous);
            }}
          >
            <span className="petrolero-nav-trigger-label">{menuOpen ? "ЗАКРЫТЬ" : "МЕНЮ"}</span>
            <span className="petrolero-nav-trigger-glyph" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </header>

        {/* Floating-card menu; precisely 60% of viewport height below header */}
        <div
          ref={menuPanelRef}
          id="petrolero-hero-dropdown"
          className={`petrolero-nav-panel ${menuOpen ? "petrolero-nav-panel--open" : ""}`}
          role="region"
          aria-label="Меню Petrolero"
          aria-hidden={!menuOpen}
          inert={!menuOpen}
        >
          <div className="petrolero-nav-panel-top" aria-hidden="true">
            <span>НАВИГАЦИЯ PETROLERO</span>
            <span>ВЫБЕРИТЕ РАЗДЕЛ</span>
          </div>
          <nav className="petrolero-nav-cards" aria-label="Разделы сайта">
            <ul
              className="petrolero-nav-cards-list"
              data-active={hoveredMenuCard === null ? "none" : String(hoveredMenuCard)}
            >
              {HERO_MENU_CARDS.map((card, index) => (
                <li
                  key={card.number}
                  className="petrolero-nav-card-slot"
                  style={{ "--nav-entry-delay": `${index * 105 + 130}ms` } as CSSProperties}
                >
                  <a
                    href={card.href}
                    className="petrolero-nav-card"
                    tabIndex={menuOpen ? 0 : -1}
                    aria-label={card.title}
                    onPointerEnter={() => setHoveredMenuCard(index)}
                    onPointerLeave={(event) => {
                      setHoveredMenuCard(null);
                      resetMenuCardTilt(event.currentTarget);
                    }}
                    onPointerMove={handleMenuCardPointerMove}
                    onFocus={() => setHoveredMenuCard(index)}
                    onBlur={(event) => {
                      setHoveredMenuCard(null);
                      resetMenuCardTilt(event.currentTarget);
                    }}
                  >
                    <span
                      className="petrolero-nav-card-float"
                      style={{
                        "--nav-float-x1": card.motion[0],
                        "--nav-float-y1": card.motion[1],
                        "--nav-float-r1": card.motion[2],
                        "--nav-float-x2": card.motion[3],
                        "--nav-float-y2": card.motion[4],
                        "--nav-float-r2": card.motion[5],
                        "--nav-float-duration": card.duration,
                        "--nav-float-delay": card.delay,
                      } as CSSProperties}
                    >
                      <img
                        src={card.image}
                        className="petrolero-nav-card-image"
                        alt=""
                        draggable={false}
                      />
                      <span className="petrolero-nav-card-heading">
                        <span className="petrolero-nav-card-number">{card.number}</span>
                        <span className="petrolero-nav-card-title">{card.title}</span>
                      </span>
                      <span className="petrolero-nav-card-arrow" aria-hidden="true">
                        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                          <path d="M7 16H25M17 8L25 16L17 24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Текст первого экрана */}

        <main className="relative z-10 flex min-h-0 w-full flex-1 flex-col lg:flex-row">
          <div className="petrolero-copy relative z-20 flex w-full flex-col justify-center px-5 pb-6 pt-12 sm:px-10 lg:w-[56%] lg:px-16 lg:pb-24 lg:pt-10">
            <div className="max-w-[780px]">
              <p className="petrolero-intro mb-7 text-[10px] font-semibold tracking-[0.3em] text-[#d5b179] sm:text-xs">
                МОТОРНЫЕ МАСЛА PETROLERO
              </p>

              <h1
                aria-label="Лучшая защита вашего двигателя"
                className="petrolero-heading flex flex-col items-start gap-3 font-black uppercase leading-[1.06] tracking-[-0.055em]"
              >
                <AnimatedPhrase
                  text="ЛУЧШАЯ ЗАЩИТА"
                  direction="left"
                  delay={FIRST_DELAY}
                  active={active}
                />

                <AnimatedPhrase
                  text="ВАШЕГО ДВИГАТЕЛЯ"
                  direction="right"
                  delay={SECOND_DELAY}
                  active={active}
                  accent
                />
              </h1>

              <div className="petrolero-content mt-8 sm:mt-10">
                <p className="max-w-[470px] text-sm leading-7 text-white/75 sm:text-base">
                  Современные моторные масла для уверенной
                  работы двигателя. Откройте линейку
                  Petrolero и подберите подходящий продукт.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="/catalog/motornye-masla/legkovye-masla-moto/"
                    className="petrolero-button inline-flex min-h-12 items-center justify-center gap-5 bg-[#d5b179] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#080808] transition-all hover:bg-[#edcb90] sm:px-8"
                  >
                    Выбрать масло
                    <span aria-hidden="true">
                      →
                    </span>
                  </a>

                  <a
                    href="/catalog/"
                    className="inline-flex min-h-12 items-center border-b border-[#d5b179]/60 text-[11px] font-medium uppercase tracking-[0.13em] text-white/85 transition-colors hover:text-[#d5b179]"
                  >
                    Перейти в каталог
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Нижняя полоса */}

        <footer className="relative z-20 shrink-0 border-t border-white/10 bg-black/50 px-5 py-4 backdrop-blur-md sm:px-10 lg:px-16">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-medium uppercase tracking-[0.15em] text-white/65 sm:text-xs">
              <span>Моторные масла</span>
              <span>Современные технологии</span>
              <span>Защита двигателя</span>
            </div>

            <a
              href="/catalog/motornye-masla/legkovye-masla-moto/"
              className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#d5b179] transition-colors hover:text-white"
            >
              Смотреть продукцию →
            </a>
          </div>
        </footer>
      </section>

      <style jsx global>{`

        /* =============================================================
           MOBILE/TABLET PLACEHOLDER — only at narrow screens / tablets
           ============================================================= */
        .petrolero-device-placeholder {
          display: none;
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 100vh;
          min-height: 100svh;
          overflow: hidden;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: clamp(20px, 5vw, 44px);
          color: #f6efdf;
          background:
            radial-gradient(ellipse 70% 47% at 50% 44%, rgba(136, 85, 30, 0.17), transparent 79%),
            linear-gradient(155deg, #11100d 0%, #040404 54%, #0d0b08 100%);
          text-align: center;
          font-family: Arial, Helvetica, sans-serif;
        }
        .petrolero-device-placeholder::before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 14px;
          border: 1px solid rgba(223, 177, 98, 0.11);
          pointer-events: none;
        }
        .petrolero-device-placeholder__halo {
          position: absolute;
          z-index: -1;
          top: 50%;
          left: 50%;
          width: 75vmin;
          height: 75vmin;
          max-width: 500px;
          max-height: 500px;
          border: 1px solid rgba(204, 145, 58, 0.075);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 80px rgba(183, 125, 48, 0.016), 0 0 0 160px rgba(183, 125, 48, 0.012);
          pointer-events: none;
        }
        .petrolero-device-placeholder__brand {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.055em;
        }
        .petrolero-device-placeholder__brand-letter { color: #e2bd77; }
        .petrolero-device-placeholder__main {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 660px;
          padding: 22px 0;
        }
        .petrolero-device-placeholder__emblem {
          display: grid;
          place-items: center;
          width: clamp(144px, 29vmin, 188px);
          height: clamp(144px, 29vmin, 188px);
          margin-bottom: clamp(26px, 5vh, 46px);
          border: 1px solid rgba(219, 170, 92, 0.15);
          border-radius: 50%;
          box-shadow: 0 0 70px rgba(208, 146, 60, 0.11);
          animation: petrolero-device-placeholder-breathe 6s ease-in-out infinite;
        }
        .petrolero-device-placeholder__emblem-ring {
          display: grid;
          place-items: center;
          width: 74%;
          height: 74%;
          border: 1px solid rgba(227, 174, 85, 0.43);
          border-radius: 50%;
          color: #d5ab67;
          background: radial-gradient(circle, rgba(221, 160, 71, 0.06), transparent 78%);
        }
        .petrolero-device-placeholder__eyebrow,
        .petrolero-device-placeholder__soon {
          color: #d7ad6b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.24em;
        }
        .petrolero-device-placeholder h1 {
          margin: 20px 0 18px;
          font-size: clamp(25px, 5.5vw, 46px);
          font-weight: 850;
          letter-spacing: -0.04em;
          line-height: 1.16;
          text-wrap: balance;
        }
        .petrolero-device-placeholder h1 span {
          color: #d5b179;
        }
        .petrolero-device-placeholder__description {
          max-width: 440px;
          margin: 0;
          color: rgba(245, 238, 224, 0.69);
          font-size: clamp(13px, 2.2vw, 16px);
          line-height: 1.75;
          text-wrap: pretty;
        }
        .petrolero-device-placeholder__rule {
          width: 54px;
          height: 1px;
          margin: 28px 0 21px;
          background: linear-gradient(90deg, transparent, #d5b179, transparent);
        }
        .petrolero-device-placeholder__footer {
          color: rgba(239, 192, 119, 0.55);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.28em;
        }
        @keyframes petrolero-device-placeholder-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 70px rgba(208, 146, 60, 0.11); }
          50% { transform: scale(1.04); box-shadow: 0 0 90px rgba(208, 146, 60, 0.17); }
        }
        @media (max-width: 1199px), (hover: none) and (pointer: coarse) and (max-width: 1366px) {
          .petrolero-page-scroll { display: none !important; }
          .petrolero-device-placeholder { display: flex; }
        }
        @media (prefers-reduced-motion: reduce) {
          .petrolero-device-placeholder__emblem { animation: none; }
        }

        .petrolero-page-scroll {
          height: 100vh;
          height: 100svh;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior-y: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #896333 #090909;
        }

        .petrolero-page-scroll:focus {
          outline: none;
        }

        .petrolero-hero {
          min-height: 100vh;
          min-height: 100svh;
        }

        .petrolero-image-layer {
          background: #050505;
        }

        .petrolero-image,
        .petrolero-video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 62% center;
          user-select: none;
        }

        .petrolero-video-layer {
          opacity: 1;
          transition: opacity 1000ms ease;
        }

        .petrolero-video-layer--hidden {
          opacity: 0;
          pointer-events: none;
        }

        .petrolero-overlay {
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.99) 0%,
              rgba(0, 0, 0, 0.94) 24%,
              rgba(0, 0, 0, 0.77) 43%,
              rgba(0, 0, 0, 0.28) 70%,
              rgba(0, 0, 0, 0.08) 100%
            ),
            linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.68),
              transparent 32%,
              transparent 73%,
              rgba(0, 0, 0, 0.32)
            );
        }


        /* Dropdown sits below the original 80px hero header, never fullscreen. */
        .petrolero-nav-trigger {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #edc887;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }
        .petrolero-nav-trigger-glyph {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 6px;
          width: 43px;
          height: 43px;
          border: 1px solid rgba(235, 187, 108, 0.72);
          border-radius: 50%;
          transition: box-shadow 300ms ease, transform 350ms ease;
        }
        .petrolero-nav-trigger-glyph span {
          display: block;
          width: 17px;
          height: 1px;
          background: currentColor;
          transition: transform 300ms ease;
        }
        .petrolero-nav-trigger--open .petrolero-nav-trigger-glyph span:first-child {
          transform: translateY(3.5px) rotate(45deg);
        }
        .petrolero-nav-trigger--open .petrolero-nav-trigger-glyph span:last-child {
          transform: translateY(-3.5px) rotate(-45deg);
        }
        .petrolero-nav-trigger:hover .petrolero-nav-trigger-glyph {
          box-shadow: 0 0 19px rgba(239, 179, 83, 0.42);
        }
        /* Сильное размытие реального содержимого хиро при раскрытии.
           Слои меню и шапка остаются резкими, так как фильтр на них не ставится. */
        .petrolero-image-layer,
        .petrolero-video-layer,
        .petrolero-hero > main,
        .petrolero-hero > .petrolero-scroll-arrow,
        .petrolero-hero > footer {
          transition: filter 620ms cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        .petrolero-hero--menu-open .petrolero-image-layer,
        .petrolero-hero--menu-open .petrolero-video-layer {
          filter: blur(44px) saturate(0.55);
        }
        .petrolero-hero--menu-open > main,
        .petrolero-hero--menu-open > .petrolero-scroll-arrow,
        .petrolero-hero--menu-open > footer {
          filter: blur(36px);
        }
        .petrolero-nav-panel {
          position: absolute;
          top: 80px;
          right: 0;
          left: 0;
          z-index: 70;
          display: flex;
          flex-direction: column;
          height: 60vh;
          height: 60svh;
          overflow: hidden;
          /* Плотное размытие ТОЛЬКО того, что позади панели. */
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(85px) saturate(0.65);
          -webkit-backdrop-filter: blur(85px) saturate(0.65);
          border: none;
          box-shadow: none;
          visibility: hidden;
          opacity: 0;
          pointer-events: none;
          clip-path: inset(0 0 100% 0);
          transform: translateY(-10px);
          transition:
            clip-path 800ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 650ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 350ms ease,
            visibility 800ms;
        }
        .petrolero-nav-panel--open {
          visibility: visible;
          opacity: 1;
          pointer-events: auto;
          clip-path: inset(0 0 0 0);
          transform: translateY(0);
        }
        .petrolero-nav-panel-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-shrink: 0;
          padding: 13px clamp(20px, 4vw, 64px) 0;
          color: #c99a57;
          font-size: 9px;
          letter-spacing: 0.2em;
        }
        .petrolero-nav-cards {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-height: 0;
          width: 100%;
          padding: 6px 18px 12px;
        }
        .petrolero-nav-cards-list {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(10px, 1.35vw, 18px);
          width: 100%;
          min-width: 0;
          margin: 0;
          padding: 0;
          list-style: none;
          perspective: 1200px;
        }
        .petrolero-nav-card-slot {
          position: relative;
          flex: 0 0 auto;
          /* Размер зависит от окна и высоты меню. */
          width: clamp(148px, min(15vw, 26svh), 225px);
          height: auto;
          min-width: 0;
          --nav-shift-x: 0px;
          --nav-arch-y: 0px;
          translate: var(--nav-shift-x) var(--nav-arch-y);
          transition: translate 400ms cubic-bezier(0.2,0.8,0.2,1);
        }
        /* Арка: внешние карточки приподняты над центральными. */
        .petrolero-nav-card-slot:nth-child(1),
        .petrolero-nav-card-slot:nth-child(4) { --nav-arch-y: -21px; }
        .petrolero-nav-card-slot:nth-child(2),
        .petrolero-nav-card-slot:nth-child(3) { --nav-arch-y: 15px; }
        .petrolero-nav-panel--open .petrolero-nav-card-slot {
          animation: petrolero-nav-card-appear 720ms cubic-bezier(0.16,1,0.3,1) var(--nav-entry-delay) backwards;
        }
        @keyframes petrolero-nav-card-appear {
          from { opacity: 0; transform: translateY(55px) scale(0.88) rotateY(-10deg); }
          to { opacity: 1; transform: translateY(0) scale(1) rotateY(0); }
        }
        .petrolero-nav-card-slot:has(.petrolero-nav-card:hover),
        .petrolero-nav-card-slot:has(.petrolero-nav-card:focus-visible) {
          z-index: 10;
        }
        .petrolero-nav-cards-list[data-active="0"] .petrolero-nav-card-slot:nth-child(n+2) { --nav-shift-x: 8px; }
        .petrolero-nav-cards-list[data-active="1"] .petrolero-nav-card-slot:nth-child(1) { --nav-shift-x: -8px; }
        .petrolero-nav-cards-list[data-active="1"] .petrolero-nav-card-slot:nth-child(n+3) { --nav-shift-x: 8px; }
        .petrolero-nav-cards-list[data-active="2"] .petrolero-nav-card-slot:nth-child(-n+2) { --nav-shift-x: -8px; }
        .petrolero-nav-cards-list[data-active="2"] .petrolero-nav-card-slot:nth-child(4) { --nav-shift-x: 8px; }
        .petrolero-nav-cards-list[data-active="3"] .petrolero-nav-card-slot:nth-child(-n+3) { --nav-shift-x: -8px; }
        .petrolero-nav-card {
          display: block;
          position: relative;
          width: 100%;
          height: auto;
          color: #fff;
          text-decoration: none;
          --nav-tilt-x: 0deg;
          --nav-tilt-y: 0deg;
          transform: perspective(1000px) rotateX(var(--nav-tilt-x)) rotateY(var(--nav-tilt-y)) scale(1);
          transition: transform 400ms cubic-bezier(0.2,0.8,0.2,1);
        }
        .petrolero-nav-card:hover,
        .petrolero-nav-card:focus-visible {
          transform: perspective(1000px) translateY(-9px) rotateX(var(--nav-tilt-x)) rotateY(var(--nav-tilt-y)) scale(1.065);
        }
        .petrolero-nav-card-float {
          position: relative;
          display: block;
          width: 100%;
          height: auto;
          animation: petrolero-nav-card-float var(--nav-float-duration) ease-in-out var(--nav-float-delay) infinite;
        }
        @keyframes petrolero-nav-card-float {
          0%, 100% { transform: translate3d(0,0,0) rotate(0); }
          31% { transform: translate3d(var(--nav-float-x1),var(--nav-float-y1),0) rotate(var(--nav-float-r1)); }
          68% { transform: translate3d(var(--nav-float-x2),var(--nav-float-y2),0) rotate(var(--nav-float-r2)); }
        }
        .petrolero-nav-card-image {
          display: block;
          width: 100%;
          height: auto;
          /* Никакого contain: никаких пустых полос над и под карточкой. */
          object-fit: initial;
          user-select: none;
          pointer-events: none;
        }
        .petrolero-nav-card:hover .petrolero-nav-card-image,
        .petrolero-nav-card:focus-visible .petrolero-nav-card-image {
          animation: petrolero-nav-image-glow 2.4s ease-in-out infinite;
        }
        @keyframes petrolero-nav-image-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(255,187,76,0.35)); }
          50% { filter: drop-shadow(0 0 12px rgba(255,211,131,0.8)); }
        }
        .petrolero-nav-card-heading {
          position: absolute;
          top: 6.4%;
          left: 6%;
          right: 6%;
          z-index: 2;
          display: flex;
          align-items: center;
          flex-direction: column;
          gap: 6px;
          text-align: center;
          pointer-events: none;
        }
        .petrolero-nav-card-number {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(21px, 2.1vw, 34px);
          line-height: 1;
          background: linear-gradient(105deg, #b17724, #fff0bc, #d79c3d, #fff6d6, #b17724);
          background-size: 240% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: petrolero-nav-number-shine 4s linear infinite;
        }
        @keyframes petrolero-nav-number-shine {
          from { background-position: 100% 50%; }
          to { background-position: -100% 50%; }
        }
        .petrolero-nav-card-title {
          position: relative;
          z-index: 0;
          isolation: isolate;
          display: inline-block;
          width: max-content;
          max-width: 100%;
          color: #fff5df;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(13px, 1.45vw, 22px);
          line-height: 1.1;
          white-space: nowrap;
        }
        .petrolero-nav-card-title::before {
          content: '';
          position: absolute;
          z-index: -1;
          inset: -9px -12px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.9), rgba(0,0,0,0.54) 46%, transparent 76%);
          pointer-events: none;
        }
        .petrolero-nav-card-arrow {
          position: absolute;
          z-index: 3;
          bottom: 8.5%;
          left: 50%;
          display: grid;
          place-items: center;
          width: clamp(28px, 3.2vw, 44px);
          aspect-ratio: 1;
          transform: translateX(-50%);
          border: 1px solid rgba(241,190,105,0.85);
          border-radius: 50%;
          background: rgba(0,0,0,0.67);
          color: #f6cb80;
          pointer-events: none;
          animation: petrolero-nav-arrow-glow 2.4s ease-in-out infinite;
        }
        .petrolero-nav-card-arrow svg { animation: petrolero-nav-arrow-shift 1.8s ease-in-out infinite; }
        @keyframes petrolero-nav-arrow-glow {
          0%,100% { box-shadow: 0 0 6px rgba(255,195,104,0.27); }
          50% { box-shadow: 0 0 21px rgba(255,195,104,0.66); }
        }
        @keyframes petrolero-nav-arrow-shift {
          0%,100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .petrolero-nav-card:hover .petrolero-nav-card-arrow,
        .petrolero-nav-card:focus-visible .petrolero-nav-card-arrow {
          background: #e9bd75;
          color: #080705;
        }
        .petrolero-nav-trigger:focus-visible,
        .petrolero-nav-card:focus-visible { outline: 2px solid #ffe0a3; outline-offset: 5px; }
        @media (max-width: 767px) {
          .petrolero-nav-trigger-label { font-size: 10px; }
          .petrolero-nav-panel-top { padding: 9px 18px 0; font-size: 8px; }
          .petrolero-nav-panel-top span:last-child { display: none; }
          .petrolero-nav-cards { overflow-x: auto; justify-content: flex-start; padding: 0 16px 10px; scrollbar-width: thin; scrollbar-color: #a77836 #050505; }
          .petrolero-nav-cards-list { flex: 0 0 max-content; width: max-content; justify-content: flex-start; gap: 10px; padding: 0 5px; }
          .petrolero-nav-card-slot {
            width: min(42vw, 25svh);
            height: auto;
          }
          .petrolero-nav-card-slot:nth-child(1),
          .petrolero-nav-card-slot:nth-child(4) { --nav-arch-y: -12px; }
          .petrolero-nav-card-slot:nth-child(2),
          .petrolero-nav-card-slot:nth-child(3) { --nav-arch-y: 9px; }
          .petrolero-nav-card-number { font-size: clamp(17px, 4.3vw, 25px); }
          .petrolero-nav-card-title { font-size: clamp(12px, 3.1vw, 17px); }
          .petrolero-nav-card-arrow { width: 29px; }
        }
        @media (max-height: 540px) and (min-width: 768px) {
          .petrolero-nav-card-slot {
            width: min(13vw, 24svh);
            height: auto;
          }
          .petrolero-nav-card-slot:nth-child(1),
          .petrolero-nav-card-slot:nth-child(4) { --nav-arch-y: -10px; }
          .petrolero-nav-card-slot:nth-child(2),
          .petrolero-nav-card-slot:nth-child(3) { --nav-arch-y: 7px; }
          .petrolero-nav-panel-top { padding-top: 6px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .petrolero-nav-panel { transition: none !important; }
          .petrolero-nav-card-slot,
          .petrolero-nav-card-float,
          .petrolero-nav-card-number,
          .petrolero-nav-card-arrow,
          .petrolero-nav-card-arrow svg { animation: none !important; }
        }

        /* Первый экран */

        .petrolero-heading {
          font-size: clamp(1.3rem, 3.6vw, 4.2rem);
        }

        .petrolero-phrase {
          display: inline-block;
          position: relative;
          white-space: nowrap;
          opacity: 0;
          isolation: isolate;
        }

        .petrolero-phrase--left {
          --entry-x: -150vw;
        }

        .petrolero-phrase--right {
          --entry-x: 150vw;
        }

        .petrolero-phrase--active {
          animation: petrolero-drive
            var(--drive-duration) linear both;
          animation-delay: var(--phrase-delay);
        }

        .petrolero-phrase__letters {
          display: inline-block;
          position: relative;
          white-space: nowrap;
        }

        .petrolero-letter,
        .petrolero-space {
          display: inline-block;
          position: relative;
          vertical-align: baseline;
        }

        .petrolero-phrase--active .petrolero-letter {
          animation: petrolero-chain-impact
            var(--impact-duration)
            cubic-bezier(0.22, 0.8, 0.25, 1)
            both;
          animation-delay: var(--impact-delay);
        }

        @keyframes petrolero-drive {
          0% {
            opacity: 1;
            transform: translateX(var(--entry-x));
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes petrolero-chain-impact {
          0% {
            transform: translateX(0);
          }

          15% {
            transform: translateX(var(--impact-x));
          }

          36% {
            transform: translateX(var(--rebound-x));
          }

          60% {
            transform: translateX(var(--settle-x));
          }

          85%,
          100% {
            transform: translateX(0);
          }
        }

        .petrolero-intro {
          animation: petrolero-fade-in
            900ms ease-out 200ms both;
        }

        .petrolero-content {
          animation: petrolero-fade-in
            1000ms ease-out 2300ms both;
        }

        @keyframes petrolero-fade-in {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .petrolero-button {
          box-shadow:
            0 6px 30px rgba(213, 177, 121, 0.12);
        }

        .petrolero-button:hover {
          box-shadow:
            0 8px 34px rgba(213, 177, 121, 0.3);
        }

        .petrolero-arrow-ring {
          animation: petrolero-arrow-bounce
            1.8s ease-in-out infinite;
        }

        @keyframes petrolero-arrow-bounce {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(9px);
          }
        }

        /* Планшет */

        @media (min-width: 768px) and (max-width: 1023px) {
          .petrolero-heading {
            font-size: clamp(1.8rem, 5vw, 3.4rem);
          }

          .petrolero-image,
          .petrolero-video {
            object-position: 67% center;
          }




        }

        /* Телефон */

        @media (max-width: 767px) {
          .petrolero-copy {
            justify-content: flex-start;
            padding-top: 7vh;
          }

          .petrolero-heading {
            font-size: clamp(1.12rem, 5vw, 2.25rem);
            gap: 0.65rem;
          }

          .petrolero-intro {
            margin-bottom: 1.2rem;
          }

          .petrolero-content {
            margin-top: 1.25rem;
          }

          .petrolero-content p {
            max-width: 310px;
            font-size: 12px;
            line-height: 1.7;
          }

          .petrolero-content > div {
            margin-top: 1.2rem;
          }

          .petrolero-video,
          .petrolero-image {
            object-position: 70% center;
          }

          .petrolero-overlay {
            background: linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.96) 0%,
              rgba(0, 0, 0, 0.88) 34%,
              rgba(0, 0, 0, 0.35) 67%,
              rgba(0, 0, 0, 0.65) 100%
            );
          }

          .petrolero-scroll-arrow {
            bottom: 88px;
          }






















        }

        @media (prefers-reduced-motion: reduce) {
          .petrolero-phrase,
          .petrolero-letter,
          .petrolero-intro,
          .petrolero-content,
          .petrolero-arrow-ring {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .petrolero-video-layer {
            transition: none !important;
          }
        }
      `}</style>
    </div>
    </>
  );
}
