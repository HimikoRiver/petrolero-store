"use client";

import type { ReactNode } from "react";
import SiteHeader from "@/components/layout/header/SiteHeader";
import SiteFooter from "@/components/layout/footer/SiteFooter";
import useReducedMotion from "@/hooks/useReducedMotion";
import "./storefrontTheme.css";
import "./StorefrontChrome.css";

export default function StorefrontChrome({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="petrolero-inner-pages">
      <SiteHeader phase={3} reducedMotion={reducedMotion} mode="inner" />
      {children}
      <SiteFooter />
    </div>
  );
}
