"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import "./PetroleroStory.css";

type PetroleroStoryProps = {
  onShowcaseChange: (showcase: boolean) => void;
  reducedMotion: boolean;
};

const LINES = [
  "ВНУТРИ ДВИГАТЕЛЯ",
  "НЕТ ПАУЗ.",
  "ТРЕНИЕ. ДАВЛЕНИЕ.",
  "ТЕМПЕРАТУРА.",
  "В ЭТИХ УСЛОВИЯХ",
  "РАБОТАЕТ МАСЛО.",
] as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export default function PetroleroStory({
  onShowcaseChange,
  reducedMotion,
}: PetroleroStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    let wasShowcase: boolean | null = null;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      // 0: story enters the bottom of the viewport.
      // 1: the end of the story reaches the top of the viewport.
      const progress = clamp01((viewport - rect.top) / (viewport + rect.height));

      section.style.setProperty("--story-progress", progress.toFixed(4));

      lineRefs.current.forEach((line, index) => {
        if (!line) return;
        const begin = 0.10 + index * 0.075;
        const revealed = reducedMotion
          ? 1
          : clamp01((progress - begin) / 0.12);
        // Fade the whole narrative out as the black section finishes.
        const exit = reducedMotion ? 1 : 1 - clamp01((progress - 0.82) / 0.13);
        line.style.setProperty("--line-opacity", (revealed * exit).toFixed(4));
        line.style.setProperty("--line-offset", (1 - revealed).toFixed(4));
      });

      const showcase = progress >= 0.33 && progress < 0.86;
      if (showcase !== wasShowcase) {
        wasShowcase = showcase;
        onShowcaseChange(showcase);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      onShowcaseChange(false);
    };
  }, [onShowcaseChange, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="petrolero-story"
      aria-label="О работе моторного масла"
    >
      <div className="petrolero-story-sticky">
        <div className="petrolero-story-content">
          <p className="petrolero-story-overline">01 / ЧТО ПРОИСХОДИТ ВНУТРИ</p>
          <h2 className="petrolero-story-copy">
            {LINES.map((line, index) => (
              <span
                className={`petrolero-story-line ${index === 1 || index === 5 ? "petrolero-story-line--gold" : ""}`}
                key={line}
                ref={(node) => {
                  lineRefs.current[index] = node;
                }}
                style={{
                  "--line-opacity": 0,
                  "--line-offset": 1,
                } as CSSProperties}
              >
                {line}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  );
}
