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
      <span className="petrolero-logo__p-aura" aria-hidden="true">
        <img src={source} alt="" draggable={false} />
      </span>
      <span className="petrolero-logo__p-sweep" aria-hidden="true">
        <img src={source} alt="" draggable={false} />
      </span>
    </span>
  );
}
