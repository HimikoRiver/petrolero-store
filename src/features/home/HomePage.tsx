"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "./header/SiteHeader";
import HeroSection from "./hero/HeroSection";
import BrandStory from "./story/BrandStory";
import AdvantagesSection from "./advantages/AdvantagesSection";
import useReducedMotion from "./hooks/useReducedMotion";

export default function HomePage() {
  const storyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [showcase, setShowcase] = useState(false);
  const handleShowcaseChange = useCallback((active: boolean) => setShowcase(active), []);

  useEffect(() => {
    if (reducedMotion || window.scrollY > window.innerHeight * 0.35) {
      setPhase(3);
      return;
    }
    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), 450),
      setTimeout(() => setPhase(2), 2300),
      setTimeout(() => setPhase(3), 3300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const scrollToStory = () =>
    storyRef.current?.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "start",
    });

  return (
    <main className="petrolero-home">
      <SiteHeader phase={phase} showcase={showcase} reducedMotion={reducedMotion} />
      <HeroSection phase={phase} reducedMotion={reducedMotion} onNext={scrollToStory} />
      <div ref={storyRef}>
        <BrandStory onShowcaseChange={handleShowcaseChange} reducedMotion={reducedMotion} />
      </div>
      <AdvantagesSection />
    </main>
  );
}
