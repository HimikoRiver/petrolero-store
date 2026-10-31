"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import BrandLogo from "./BrandLogo";
import MenuShowcase from "../../menu/MenuShowcase";
import { SearchIcon, AccountIcon, CartIcon } from "./HeaderIcons";
import "./SiteHeader.css";

type Panel = "account" | "cart" | null;

type PetroleroHeaderProps = {
  phase: 0 | 1 | 2 | 3;
  reducedMotion: boolean;
};

export default function SiteHeader({ phase, reducedMotion }: PetroleroHeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [navHidden, setNavHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Scroll down to tuck navigation away; up to bring it back.
  // The chevron toggle always remains accessible for manual control.
  useEffect(() => {
    let lastY = Math.max(0, window.scrollY);

    const handleScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - lastY;
      if (Math.abs(delta) < 6) return;
      lastY = currentY;

      if (currentY < 35) {
        setNavHidden(false);
        return;
      }

      // Do not interrupt intro animation or currently open header controls.
      if (phase !== 3 || menuOpen || searchOpen || panel !== null) return;

      if (delta > 0 && currentY > 125) {
        setNavHidden(true);
      } else if (delta < 0) {
        setNavHidden(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [phase, menuOpen, searchOpen, panel]);

  useEffect(() => {
    if (phase === 3 && window.scrollY > 125) setNavHidden(true);
  }, [phase]);

  useEffect(() => {
    if (navHidden) {
      setSearchOpen(false);
      setPanel(null);
    }
  }, [navHidden]);

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
    setNavHidden(false);
    setPanel(null);
    setSearchSubmitted(false);
    setSearchOpen((current) => !current);
  };

  const openPanel = (next: Exclude<Panel, null>) => {
    setNavHidden(false);
    setSearchOpen(false);
    setPanel((current) => current === next ? null : next);
  };

  const toggleMenu = () => {
    setSearchOpen(false);
    setPanel(null);
    setNavHidden(false);
    setMenuOpen((current) => !current);
  };

  const toggleNavVisibility = () => {
    setNavHidden((current) => !current);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (search.trim()) setSearchSubmitted(true);
  };

  return (
    <>
      <div
        className="petrolero-fixed-header"
        data-phase={phase}
        data-hidden={navHidden && phase === 3}
      >
        <div className="petrolero-fixed-brand">
          <BrandLogo animated={!reducedMotion} variant="gold" />
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
            <button
              ref={menuButtonRef}
              type="button"
              className="petrolero-nav-button petrolero-nav-menu-button"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-controls="petrolero-site-menu"
              aria-expanded={menuOpen}
              onClick={toggleMenu}
            >
              <svg viewBox="0 0 28 28" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" aria-hidden="true">
                <path d="M5 8H23M5 14H23M5 20H23" />
              </svg>
            </button>
          </nav>
        </header>
      </div>

      <button
        className="petrolero-nav-visibility-toggle"
        type="button"
        onClick={toggleNavVisibility}
        aria-label={navHidden ? "Показать навигацию" : "Скрыть навигацию"}
        aria-expanded={!navHidden}
        title={navHidden ? "Показать навигацию" : "Скрыть навигацию"}
        data-hidden={navHidden}
      >
        <svg
          className="petrolero-nav-visibility-chevron"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 13L12 6L19 13M5 19L12 12L19 19" />
        </svg>
      </button>

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

      <MenuShowcase
        open={menuOpen}
        onClose={closeMenu}
        triggerRef={menuButtonRef}
      />
    </>
  );
}
