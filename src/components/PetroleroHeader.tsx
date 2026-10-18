"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import PetroleroLogo from "./PetroleroLogo";
import "./PetroleroHeader.css";

type Panel = "account" | "cart" | null;

type PetroleroHeaderProps = {
  phase: 0 | 1 | 2 | 3;
  showcase: boolean;
  reducedMotion: boolean;
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.6" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" aria-hidden="true">
      <circle cx="12" cy="7.9" r="3.35" />
      <path d="M4.7 20c0-4.15 2.9-6.5 7.3-6.5s7.3 2.35 7.3 6.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="miter" aria-hidden="true">
      <path d="M2.5 4.5h2.6l2.05 10.2h11.7L21 7H6" />
      <circle cx="9.1" cy="19.4" r="1.2" />
      <circle cx="17.3" cy="19.4" r="1.2" />
    </svg>
  );
}

export default function PetroleroHeader({ phase, showcase, reducedMotion }: PetroleroHeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  useEffect(() => {
    if (!searchOpen) return;
    searchRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSearchOpen(false);
      searchWrapRef.current?.querySelector("button")?.focus();
    };
    const handleOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !searchWrapRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handleOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!panel) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [panel]);

  const toggleSearch = () => {
    setPanel(null);
    setSearchSubmitted(false);
    setSearchOpen((current) => !current);
  };

  const openPanel = (next: Exclude<Panel, null>) => {
    setSearchOpen(false);
    setPanel((current) => current === next ? null : next);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (search.trim()) setSearchSubmitted(true);
  };

  return (
    <>
      <div className="petrolero-fixed-header" data-showcase={showcase} data-phase={phase}>
        <div className="petrolero-fixed-brand">
          <PetroleroLogo animated={!reducedMotion} variant="gold" />
        </div>
        <header className="petrolero-fixed-actions-area">
          <nav className="petrolero-nav-actions" aria-label="Действия магазина">
            <div
              ref={searchWrapRef}
              className="petrolero-nav-search"
              data-open={searchOpen}
            >
              <form
                className="petrolero-nav-search-field"
                id="petrolero-inline-search"
                role="search"
                aria-label="Поиск по каталогу"
                inert={!searchOpen}
                onSubmit={handleSearch}
              >
                <label className="sr-only" htmlFor="petrolero-search-value">
                  Название моторного масла или вязкость
                </label>
                <input
                  id="petrolero-search-value"
                  ref={searchRef}
                  type="search"
                  autoComplete="off"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setSearchSubmitted(false); }}
                  tabIndex={searchOpen ? 0 : -1}
                  placeholder="Название масла или вязкость"
                />
                <svg className="petrolero-nav-search-outline" viewBox="0 0 340 44" preserveAspectRatio="none" aria-hidden="true">
                  <rect className="petrolero-nav-search-glow" x="1.2" y="1.2" width="337.6" height="41.6" pathLength={100} />
                  <rect className="petrolero-nav-search-line" x="1.2" y="1.2" width="337.6" height="41.6" pathLength={100} />
                  <rect className="petrolero-nav-search-head" x="1.2" y="1.2" width="337.6" height="41.6" pathLength={100} />
                </svg>
                <span className="petrolero-nav-search-status" role="status">
                  {searchSubmitted ? "Поиск подключим вместе с каталогом." : ""}
                </span>
              </form>
              <button
                type="button"
                className="petrolero-nav-button petrolero-nav-search-trigger"
                aria-label={searchOpen ? "Закрыть поиск" : "Открыть поиск"}
                aria-controls="petrolero-inline-search"
                aria-expanded={searchOpen}
                onClick={toggleSearch}
              >
                <SearchIcon />
              </button>
            </div>
            <button
              type="button"
              className="petrolero-nav-button"
              aria-label="Личный кабинет"
              aria-expanded={panel === "account"}
              onClick={() => openPanel("account")}
            >
              <AccountIcon />
            </button>
            <button
              type="button"
              className="petrolero-nav-button petrolero-nav-cart"
              aria-label="Корзина"
              aria-expanded={panel === "cart"}
              onClick={() => openPanel("cart")}
            >
              <CartIcon />
              <span className="petrolero-nav-cart-count">0</span>
            </button>
          </nav>
        </header>
      </div>

      {panel && (
        <div className="petrolero-nav-dialog-backdrop" onClick={() => setPanel(null)}>
          <section
            className="petrolero-nav-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={panel === "account" ? "Личный кабинет" : "Корзина"}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="petrolero-nav-dialog-top">
              <span>{panel === "account" ? "ЛИЧНЫЙ КАБИНЕТ" : "КОРЗИНА"}</span>
              <button type="button" onClick={() => setPanel(null)} aria-label="Закрыть">×</button>
            </div>
            <p>
              {panel === "account"
                ? "Авторизацию подключим на этапе личных кабинетов."
                : "Корзина пуста. Добавление товаров появится вместе с каталогом."}
            </p>
          </section>
        </div>
      )}
    </>
  );
}
