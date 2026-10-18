"use client";

import { useEffect, useRef } from "react";
import "./PetroleroStory.css";

type PetroleroStoryProps = {
  onShowcaseChange: (showcase: boolean) => void;
  reducedMotion: boolean;
};

/* Full, readable phrases; wrapping is handled by the browser, not forced lines. */
const PARAGRAPHS = [
  "Мы — международная команда инженеров и энтузиастов.",
  "Нас объединяют химия, автомобили и технологии.",
  "В маслах и присадках мы сочетаем компоненты с разработками DuoZinc и REACORE, чтобы снижать трение и износ, поддерживать чистоту двигателя и стабильную работу под нагрузкой.",
] as const;

/* Give each visible letter its own stable index for a continuous left-to-right
   reveal, including across line wraps and between paragraphs. */
let indexCounter = 0;
const LETTERS = PARAGRAPHS.map((paragraph) =>
  paragraph.split(" ").map((word) => ({
    word,
    glyphs: Array.from(word).map((character) => ({
      character,
      index: indexCounter++,
    })),
  })),
);
const LETTER_COUNT = indexCounter;
const clamp01 = (number: number) => Math.max(0, Math.min(1, number));

export default function PetroleroStory({
  onShowcaseChange,
  reducedMotion,
}: PetroleroStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const glyphs = Array.from(
      section.querySelectorAll<HTMLSpanElement>(".petrolero-story-glyph"),
    );
    let frame = 0;
    let previousShowcase: boolean | null = null;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = clamp01((viewport - rect.top) / (viewport + rect.height));

      glyphs.forEach((glyph, index) => {
        const fraction = index / Math.max(LETTER_COUNT - 1, 1);
        const start = 0.15 + fraction * 0.35;
        const brightness = reducedMotion
          ? 1
          : clamp01((progress - start) / 0.052);

        // Every character transitions from graphite grey to warm off-white.
        const red = Math.round(103 + 141 * brightness);
        const green = Math.round(103 + 137 * brightness);
        const blue = Math.round(105 + 129 * brightness);
        glyph.style.color = `rgb(${red} ${green} ${blue})`;
      });

      const showcase = progress >= 0.57 && progress < 0.83;
      if (showcase !== previousShowcase) {
        previousShowcase = showcase;
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
          <div className="petrolero-story-copy">
            {LETTERS.map((words, paragraphIndex) => (
              <p
                key={paragraphIndex}
                className="petrolero-story-paragraph"
                aria-label={PARAGRAPHS[paragraphIndex]}
              >
                {words.map(({ word, glyphs }, wordIndex) => (
                  <span key={wordIndex}>
                    <span className="petrolero-story-word" aria-hidden="true">
                      {glyphs.map(({ character, index }) => (
                        <span className="petrolero-story-glyph" key={index}>
                          {character}
                        </span>
                      ))}
                    </span>
                    {wordIndex < words.length - 1 ? " " : null}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
