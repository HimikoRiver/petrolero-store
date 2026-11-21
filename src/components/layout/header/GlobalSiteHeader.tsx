"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import SiteHeader from "./SiteHeader";
import { useHeaderState } from "./HeaderStateProvider";
import useReducedMotion from "@/hooks/useReducedMotion";

const subscribeHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * The only SiteHeader mount in the application.
 * Its markup and CSS come from the original homepage navigation.
 * Home and catalog supply their state through HeaderStateProvider rather
 * than rendering different headers on separate pages.
 */
export default function GlobalSiteHeader() {
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(subscribeHydration, getClientSnapshot, getServerSnapshot);
  const reducedMotion = useReducedMotion();
  const {
    homePhase,
    catalogSearch,
    cartCount,
    changeCatalogSearch,
    openCatalogCart,
  } = useHeaderState();

  // The cinematic sign-in and password reset pages have their own full-screen UI.
  if (pathname === "/account/login" || pathname === "/account/reset-password") {
    return null;
  }

  const mode = pathname === "/" ? "home" : pathname === "/catalog" ? "catalog" : "inner";

  return (
    <SiteHeader
      key={mode}
      phase={mode === "home" ? (hydrated ? homePhase : 0) : 3}
      reducedMotion={reducedMotion}
      mode={mode}
      searchValue={mode === "catalog" ? catalogSearch : undefined}
      onSearchChange={mode === "catalog" ? changeCatalogSearch : undefined}
      cartCount={mode === "catalog" ? cartCount : 0}
      onCartOpen={mode === "catalog" ? openCatalogCart : undefined}
    />
  );
}
