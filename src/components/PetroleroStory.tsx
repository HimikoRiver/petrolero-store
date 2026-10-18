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

      // Mercedes-like reading progress: all copy remains visible in grey.
      // A narrow leading edge turns individual letters ivory in reading order.
      // The effect reverses naturally when the scroll moves upwards.
      const head = clamp01((progress - 0.17) / 0.42) * LETTER_COUNT;
      const edge = 3.2; // Soft transition across just a few letters.

      glyphs.forEach((glyph, index) => {
        const lit = reducedMotion ? 1 : clamp01((head - index) / edge);
        const red = Math.round(143 + 102 * lit);
        const green = Math.round(143 + 100 * lit);
        const blue = Math.round(147 + 95 * lit);
        glyph.style.color = `rgb(${red} ${green} ${blue})`;
      });

      // The pinned text must disappear BEFORE the section releases its sticky
      // positioning, so it never slides behind the fixed navigation.
      const visible = reducedMotion ? 1 : 1 - clamp01((progress - 0.72) / 0.07);
      section.style.setProperty("--story-visibility", visible.toFixed(4));

      // The logo waits until the sentence is nearly complete before travelling.
      const showcase = progress >= 0.57 && progress < 0.77;
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
