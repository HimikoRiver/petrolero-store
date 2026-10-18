"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import "./PetroleroStory.css";

type PetroleroStoryProps = {
  onShowcaseChange: (showcase: boolean) => void;
  reducedMotion: boolean;
};

const LINES = [
  "Мы — международная команда",
  "инженеров и энтузиастов.",
  "Нас объединяют химия,",
  "автомобили и технологии.",
  "В маслах и присадках",
  "мы сочетаем компоненты",
  "с разработками DuoZinc и REACORE,",
  "чтобы снижать трение и износ,",
  "поддерживать чистоту двигателя",
  "и стабильную работу под нагрузкой.",
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
      const captionIn = clamp01((progress - 0.03) / 0.09);
      const captionOut = 1 - clamp01((progress - 0.75) / 0.12);
      section.style.setProperty(
        "--story-caption-opacity",
        (reducedMotion ? 1 : captionIn * captionOut).toFixed(4),
      );

      lineRefs.current.forEach((line, index) => {
        if (!line) return;
        const begin = 0.045 + index * 0.021;
        const revealed = reducedMotion
          ? 1
          : clamp01((progress - begin) / 0.075);
        // Fade the whole narrative out as the black section finishes.
        const exit = reducedMotion ? 1 : 1 - clamp01((progress - 0.75) / 0.12);
        line.style.setProperty("--line-opacity", (revealed * exit).toFixed(4));
        line.style.setProperty("--line-offset", (1 - revealed).toFixed(4));
      });

      const showcase = progress >= 0.34 && progress < 0.70;
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
      aria-label="О компании Petrolero"
    >
      <div className="petrolero-story-sticky">
        <div className="petrolero-story-content">
          <h2 className="petrolero-story-copy">
            {LINES.map((line, index) => (
              <span
                className={`petrolero-story-line ${index === 6 || index === 9 ? "petrolero-story-line--gold" : ""}`}
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
