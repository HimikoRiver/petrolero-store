"use client";

import { usePathname } from "next/navigation";
import PageScrollControls from "@/features/home/navigation/PageScrollControls";
import useReducedMotion from "@/hooks/useReducedMotion";

export default function GlobalScrollControls() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  if (pathname === "/account/login" || pathname === "/account/login/") {
    return null;
  }

  return <PageScrollControls reducedMotion={reducedMotion} />;
}
