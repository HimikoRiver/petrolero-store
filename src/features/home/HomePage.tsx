
"use client";

import { useEffect, useRef, useState } from "react";
import SiteHeader from "./header/SiteHeader";
import HeroSection from "./hero/HeroSection";
import BrandStory from "./story/BrandStory";
import SteelSection from "./steel/SteelSection";
import MolecularSection from "../molecules/MolecularSection";
import TechnologySection from "./technology/TechnologySection";
import ContactsSection from "./contacts/ContactsSection";
import OilDropletDivider from "./transition/OilDropletDivider";
import SiteFooter from "./footer/SiteFooter";
import PageScrollControls from "./navigation/PageScrollControls";
import useReducedMotion from "./hooks/useReducedMotion";

export default function HomePage() {
  const steelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (
      reducedMotion ||
      window.scrollY > window.innerHeight * 0.35
    ) {
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

  const scrollToSteel = () =>
    steelRef.current?.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "start",
    });

  return (
    <>
      <main className="petrolero-home">
      <SiteHeader
        phase={phase}
        reducedMotion={reducedMotion}
      />

      <HeroSection
        phase={phase}
        reducedMotion={reducedMotion}
        onNext={scrollToSteel}
      />

      <div ref={steelRef}>
        <SteelSection reducedMotion={reducedMotion} />
      </div>

      <BrandStory reducedMotion={reducedMotion} />

      <MolecularSection />

      <TechnologySection reducedMotion={reducedMotion} />

      <OilDropletDivider reducedMotion={reducedMotion} />

      <ContactsSection />
      </main>
      <SiteFooter />
      <PageScrollControls reducedMotion={reducedMotion} />
    </>
  );
}
