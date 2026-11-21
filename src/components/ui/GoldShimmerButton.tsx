"use client";

import type { ButtonHTMLAttributes } from "react";


type GoldShimmerButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Reusable Petrolero gold button with continuous metallic shimmer. */
export default function GoldShimmerButton({
  children,
  className,
  type = "button",
  ...props
}: GoldShimmerButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={["petrolero-gold-shimmer-button", className].filter(Boolean).join(" ")}
    >
      <span className="petrolero-gold-shimmer-button__label">{children}</span>
    </button>
  );
}
