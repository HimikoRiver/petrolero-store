"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import "./BrandStory.css";
import { PARAGRAPHS } from "./copy";
import AdvantagesSection from "../advantages/AdvantagesSection";

type BrandStoryProps = {
  reducedMotion: boolean;
};

/* Stable indexes keep the original continuous character-by-character
   reveal across all three paragraphs, including natural line wrapping. */
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
const FEATURES = [
  { number: "01", title: "ИССЛЕДОВАНИЯ И РАЗРАБОТКИ", icon: "/home/images/icons/petrolero-flask-icon.webp?v=d6e5e37b", description: "Изучаем процессы внутри двигателя и свойства компонентов моторных масел." },
  { number: "02", title: "СОВРЕМЕННЫЕ ТЕХНОЛОГИИ", icon: "/home/images/icons/petrolero-gear-icon.webp?v=3e2268bb", description: "Используем современные компоненты при разработке масел и присадок." },
  { number: "03", title: "ЗАЩИТА И НАДЁЖНОСТЬ", icon: "/home/images/icons/petrolero-shield-icon.webp?v=3b3d18e7", description: "Помогаем уменьшать трение и износ и поддерживать стабильную работу двигателя." },
] as const;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export default function BrandStory({ reducedMotion }: BrandStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const glyphs = Array.from(
      section.querySelectorAll<HTMLSpanElement>(".petrolero-story-glyph"),
    );
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = clamp01(-rect.top / Math.max(rect.height - viewport, 1));

      // The complete text lights up before the next scene begins.
      const edge = 3.2;
      const head = clamp01((progress - 0.02) / 0.49) * (LETTER_COUNT + edge);

      glyphs.forEach((glyph, index) => {
        const lit = reducedMotion ? 1 : clamp01((head - index) / edge);
        const red = Math.round(143 + 102 * lit);
        const green = Math.round(143 + 100 * lit);
        const blue = Math.round(147 + 95 * lit);
        glyph.style.color = `rgb(${red} ${green} ${blue})`;
      });

      // Continue into the existing advantages scene, with no separate
      // logo flight: the brand mark remains in the header throughout.
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
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="petrolero-story"
      aria-label="О компании Petrolero"
    >
      <div className="petrolero-story-sticky">
        <div className="petrolero-story-content">
          <div className="petrolero-story-copy">
            <p className="petrolero-story-eyebrow">О КОМПАНИИ</p>
            <h2 className="petrolero-story-title">
              <span>БОЛЬШЕ, ЧЕМ</span>
              <span>ПРОСТО <em>МАСЛО</em></span>
            </h2>
            <div className="petrolero-story-description">
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
            <div className="petrolero-story-features">
              {FEATURES.map((feature) => (
                <article className="petrolero-story-feature" key={feature.number}>
                  <span className="petrolero-story-feature-number">{feature.number}</span>
                  <div className="petrolero-story-feature-heading">
                    <Image src={feature.icon} alt="" width={724} height={724} className="petrolero-story-feature-icon" />
                    <h3>{feature.title}</h3>
                  </div>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
        <AdvantagesSection />
      </div>
    </section>
  );
}
