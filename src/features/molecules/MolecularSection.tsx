"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import MolecularCanvas from "./MolecularCanvas";
import { bottles } from "./model";
import type { PointerPosition } from "./model";
import "./MolecularSection.css";

export default function MolecularSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const pointerRef = useRef<PointerPosition>({
    x: -1000,
    y: -1000,
    active: false,
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLElement>
  ) => {
    if (event.pointerType === "touch") return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    pointerRef.current.x =
      event.clientX - rect.left;

    pointerRef.current.y =
      event.clientY - rect.top;

    pointerRef.current.active = true;
  };

  return (
    <section
      ref={sectionRef}
      className="petrolero-molecular-section relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#050505] text-white"
      aria-label="Технологии Petrolero"
      onPointerMoveCapture={handlePointerMove}
      onPointerLeave={() => {
        pointerRef.current.active = false;
      }}
    >
      <div
        className="petrolero-molecular-overlay"
        aria-hidden="true"
      />

      {/* Центрированный заголовок и описание */}

      <div className="petrolero-molecular-heading relative z-40 mx-auto flex w-full max-w-[1600px] flex-col items-center px-5 pt-16 text-center sm:px-10 sm:pt-20 lg:px-16 lg:pt-24">
        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d5b179] sm:text-xs">
          ТЕХНОЛОГИИ PETROLERO
        </p>

        <h2 className="mx-auto max-w-[1100px] text-center text-[clamp(2rem,4.5vw,5.1rem)] font-black uppercase leading-[1.04] tracking-[-0.055em] text-white">
          МОЛЕКУЛЫ ЗАЩИТЫ
          <br />
          <span className="text-[#d5b179]">
            В ДВИЖЕНИИ
          </span>
        </h2>

        <div
          className="petrolero-molecular-description mx-auto mt-7 max-w-[860px] px-2 text-center sm:mt-9"
        >
          <p className="text-[13px] leading-[1.85] text-white/75 sm:text-[15px] lg:text-base">
            Компания Petrolero — это надёжный лидер в
            производстве высококачественных масел и
            присадок для автомобильных двигателей. Мы
            гордимся многолетним опытом в отрасли и
            постоянным стремлением к инновациям. Наши
            специалисты используют передовые технологии
            и современное оборудование, что позволяет
            создавать продукцию, отвечающую самым
            высоким мировым стандартам качества.
          </p>
        </div>
      </div>

      {/* Плавающие бутылочки */}

      <div className="petrolero-bottles-stage relative z-30 mx-auto mt-auto w-full max-w-[1500px] px-3 pb-9 pt-12 sm:px-8 lg:px-12">
        <div
          className="petrolero-bottles-glow"
          aria-hidden="true"
        />

        <div className="petrolero-bottles-row">
          {bottles.map((bottle) => (
            <div
              key={bottle.alt}
              className={`petrolero-bottle petrolero-bottle--${bottle.variant} petrolero-bottle-float-${bottle.float}`}
            >
              <img
                src={bottle.src}
                alt={bottle.alt}
                className="block h-full w-full object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Молекулы за контентом */}

      <MolecularCanvas
        active={visible}
        pointerRef={pointerRef}
      />
    </section>
  );
}
