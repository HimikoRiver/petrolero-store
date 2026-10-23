"use client";

import { useEffect, useRef, useState } from "react";
import "./SteelSection.css";

type SteelSectionProps = {
  reducedMotion: boolean;
};

/**
 * A cool, monochrome pause between the gold oil hero and laboratory story.
 * The text is real HTML; the approved fon4.webp remains an image-only backdrop.
 */
export default function SteelSection({ reducedMotion }: SteelSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="petrolero-steel"
      aria-labelledby="petrolero-steel-heading"
      data-visible={visible || reducedMotion}
    >
      <div className="petrolero-steel-artwork" aria-hidden="true" />
      <div className="petrolero-steel-shading" aria-hidden="true" />
      <div className="petrolero-steel-light" aria-hidden="true" />

      <div className="petrolero-steel-layout">
        <div className="petrolero-steel-copy">
          <h2 id="petrolero-steel-heading" className="petrolero-steel-title">
            <strong>МЕТАЛЛ</strong>
            <span>ПОД НАГРУЗКОЙ</span>
          </h2>
          <p className="petrolero-steel-description">
            Экстремальные температуры, высокое давление и постоянное трение.
          </p>
        </div>
      </div>
    </section>
  );
}
