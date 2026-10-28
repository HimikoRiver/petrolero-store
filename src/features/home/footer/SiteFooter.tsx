"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import "./SiteFooter.css";

type SocialIcon = "youtube" | "rutube" | "vk" | "telegram" | "mail";

const SOCIAL_LINKS: {
  name: string;
  description: string;
  href: string;
  icon: SocialIcon;
}[] = [
  {
    name: "YouTube",
    description: "YouTube — Petrolero. Скользкая тема",
    href: "https://www.youtube.com/@PetroleroAdditives",
    icon: "youtube",
  },
  {
    name: "RUTUBE",
    description: "RUTUBE — Petrolero. Скользкая тема",
    href: "https://rutube.ru/channel/667110/",
    icon: "rutube",
  },
  {
    name: "ВКонтакте",
    description: "ВКонтакте — дилер Petrolero 51",
    href: "https://vk.com/petrolero51",
    icon: "vk",
  },
  {
    name: "Telegram",
    description: "Telegram — дилер Petrolero 51",
    href: "https://t.me/petrolero51",
    icon: "telegram",
  },
  {
    name: "Почта",
    description: "Написать Petrolero на info@petrolero.ru",
    href: "mailto:info@petrolero.ru",
    icon: "mail",
  },
];

function SocialGlyph({ icon }: { icon: SocialIcon }) {
  switch (icon) {
    case "youtube":
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
          <rect x="3.3" y="7.1" width="21.4" height="13.8" rx="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="m11.5 10.2 6.2 3.8-6.2 3.8z" fill="currentColor" />
        </svg>
      );
    case "rutube":
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
          <path d="M7 22V6h8.1c4.1 0 6.5 2.2 6.5 5.7 0 2.5-1.2 4.1-3.4 4.9L22 22h-4.6l-3.2-4.8h-3.1V22zM11.1 10v3.7h4c1.5 0 2.2-.6 2.2-1.9S16.6 10 15.1 10z" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
          <circle cx="23.1" cy="6.6" r="2" fill="currentColor" />
        </svg>
      );
    case "vk":
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
          <rect x="3" y="6.2" width="22" height="15.6" rx="5.6" fill="none" stroke="currentColor" strokeWidth="1.65" />
          <path d="M7 10.4c1.2 5.2 4.2 8 8.6 8.1v-3c1.4.1 2.2 1.1 3 3h2.9c-.8-2-1.6-3.4-3.1-4.2 1.2-.9 2.2-2.2 3-3.9h-2.8c-.7 1.4-1.7 2.8-3 3.7v-3.7h-2.7v5.5c-1.2-.5-2.1-2.6-2.8-5.5z" fill="currentColor" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
          <path d="M24 5.2 4.5 12.8c-1 .4-.9 1.4.1 1.8l5.1 1.7 2 5.8c.3.8 1.2 1 1.8.4l2.9-3.4 4.7 3.3c.7.5 1.6.1 1.8-.8l3-14.6c.2-1.1-.8-2-1.9-1.8Z" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
          <path d="m9.7 16.3 11.5-7.4-9.5 13.2" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
          <rect x="3.3" y="6.6" width="21.4" height="14.8" rx="2.8" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <path d="m4.8 8.5 9.2 7.2 9.2-7.2" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

// A dense deterministic stipple, drawn as only two SVG paths per wordmark.
// Unlike a blurred turbulence overlay, individual flecks remain visible.
function createGrain() {
  let seed = 26371;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const dark: string[] = [];
  const light: string[] = [];

  for (let i = 0; i < 1450; i++) {
    const x = (random() * 128).toFixed(2);
    const y = (random() * 128).toFixed(2);
    const size = 0.5 + random() * (i % 11 === 0 ? 2.7 : 1.5);
    const w = size.toFixed(2);
    const h = (size * (0.65 + random() * 0.65)).toFixed(2);
    const fleck = `M${x} ${y}h${w}v${h}h-${w}Z`;
    (random() > 0.35 ? dark : light).push(fleck);
  }

  return { dark: dark.join(""), light: light.join("") };
}

const GRAIN = createGrain();

function PetroleroWordmark({ illuminated }: { illuminated: boolean }) {
  const id = illuminated ? "petrolero-footer-lit" : "petrolero-footer-dark";

  return (
    <svg
      className="petrolero-site-footer-wordmark-svg"
      viewBox="0 0 1200 230"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id + "-gold"} x1="0" y1="0" x2="0.16" y2="1">
          {illuminated ? (
            <>
              <stop offset="0%" stopColor="#ffe0a0" />
              <stop offset="24%" stopColor="#e4b96f" />
              <stop offset="55%" stopColor="#bc8643" />
              <stop offset="82%" stopColor="#e2ad65" />
              <stop offset="100%" stopColor="#92602a" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#32291e" />
              <stop offset="60%" stopColor="#231e18" />
              <stop offset="100%" stopColor="#191716" />
            </>
          )}
        </linearGradient>

        <pattern
          id={id + "-grain"}
          patternUnits="userSpaceOnUse"
          width="128"
          height="128"
        >
          <path
            d={GRAIN.dark}
            fill="#140c04"
            opacity={illuminated ? "0.96" : "0.5"}
          />
          <path
            d={GRAIN.light}
            fill="#ffdfa0"
            opacity={illuminated ? "0.68" : "0.12"}
          />
        </pattern>
      </defs>

      <g
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="234"
        letterSpacing="-6"
        textAnchor="middle"
      >
        <text
          x="600"
          y="216"
          textLength="1160"
          lengthAdjust="spacingAndGlyphs"
          fill={`url(#${id}-gold)`}
        >
          PETROLERO
        </text>

        <text
          x="600"
          y="216"
          textLength="1160"
          lengthAdjust="spacingAndGlyphs"
          fill={`url(#${id}-grain)`}
          opacity={illuminated ? "0.9" : "0.2"}
        >
          PETROLERO
        </text>
      </g>
    </svg>
  );
}

export default function SiteFooter() {
  const wordmarkRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;

    const wordmark = wordmarkRef.current;
    if (!wordmark) return;

    const rect = wordmark.getBoundingClientRect();

    wordmark.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    wordmark.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    wordmark.dataset.active = "true";
  };

  const handlePointerLeave = () => {
    const wordmark = wordmarkRef.current;
    if (wordmark) wordmark.dataset.active = "false";
  };

  return (
    <footer
      className="petrolero-site-footer"
      aria-label="Подвал сайта Petrolero"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="petrolero-site-footer-top">
        <nav className="petrolero-site-footer-socials" aria-label="Социальные сети и связь">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.icon}
              className="petrolero-site-footer-social"
              href={link.href}
              aria-label={link.description}
              title={link.description}
              target={link.icon === "mail" ? undefined : "_blank"}
              rel={link.icon === "mail" ? undefined : "noopener noreferrer"}
            >
              <SocialGlyph icon={link.icon} />
            </a>
          ))}
        </nav>

        <p className="petrolero-site-footer-credit">
          © 2026 <strong>Himiko River</strong>
        </p>
      </div>

      <div
        ref={wordmarkRef}
        className="petrolero-site-footer-wordmark"
        data-active="false"
        aria-hidden="true"
      >
        <div className="petrolero-site-footer-wordmark-base">
          <PetroleroWordmark illuminated={false} />
        </div>
        <div className="petrolero-site-footer-wordmark-reveal">
          <PetroleroWordmark illuminated />
        </div>
      </div>
    </footer>
  );
}
