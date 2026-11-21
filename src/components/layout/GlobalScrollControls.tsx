"use client";

import PageScrollControls from "@/features/home/navigation/PageScrollControls";
import useReducedMotion from "@/hooks/useReducedMotion";

export default function GlobalScrollControls() {
  const reducedMotion = useReducedMotion();
  return <PageScrollControls reducedMotion={reducedMotion} />;
}
