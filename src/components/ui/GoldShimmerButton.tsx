"use client";

import type { ButtonHTMLAttributes } from "react";
import styles from "./GoldShimmerButton.module.css";

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
      className={[styles.button, className].filter(Boolean).join(" ")}
    >
      <span className={styles.label}>{children}</span>
    </button>
  );
}
