"use client";

import "./PageScrollControls.css";

type PageScrollControlsProps = {
  reducedMotion: boolean;
};

export default function PageScrollControls({
  reducedMotion,
}: PageScrollControlsProps) {
  const goTo = (position: "top" | "bottom") => {
    const top =
      position === "top"
        ? 0
        : Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
          ) - window.innerHeight;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <nav className="petrolero-page-scroll" aria-label="Быстрая прокрутка страницы">
      <button
        className="petrolero-page-scroll-button petrolero-page-scroll-button--top"
        type="button"
        onClick={() => goTo("top")}
        aria-label="В начало страницы"
        title="В начало страницы"
      >
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5.5 15.5 12 9l6.5 6.5" />
          <path d="M5.5 10.5 12 4l6.5 6.5" />
        </svg>
      </button>

      <span className="petrolero-page-scroll-divider" aria-hidden="true" />

      <button
        className="petrolero-page-scroll-button petrolero-page-scroll-button--bottom"
        type="button"
        onClick={() => goTo("bottom")}
        aria-label="В конец страницы"
        title="В конец страницы"
      >
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5.5 8.5 6.5 6.5 6.5-6.5" />
          <path d="m5.5 13.5 6.5 6.5 6.5-6.5" />
        </svg>
      </button>
    </nav>
  );
}
