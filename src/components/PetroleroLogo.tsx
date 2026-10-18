"use client";

import { useState } from "react";
import type { HTMLAttributes } from "react";
import "./PetroleroLogo.css";

// Official branded SVG served by petrolero.ru (with the original wordmark outlines).
export const OFFICIAL_PETROLERO_LOGO =
  "https://petrolero.ru/upload/iblock/35e/jgc65bilqftol5pq129e204e9ngvhlj3/logo.svg";
const LOCAL_FALLBACK = "/home/images/petrolero-logo.svg";

type PetroleroLogoProps = HTMLAttributes<HTMLSpanElement> & {
  animated?: boolean;
  shine?: boolean;
  variant?: "original" | "gold" | "white";
};

export default function PetroleroLogo({
  animated = true,
  shine = false,
  variant = "original",
  className = "",
  ...props
}: PetroleroLogoProps) {
  const [source, setSource] = useState(OFFICIAL_PETROLERO_LOGO);

  return (
    <span
      role="img"
      aria-label="Petrolero"
      className={`petrolero-logo petrolero-logo--${variant} ${animated ? "petrolero-logo--animated" : ""} ${shine ? "petrolero-logo--shining" : ""} ${className}`}
      {...props}
    >
      <img
        className="petrolero-logo__image"
        src={source}
        alt=""
        aria-hidden="true"
        draggable={false}
        onError={() => {
          if (source !== LOCAL_FALLBACK) setSource(LOCAL_FALLBACK);
        }}
      />
      {/* The three P segments are vector contours, never filled or blurred. */}
      <svg
        className="petrolero-logo__p-outline"
        viewBox="0 0 132 75"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="petrolero-logo__p-outline-path petrolero-logo__p-outline-path--top"
          d="M57 13H82.5C88.9 13 93.4 17.1 93.4 22.65C93.4 28.1 88.9 32.5 82.5 32.5H57Z"
          pathLength={100}
        />
        <path
          className="petrolero-logo__p-outline-path petrolero-logo__p-outline-path--dash"
          d="M52.1 31.8H57V37.2H52.1C49.2 37.2 47 36.2 47 34.5C47 32.9 49.2 31.8 52.1 31.8Z"
          pathLength={100}
        />
        <path
          className="petrolero-logo__p-outline-path petrolero-logo__p-outline-path--stem"
          d="M57 37.7H74V45.7H57Z"
          pathLength={100}
        />
      </svg>
    </span>
  );
}
