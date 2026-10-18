"use client";

import { useEffect, useRef } from "react";
import "./BrandStory.css";
import { PARAGRAPHS } from "./copy";
import AdvantagesSection from "../advantages/AdvantagesSection";

type PetroleroStoryProps = {
  onShowcaseChange: (showcase: boolean) => void;
  reducedMotion: boolean;
};

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

export default function BrandStory({
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
      // Measure only the section's sticky scrolling interval, so the
      // late background reveal still happens while the screen is visible.
      const progress = clamp01(-rect.top / Math.max(rect.height - viewport, 1));

      // Text remains grey until the reading progress brings each letter
      // to white. The final character is fully white before the logo returns.
      const edge = 3.2;
      const head = clamp01((progress - 0.02) / 0.49) * (LETTER_COUNT + edge);

      glyphs.forEach((glyph, index) => {
        const lit = reducedMotion ? 1 : clamp01((head - index) / edge);
        const red = Math.round(143 + 102 * lit);
        const green = Math.round(143 + 100 * lit);
        const blue = Math.round(147 + 95 * lit);
        glyph.style.color = `rgb(${red} ${green} ${blue})`;
      });

      // The logo moves halfway through the text's reveal, stays while the
      // last letters turn white, then returns before the benefits appear.
      const showcase = !reducedMotion && progress >= 0.28 && progress < 0.56;
      if (showcase !== previousShowcase) {
        previousShowcase = showcase;
        onShowcaseChange(showcase);
      }

      // Switch scenes on the same sticky viewport, not the next section.
      // CSS allows the header's return flight to finish first. Scrolling
      // upward reverses the state and restores the reading sequence.
      section.dataset.advantagesVisible =
        progress >= 0.56 ? "true" : "false";
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
        <AdvantagesSection />
      </div>
    </section>
  );
}
