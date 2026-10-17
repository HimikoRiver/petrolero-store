"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import PetroleroLogo from "@/components/PetroleroLogo";
import OilVideoSurface from "@/components/OilVideoSurface";
import type { OilRipple } from "@/components/OilVideoSurface";
import "./PetroleroLanding.css";

const VIDEO_SRC = "/home/video/oil.webm";
const MAX_RIPPLES = 12;
type Panel = "search" | "account" | "cart" | null;

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.6" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="7.9" r="3.35" />
      <path d="M4.7 20c0-4.15 2.9-6.5 7.3-6.5s7.3 2.35 7.3 6.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 4.5h2.6l2.05 10.2h11.7L21 7H6" />
      <circle cx="9.1" cy="19.4" r="1.2" />
      <circle cx="17.3" cy="19.4" r="1.2" />
    </svg>
  );
}

export default function PetroleroLanding() {
  const heroRef = useRef<HTMLElement>(null);
  const secondRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const ripplesRef = useRef<OilRipple[]>([]);
  const lastPointerRef = useRef({ x: -1, y: -1, time: -1 });
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [search, setSearch] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    setWebglReady(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    setVideoElement(videoRef.current);

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
    } else {
      void video.play().catch(() => {
        // Video remains a static visual fallback if autoplay is unavailable.
      });
    }
  }, [reducedMotion, videoReady]);

  useEffect(() => {
    if (reducedMotion) {
      setPhase(3);
      return;
    }
    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), 450),
      setTimeout(() => setPhase(2), 2300),
      setTimeout(() => setPhase(3), 3300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  useEffect(() => {
    if (!panel) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    document.addEventListener("keydown", handleEscape);
    if (panel === "search") searchRef.current?.focus();
    return () => document.removeEventListener("keydown", handleEscape);
  }, [panel]);

  const emitRipple = (event: ReactPointerEvent<HTMLElement>, force = false) => {
    if (reducedMotion || !heroRef.current || panel) return;
    const rect = heroRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const now = performance.now() * 0.001;
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    const previous = lastPointerRef.current;
    const moved = previous.time < 0
      ? 0
      : Math.hypot((x - previous.x) * rect.width, (y - previous.y) * rect.height);
    const elapsed = now - previous.time;

    if (!force && previous.time >= 0 && (elapsed < 0.13 || moved < 16)) return;
    if (force && previous.time >= 0 && elapsed < 0.06) return;

    ripplesRef.current.push({
      x,
      y,
      time: now,
      strength: force ? 1.35 : Math.min(1.15, 0.85 + moved / 220),
    });
    if (ripplesRef.current.length > MAX_RIPPLES) ripplesRef.current.shift();
    lastPointerRef.current = { x, y, time: now };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest("button, a, input")) return;
    emitRipple(event, true);
  };

  const openPanel = (next: Exclude<Panel, null>) => {
    setSearchSubmitted(false);
    setPanel((previous) => previous === next ? null : next);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!search.trim()) return;
    setSearchSubmitted(true);
  };

  return (
    <main className="petrolero-home">
      <section
        ref={heroRef}
        className="petrolero-home-hero"
        aria-label="Моторные масла Petrolero"
        onPointerMove={(event) => emitRipple(event)}
        onPointerDown={handlePointerDown}
      >
        <div className="petrolero-home-oil" aria-hidden="true">
          <video
            ref={videoRef}
            className="petrolero-home-video"
            src={VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
          />
          {webglReady && videoReady && videoElement && (
            <OilVideoSurface
              video={videoElement}
              ripplesRef={ripplesRef}
              reducedMotion={reducedMotion}
            />
          )}
        </div>
        <div className="petrolero-home-vignette" aria-hidden="true" />

        <div className="petrolero-home-logo" data-phase={phase}>
          <PetroleroLogo animated={!reducedMotion} variant="gold" />
        </div>

        <header className="petrolero-home-header">
          <nav className="petrolero-home-actions" aria-label="Действия магазина">
            <button
              type="button"
              className="petrolero-home-icon-button"
              aria-label="Поиск"
              aria-expanded={panel === "search"}
              title="Поиск"
              onClick={() => openPanel("search")}
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              className="petrolero-home-icon-button"
              aria-label="Войти в личный кабинет"
              aria-expanded={panel === "account"}
              title="Личный кабинет"
              onClick={() => openPanel("account")}
            >
              <AccountIcon />
            </button>
            <button
              type="button"
              className="petrolero-home-icon-button petrolero-home-cart"
              aria-label="Корзина"
              aria-expanded={panel === "cart"}
              title="Корзина"
              onClick={() => openPanel("cart")}
            >
              <CartIcon />
              <span className="petrolero-home-cart-count">0</span>
            </button>
          </nav>
        </header>

        <div className="petrolero-home-copy" data-visible={phase === 3}>
          <p className="petrolero-home-eyebrow">МОТОРНЫЕ МАСЛА PETROLERO</p>
          <h1>
            <span>ЛУЧШАЯ ЗАЩИТА</span>
            <span>ВАШЕГО <em>ДВИГАТЕЛЯ</em></span>
          </h1>
          <p className="petrolero-home-slogan">ТЕХНОЛОГИИ, КОТОРЫМ ДОВЕРЯЕТ ДВИГАТЕЛЬ</p>
        </div>

        <button
          className="petrolero-home-scroll"
          type="button"
          aria-label="Прокрутить ко второму экрану"
          onClick={() => secondRef.current?.scrollIntoView({
            behavior: reducedMotion ? "instant" : "smooth",
            block: "start",
          })}
        >
          <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v17m-7-7 7 7 7-7" />
          </svg>
        </button>

        {panel && (
          <div className="petrolero-home-panel-backdrop" onPointerDown={(event) => event.stopPropagation()} onClick={() => setPanel(null)}>
            <section
              className="petrolero-home-panel"
              role="dialog"
              aria-modal="true"
              aria-label={panel === "search" ? "Поиск" : panel === "account" ? "Личный кабинет" : "Корзина"}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="petrolero-home-panel-top">
                <span>{panel === "search" ? "ПОИСК" : panel === "account" ? "ЛИЧНЫЙ КАБИНЕТ" : "КОРЗИНА"}</span>
                <button type="button" onClick={() => setPanel(null)} aria-label="Закрыть">×</button>
              </div>
              {panel === "search" ? (
                <form onSubmit={handleSearch} className="petrolero-home-search-form">
                  <label htmlFor="petrolero-home-search-field">Найти моторное масло</label>
                  <div>
                    <input
                      ref={searchRef}
                      id="petrolero-home-search-field"
                      value={search}
                      onChange={(event) => { setSearch(event.target.value); setSearchSubmitted(false); }}
                      placeholder="Название или вязкость..."
                    />
                    <button type="submit">Найти ↗</button>
                  </div>
                  <p>{searchSubmitted ? "Поиск по каталогу подключим вместе с товарами." : "Поиск будет подключён после разработки каталога."}</p>
                </form>
              ) : (
                <p className="petrolero-home-panel-note">
                  {panel === "account"
                    ? "Авторизация появится после подключения личных кабинетов."
                    : "В корзине пока нет товаров. Каталог подключим следующим этапом."}
                </p>
              )}
            </section>
          </div>
        )}
      </section>

      {/* Intentionally empty: content of section two will be built later. */}
      <section ref={secondRef} className="petrolero-home-next" aria-label="Второй экран" />
    </main>
  );
}
