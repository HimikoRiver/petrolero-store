
"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";

type Direction = "left" | "right";

type AnimatedPhraseProps = {
  text: string;
  direction: Direction;
  delay: number;
  active: boolean;
  accent?: boolean;
};

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
};

type PointerPosition = {
  x: number;
  y: number;
  active: boolean;
};

const FIRST_DELAY = 100;
const SECOND_DELAY = 1350;
const DRIVE_DURATION = 680;
const IMPACT_DURATION = 720;
const WAVE_DURATION = 280;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const bottles = [
  {
    src: "/home/images/bottles/performance-1.webp",
    alt: "Petrolero Performance 1",
    variant: "left-big",
    float: "a",
  },
  {
    src: "/home/images/bottles/extra-life-2.webp",
    alt: "Petrolero Extra Life 2",
    variant: "left-top",
    float: "b",
  },
  {
    src: "/home/images/bottles/turbo-boost-3.webp",
    alt: "Petrolero Turbo Boost 3",
    variant: "center-small",
    float: "c",
  },
  {
    src: "/home/images/bottles/caremaker-5.webp",
    alt: "Petrolero Caremaker 5",
    variant: "right-center",
    float: "d",
  },
  {
    src: "/home/images/bottles/full-throttle-6.webp",
    alt: "Petrolero Full Throttle 6",
    variant: "right-big",
    float: "e",
  },
] as const;

/* =========================================
   АНИМАЦИЯ БУКВ
========================================= */

function AnimatedPhrase({
  text,
  direction,
  delay,
  active,
  accent = false,
}: AnimatedPhraseProps) {
  const characters = Array.from(text);

  const letterCount = characters.filter(
    (character) => character !== " "
  ).length;

  let letterIndex = 0;

  return (
    <span
      aria-hidden="true"
      className={[
        "petrolero-phrase",
        `petrolero-phrase--${direction}`,
        active ? "petrolero-phrase--active" : "",
        accent ? "text-[#d5b179]" : "text-white",
      ].join(" ")}
      style={
        {
          "--phrase-delay": `${delay}ms`,
          "--drive-duration": `${DRIVE_DURATION}ms`,
        } as CSSProperties
      }
    >
      <span className="petrolero-phrase__letters">
        {characters.map((character, index) => {
          if (character === " ") {
            return (
              <span
                key={`space-${index}`}
                className="petrolero-space"
              >
                {"\u00A0"}
              </span>
            );
          }

          const currentIndex = letterIndex++;

          const waveIndex =
            direction === "left"
              ? letterCount - 1 - currentIndex
              : currentIndex;

          const waveProgress =
            waveIndex / Math.max(letterCount - 1, 1);

          const sign = direction === "left" ? 1 : -1;

          return (
            <span
              key={`${character}-${index}`}
              className="petrolero-letter"
              style={
                {
                  "--impact-delay": `${
                    delay +
                    DRIVE_DURATION +
                    waveProgress * WAVE_DURATION
                  }ms`,
                  "--impact-x": `${sign * 0.32}em`,
                  "--rebound-x": `${-sign * 0.19}em`,
                  "--settle-x": `${sign * 0.07}em`,
                  "--impact-duration": `${IMPACT_DURATION}ms`,
                } as CSSProperties
              }
            >
              {character}
            </span>
          );
        })}
      </span>
    </span>
  );
}

/* =========================================
   МОЛЕКУЛЫ С ВОЗВРАТОМ К СВОИМ ПОЗИЦИЯМ
========================================= */

function MolecularCanvas({
  active,
  pointerRef,
}: {
  active: boolean;
  pointerRef: RefObject<PointerPosition>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
    });

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    let frame = 0;
    let running = false;
    let previousTime = 0;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const mobileQuery = window.matchMedia(
      "(max-width: 767px)"
    );

    const resize = () => {
      const rect = container.getBoundingClientRect();

      if (rect.width < 1 || rect.height < 1) return;

      const oldWidth = width;
      const oldHeight = height;

      width = rect.width;
      height = rect.height;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = clamp(
        Math.round(
          (width * height) /
            (mobileQuery.matches ? 7400 : 5900)
        ),
        mobileQuery.matches ? 85 : 145,
        mobileQuery.matches ? 140 : 270
      );

      if (
        particles.length &&
        Math.abs(count - particles.length) < 18 &&
        oldWidth &&
        oldHeight
      ) {
        const sx = width / oldWidth;
        const sy = height / oldHeight;

        for (const p of particles) {
          p.x *= sx;
          p.y *= sy;
          p.homeX *= sx;
          p.homeY *= sy;
        }
      } else {
        const margin = 24;

        particles = Array.from(
          { length: count },
          () => {
            const x =
              margin +
              Math.random() *
                Math.max(1, width - 2 * margin);

            const y =
              margin +
              Math.random() *
                Math.max(1, height - 2 * margin);

            return {
              x,
              y,
              homeX: x,
              homeY: y,
              vx: 0,
              vy: 0,
              radius: 0.9 + Math.random() * 1.7,
              phase: Math.random() * Math.PI * 2,
            };
          }
        );
      }

      draw(performance.now(), false);
    };

    const update = (time: number, step: number) => {
      const pointer = pointerRef.current;

      const radius = mobileQuery.matches ? 195 : 280;

      const distantRadius = mobileQuery.matches
        ? 300
        : 460;

      const border = 14;

      for (const p of particles) {
        const targetX =
          p.homeX +
          Math.sin(time * 0.00055 + p.phase) * 5;

        const targetY =
          p.homeY +
          Math.cos(time * 0.00046 + p.phase) * 5;

        p.vx += (targetX - p.x) * 0.022 * step;
        p.vy += (targetY - p.y) * 0.022 * step;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;

          const distance = Math.hypot(dx, dy) || 1;

          const nx = dx / distance;
          const ny = dy / distance;

          const near = clamp(
            1 - distance / radius,
            0,
            1
          );

          const far = clamp(
            1 - distance / distantRadius,
            0,
            1
          );

          const push =
            (near * near * 1.05 + far * 0.035) *
            step;

          p.vx += nx * push;
          p.vy += ny * push;

          p.vx -= ny * near * 0.16 * step;
          p.vy += nx * near * 0.16 * step;
        }

        const damping = Math.pow(0.885, step);

        p.vx = clamp(
          p.vx * damping,
          -4.8,
          4.8
        );

        p.vy = clamp(
          p.vy * damping,
          -4.8,
          4.8
        );

        p.x += p.vx * step;
        p.y += p.vy * step;

        if (
          p.x < border ||
          p.x > width - border
        ) {
          p.x = clamp(
            p.x,
            border,
            Math.max(border, width - border)
          );

          p.vx *= -0.3;
        }

        if (
          p.y < border ||
          p.y > height - border
        ) {
          p.y = clamp(
            p.y,
            border,
            Math.max(border, height - border)
          );

          p.vy *= -0.3;
        }
      }
    };

    function draw(time: number, move: boolean) {
      if (!width || !height) return;

      const step = previousTime
        ? clamp(
            (time - previousTime) / 16.67,
            0.3,
            1.8
          )
        : 1;

      previousTime = time;

      ctx.clearRect(0, 0, width, height);

      if (move) {
        update(time, step);
      }

      const pointer = pointerRef.current;

      if (pointer.active) {
        const gradient = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          230
        );

        gradient.addColorStop(
          0,
          "rgba(255,198,91,0.14)"
        );

        gradient.addColorStop(
          0.5,
          "rgba(222,143,43,0.05)"
        );

        gradient.addColorStop(
          1,
          "rgba(0,0,0,0)"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
          pointer.x - 230,
          pointer.y - 230,
          460,
          460
        );
      }

      const connectionRadius = mobileQuery.matches
        ? 98
        : 112;

      const squaredRadius =
        connectionRadius * connectionRadius;

      const grid = new Map<string, number[]>();

      const cellOf = (value: number) =>
        Math.floor(value / connectionRadius);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const key = `${cellOf(p.x)}:${cellOf(p.y)}`;
        const bucket = grid.get(key);

        if (bucket) {
          bucket.push(i);
        } else {
          grid.set(key, [i]);
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const cx = cellOf(p.x);
        const cy = cellOf(p.y);

        for (let gx = -1; gx <= 1; gx++) {
          for (let gy = -1; gy <= 1; gy++) {
            const others = grid.get(
              `${cx + gx}:${cy + gy}`
            );

            if (!others) continue;

            for (const j of others) {
              if (j <= i) continue;

              const q = particles[j];

              const dx = p.x - q.x;
              const dy = p.y - q.y;

              const distanceSquared =
                dx * dx + dy * dy;

              if (distanceSquared > squaredRadius) {
                continue;
              }

              const distance = Math.sqrt(
                distanceSquared
              );

              let alpha =
                (1 -
                  distance / connectionRadius) *
                0.33;

              let lineWidth = 0.75;

              if (pointer.active) {
                const proximity = Math.min(
                  Math.hypot(
                    p.x - pointer.x,
                    p.y - pointer.y
                  ),
                  Math.hypot(
                    q.x - pointer.x,
                    q.y - pointer.y
                  )
                );

                const influence = clamp(
                  1 - proximity / 340,
                  0,
                  1
                );

                alpha *= 1 + influence * 1.8;
                lineWidth += influence * 0.55;
              }

              ctx.strokeStyle =
                `rgba(241,187,80,${Math.min(
                  alpha,
                  0.85
                )})`;

              ctx.lineWidth = lineWidth;

              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.stroke();
            }
          }
        }
      }

      for (const p of particles) {
        const distance = pointer.active
          ? Math.hypot(
              p.x - pointer.x,
              p.y - pointer.y
            )
          : Infinity;

        const influence = clamp(
          1 - distance / 330,
          0,
          1
        );

        ctx.shadowColor = "#ffc158";
        ctx.shadowBlur = 5 + influence * 16;

        ctx.fillStyle =
          influence > 0.4
            ? "#ffe8ab"
            : "#d9a558";

        ctx.beginPath();

        ctx.arc(
          p.x,
          p.y,
          p.radius * (1 + influence * 0.7),
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      ctx.shadowBlur = 0;
    }

    const tick = (time: number) => {
      if (!running) return;

      draw(time, true);
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const start = () => {
      if (
        running ||
        !active ||
        document.hidden ||
        motionQuery.matches
      ) {
        return;
      }

      running = true;
      previousTime = 0;

      frame = requestAnimationFrame(tick);
    };

    const syncMotion = () => {
      if (
        document.hidden ||
        motionQuery.matches
      ) {
        stop();
        draw(performance.now(), false);
      } else {
        start();
      }
    };

    const resizeObserver = new ResizeObserver(
      resize
    );

    resizeObserver.observe(container);

    resize();
    start();

    document.addEventListener(
      "visibilitychange",
      syncMotion
    );

    motionQuery.addEventListener(
      "change",
      syncMotion
    );

    return () => {
      stop();
      resizeObserver.disconnect();

      document.removeEventListener(
        "visibilitychange",
        syncMotion
      );

      motionQuery.removeEventListener(
        "change",
        syncMotion
      );
    };
  }, [active, pointerRef]);

  return (
    <div
      ref={containerRef}
      className="petrolero-molecular-canvas-wrap"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="petrolero-molecular-canvas"
      />
    </div>
  );
}

/* =========================================
   ВТОРОЙ ЭКРАН — МОЛЕКУЛЫ И ПРОДУКЦИЯ
========================================= */

function MolecularSection() {
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

        <div className="petrolero-molecular-description mx-auto mt-7 max-w-[860px] px-2 text-center sm:mt-9">
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

/* =========================================
   НАВИГАЦИОННЫЕ КАРТОЧКИ
========================================= */

const HERO_MENU_CARDS = [
  {
    number: "01",
    title: "Каталог",
    image: "/home/images/menu/1.webp",
    href: "/catalog/motornye-masla/legkovye-masla-moto/",
    motion: [
      "3px", "-9px", "-0.6deg",
      "-5px", "5px", "0.5deg"
    ],
    duration: "7.8s",
    delay: "-0.6s",
  },
  {
    number: "02",
    title: "О бренде",
    image: "/home/images/menu/2.webp",
    href: "/about/",
    motion: [
      "-4px", "-7px", "0.7deg",
      "5px", "5px", "-0.5deg"
    ],
    duration: "8.6s",
    delay: "-2.2s",
  },
  {
    number: "03",
    title: "Технологии",
    image: "/home/images/menu/3.webp",
    href: "/technologies/",
    motion: [
      "5px", "-6px", "-0.5deg",
      "-4px", "5px", "0.6deg"
    ],
    duration: "7.2s",
    delay: "-1.4s",
  },
  {
    number: "04",
    title: "Контакты",
    image: "/home/images/menu/4.webp",
    href: "/contacts/",
    motion: [
      "-3px", "-9px", "0.6deg",
      "6px", "4px", "-0.6deg"
    ],
    duration: "8.1s",
    delay: "-3.1s",
  },
] as const;

/* =========================================
   ГЛАВНЫЙ КОМПОНЕНТ
========================================= */

export default function PetroleroHero() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const secondSectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const [hoveredMenuCard, setHoveredMenuCard] =
    useState<number | null>(null);

  const [active, setActive] = useState(false);

  const [reducedMotion, setReducedMotion] =
    useState(false);

  const [videoEnded, setVideoEnded] =
    useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setActive(true)
    );

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () =>
      setReducedMotion(query.matches);

    update();

    query.addEventListener(
      "change",
      update
    );

    return () =>
      query.removeEventListener(
        "change",
        update
      );
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      videoRef.current?.pause();
      setVideoEnded(true);
    }
  }, [reducedMotion]);

  /* Закрытие меню */

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setMenuOpen(false);
      setHoveredMenuCard(null);
      menuTriggerRef.current?.focus();
    };

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (menuTriggerRef.current?.contains(target)) {
        return;
      }

      if (menuPanelRef.current?.contains(target)) {
        return;
      }

      setMenuOpen(false);
      setHoveredMenuCard(null);
    };

    const scrollContainer = scrollRef.current;

    const handleScroll = () => {
      setMenuOpen(false);
      setHoveredMenuCard(null);
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    document.addEventListener(
      "pointerdown",
      handleOutsidePointer
    );

    scrollContainer?.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.removeEventListener(
        "pointerdown",
        handleOutsidePointer
      );

      scrollContainer?.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [menuOpen]);

  const handleMenuCardPointerMove = (
    event: ReactPointerEvent<HTMLAnchorElement>
  ) => {
    if (event.pointerType !== "mouse") return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width - 0.5;

    const y =
      (event.clientY - rect.top) / rect.height - 0.5;

    event.currentTarget.style.setProperty(
      "--nav-tilt-x",
      `${(-y * 4).toFixed(2)}deg`
    );

    event.currentTarget.style.setProperty(
      "--nav-tilt-y",
      `${(x * 5).toFixed(2)}deg`
    );
  };

  const resetMenuCardTilt = (
    element: HTMLAnchorElement
  ) => {
    element.style.setProperty(
      "--nav-tilt-x",
      "0deg"
    );

    element.style.setProperty(
      "--nav-tilt-y",
      "0deg"
    );
  };

  const scrollToSecondSection = () => {
    const scrollContainer = scrollRef.current;
    const target = secondSectionRef.current;

    if (!scrollContainer || !target) return;

    const top =
      target.getBoundingClientRect().top -
      scrollContainer.getBoundingClientRect().top +
      scrollContainer.scrollTop;

    scrollContainer.scrollTo({
      top,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <div
      ref={scrollRef}
      className="petrolero-page-scroll"
      tabIndex={0}
      aria-label="Страница Petrolero"
    >
      <section
        className="petrolero-hero relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#050505] text-white"
        aria-label="Главный экран Petrolero"
      >
        {/* Статичный фон */}

        <div className="petrolero-image-layer absolute inset-0 z-0 overflow-hidden">
          <img
            src="/home/images/fon.webp"
            alt=""
            aria-hidden="true"
            className="petrolero-image"
          />
        </div>

        {/* Видео */}

        <div
          className={`petrolero-video-layer absolute inset-0 z-[1] overflow-hidden ${
            videoEnded
              ? "petrolero-video-layer--hidden"
              : ""
          }`}
        >
          <video
            ref={videoRef}
            className="petrolero-video"
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            onEnded={(event) => {
              event.currentTarget.pause();
              setVideoEnded(true);
            }}
          >
            <source
              src="/home/video/car.webm"
              type="video/webm"
            />
          </video>
        </div>

        <div
          className="petrolero-overlay pointer-events-none absolute inset-0 z-[2]"
          aria-hidden="true"
        />

        {/* Шапка */}

        <header className="relative z-[80] flex h-20 shrink-0 items-center justify-between bg-black/20 px-5 backdrop-blur-md sm:px-10 lg:px-16">
          <a
            href="/"
            className="text-xl font-black tracking-[-0.045em]"
            aria-label="Petrolero — главная"
          >
            <span className="text-[#e2bd77]">
              P
            </span>{" "}
            petrolero
          </a>

          <span className="hidden text-[11px] font-medium tracking-[0.28em] text-[#d5b179] sm:block">
            PREMIUM MOTOR OIL
          </span>

          <button
            ref={menuTriggerRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="petrolero-hero-dropdown"
            aria-label={
              menuOpen ? "Закрыть меню" : "Открыть меню"
            }
            className={`petrolero-nav-trigger ${
              menuOpen
                ? "petrolero-nav-trigger--open"
                : ""
            }`}
            onClick={() => {
              setHoveredMenuCard(null);
              setMenuOpen((previous) => !previous);
            }}
          >
            <span className="petrolero-nav-trigger-label">
              {menuOpen ? "ЗАКРЫТЬ" : "МЕНЮ"}
            </span>

            <span
              className="petrolero-nav-trigger-glyph"
              aria-hidden="true"
            >
              <span />
              <span />
            </span>
          </button>
        </header>

        {/* Меню высотой 60% экрана */}

        <div
          ref={menuPanelRef}
          id="petrolero-hero-dropdown"
          className={`petrolero-nav-panel ${
            menuOpen
              ? "petrolero-nav-panel--open"
              : ""
          }`}
          role="region"
          aria-label="Меню Petrolero"
          aria-hidden={!menuOpen}
          inert={!menuOpen}
        >
          <div
            className="petrolero-nav-panel-top"
            aria-hidden="true"
          >
            <span>НАВИГАЦИЯ PETROLERO</span>
            <span>ВЫБЕРИТЕ РАЗДЕЛ</span>
          </div>

          <nav
            className="petrolero-nav-cards"
            aria-label="Разделы сайта"
          >
            <ul
              className="petrolero-nav-cards-list"
              data-active={
                hoveredMenuCard === null
                  ? "none"
                  : String(hoveredMenuCard)
              }
            >
              {HERO_MENU_CARDS.map((card, index) => (
                <li
                  key={card.number}
                  className="petrolero-nav-card-slot"
                  style={
                    {
                      "--nav-entry-delay": `${
                        index * 105 + 130
                      }ms`,
                    } as CSSProperties
                  }
                >
                  <a
                    href={card.href}
                    className="petrolero-nav-card"
                    tabIndex={menuOpen ? 0 : -1}
                    aria-label={card.title}
                    onPointerEnter={() =>
                      setHoveredMenuCard(index)
                    }
                    onPointerLeave={(event) => {
                      setHoveredMenuCard(null);
                      resetMenuCardTilt(
                        event.currentTarget
                      );
                    }}
                    onPointerMove={
                      handleMenuCardPointerMove
                    }
                    onFocus={() =>
                      setHoveredMenuCard(index)
                    }
                    onBlur={(event) => {
                      setHoveredMenuCard(null);
                      resetMenuCardTilt(
                        event.currentTarget
                      );
                    }}
                  >
                    <span
                      className="petrolero-nav-card-float"
                      style={
                        {
                          "--nav-float-x1":
                            card.motion[0],
                          "--nav-float-y1":
                            card.motion[1],
                          "--nav-float-r1":
                            card.motion[2],
                          "--nav-float-x2":
                            card.motion[3],
                          "--nav-float-y2":
                            card.motion[4],
                          "--nav-float-r2":
                            card.motion[5],
                          "--nav-float-duration":
                            card.duration,
                          "--nav-float-delay":
                            card.delay,
                        } as CSSProperties
                      }
                    >
                      <img
                        src={card.image}
                        className="petrolero-nav-card-image"
                        alt=""
                        draggable={false}
                      />

                      <span className="petrolero-nav-card-heading">
                        <span className="petrolero-nav-card-number">
                          {card.number}
                        </span>

                        <span className="petrolero-nav-card-title">
                          {card.title}
                        </span>
                      </span>

                      <span
                        className="petrolero-nav-card-arrow"
                        aria-hidden="true"
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <path
                            d="M7 16H25M17 8L25 16L17 24"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Текст хиро */}

        <main className="relative z-10 flex min-h-0 w-full flex-1 flex-col lg:flex-row">
          <div className="petrolero-copy relative z-20 flex w-full flex-col justify-center px-5 pb-6 pt-12 sm:px-10 lg:w-[56%] lg:px-16 lg:pb-24 lg:pt-10">
            <div className="max-w-[780px]">
              <p className="petrolero-intro mb-7 text-[10px] font-semibold tracking-[0.3em] text-[#d5b179] sm:text-xs">
                МОТОРНЫЕ МАСЛА PETROLERO
              </p>

              <h1
                aria-label="Лучшая защита вашего двигателя"
                className="petrolero-heading flex flex-col items-start gap-3 font-black uppercase leading-[1.06] tracking-[-0.055em]"
              >
                <AnimatedPhrase
                  text="ЛУЧШАЯ ЗАЩИТА"
                  direction="left"
                  delay={FIRST_DELAY}
                  active={active}
                />

                <AnimatedPhrase
                  text="ВАШЕГО ДВИГАТЕЛЯ"
                  direction="right"
                  delay={SECOND_DELAY}
                  active={active}
                  accent
                />
              </h1>

              <div className="petrolero-content mt-8 sm:mt-10">
                <p className="max-w-[470px] text-sm leading-7 text-white/75 sm:text-base">
                  Современные моторные масла для уверенной
                  работы двигателя. Откройте линейку
                  Petrolero и подберите подходящий продукт.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="/catalog/motornye-masla/legkovye-masla-moto/"
                    className="petrolero-button inline-flex min-h-12 items-center justify-center gap-5 bg-[#d5b179] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#080808] transition-all hover:bg-[#edcb90] sm:px-8"
                  >
                    Выбрать масло
                    <span aria-hidden="true">
                      →
                    </span>
                  </a>

                  <a
                    href="/catalog/"
                    className="inline-flex min-h-12 items-center border-b border-[#d5b179]/60 text-[11px] font-medium uppercase tracking-[0.13em] text-white/85 transition-colors hover:text-[#d5b179]"
                  >
                    Перейти в каталог
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Прокрутка к молекулам */}

        <button
          type="button"
          onClick={scrollToSecondSection}
          className="petrolero-scroll-arrow absolute bottom-[100px] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3 text-[#d5b179]"
          aria-label="Прокрутить к молекулам"
        >
          <span className="text-[9px] font-semibold tracking-[0.3em]">
            ЛИСТАЙТЕ ВНИЗ
          </span>

          <span className="petrolero-arrow-ring flex h-12 w-12 items-center justify-center rounded-full border border-[#d5b179]/50 bg-black/35 backdrop-blur-sm">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v17" />
              <path d="m5 13 7 7 7-7" />
            </svg>
          </span>
        </button>

        {/* Футер хиро */}

        <footer className="relative z-20 shrink-0 border-t border-white/10 bg-black/50 px-5 py-4 backdrop-blur-md sm:px-10 lg:px-16">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-medium uppercase tracking-[0.15em] text-white/65 sm:text-xs">
              <span>Моторные масла</span>
              <span>Современные технологии</span>
              <span>Защита двигателя</span>
            </div>

            <a
              href="/catalog/motornye-masla/legkovye-masla-moto/"
              className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#d5b179] transition-colors hover:text-white"
            >
              Смотреть продукцию →
            </a>
          </div>
        </footer>
      </section>

      <div ref={secondSectionRef}>
        <MolecularSection />
      </div>

      <style jsx global>{`
        /* =====================================
           СТРАНИЦА И ФОН ХИРО
        ===================================== */

        .petrolero-page-scroll {
          height: 100vh;
          height: 100svh;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior-y: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #896333 #090909;
        }

        .petrolero-page-scroll:focus {
          outline: none;
        }

        .petrolero-hero {
          min-height: 100vh;
          min-height: 100svh;
        }

        .petrolero-image-layer {
          background: #050505;
        }

        .petrolero-image,
        .petrolero-video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 62% center;
          user-select: none;
        }

        .petrolero-video-layer {
          opacity: 1;
          transition: opacity 1000ms ease;
        }

        .petrolero-video-layer--hidden {
          opacity: 0;
          pointer-events: none;
        }

        .petrolero-overlay {
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.99) 0%,
              rgba(0, 0, 0, 0.94) 24%,
              rgba(0, 0, 0, 0.77) 43%,
              rgba(0, 0, 0, 0.28) 70%,
              rgba(0, 0, 0, 0.08) 100%
            ),
            linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.68),
              transparent 32%,
              transparent 73%,
              rgba(0, 0, 0, 0.32)
            );
        }

        /* =====================================
           КНОПКА МЕНЮ
        ===================================== */

        .petrolero-nav-trigger {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #edc887;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .petrolero-nav-trigger-glyph {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 6px;
          width: 43px;
          height: 43px;
          border: 1px solid rgba(235, 187, 108, 0.72);
          border-radius: 50%;
          transition:
            box-shadow 300ms ease,
            transform 350ms ease;
        }

        .petrolero-nav-trigger-glyph span {
          display: block;
          width: 17px;
          height: 1px;
          background: currentColor;
          transition: transform 300ms ease;
        }

        .petrolero-nav-trigger--open
        .petrolero-nav-trigger-glyph span:first-child {
          transform: translateY(3.5px) rotate(45deg);
        }

        .petrolero-nav-trigger--open
        .petrolero-nav-trigger-glyph span:last-child {
          transform: translateY(-3.5px) rotate(-45deg);
        }

        .petrolero-nav-trigger:hover
        .petrolero-nav-trigger-glyph {
          box-shadow: 0 0 19px rgba(239, 179, 83, 0.42);
        }

        /* =====================================
           ПАНЕЛЬ МЕНЮ: 60% ЭКРАНА
           БЕЗ ОБВОДКИ, С РАЗМЫТИЕМ ФОНА
        ===================================== */

        .petrolero-nav-panel {
          position: absolute;
          top: 80px;
          right: 0;
          left: 0;
          z-index: 70;

          display: flex;
          flex-direction: column;

          height: 60vh;
          height: 60svh;
          overflow: hidden;

          background: rgba(0, 0, 0, 0.24);
          backdrop-filter: blur(19px);
          -webkit-backdrop-filter: blur(19px);

          border: none;
          box-shadow: none;

          visibility: hidden;
          opacity: 0;
          pointer-events: none;

          clip-path: inset(0 0 100% 0);
          transform: translateY(-10px);

          transition:
            clip-path 800ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 650ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 350ms ease,
            visibility 800ms;
        }

        .petrolero-nav-panel--open {
          visibility: visible;
          opacity: 1;
          pointer-events: auto;
          clip-path: inset(0 0 0 0);
          transform: translateY(0);
        }

        .petrolero-nav-panel-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-shrink: 0;

          padding: 13px clamp(20px, 4vw, 64px) 0;

          color: #c99a57;
          font-size: 9px;
          letter-spacing: 0.2em;
        }

        /* =====================================
           РАСПОЛОЖЕНИЕ КАРТОЧЕК
        ===================================== */

        .petrolero-nav-cards {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-height: 0;
          width: 100%;
          padding: 6px 18px 12px;
        }

        .petrolero-nav-cards-list {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: clamp(10px, 1.35vw, 18px);

          width: 100%;
          min-width: 0;
          margin: 0;
          padding: 0;
          list-style: none;
          perspective: 1200px;
        }

        /* Карточки крупнее */

        .petrolero-nav-card-slot {
          position: relative;
          flex: 0 0 auto;

          width: clamp(
            148px,
            min(15vw, 26svh),
            225px
          );

          height: auto;
          min-width: 0;

          --nav-shift-x: 0px;
          --nav-arch-y: 0px;

          translate:
            var(--nav-shift-x)
            var(--nav-arch-y);

          transition: translate 400ms
            cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        /* =====================================
           АРКА: КРАЙНИЕ КАРТОЧКИ ВЫШЕ
        ===================================== */

        .petrolero-nav-card-slot:nth-child(1),
        .petrolero-nav-card-slot:nth-child(4) {
          --nav-arch-y: -21px;
        }

        .petrolero-nav-card-slot:nth-child(2),
        .petrolero-nav-card-slot:nth-child(3) {
          --nav-arch-y: 15px;
        }

        /* Поочерёдное появление */

        .petrolero-nav-panel--open
        .petrolero-nav-card-slot {
          animation:
            petrolero-nav-card-appear
            720ms cubic-bezier(0.16, 1, 0.3, 1)
            var(--nav-entry-delay) backwards;
        }

        @keyframes petrolero-nav-card-appear {
          from {
            opacity: 0;
            transform:
              translateY(55px)
              scale(0.88)
              rotateY(-10deg);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1)
              rotateY(0);
          }
        }

        .petrolero-nav-card-slot:has(
          .petrolero-nav-card:hover
        ),
        .petrolero-nav-card-slot:has(
          .petrolero-nav-card:focus-visible
        ) {
          z-index: 10;
        }

        /* Раздвижение соседних карточек */

        .petrolero-nav-cards-list[data-active="0"]
        .petrolero-nav-card-slot:nth-child(n + 2) {
          --nav-shift-x: 8px;
        }

        .petrolero-nav-cards-list[data-active="1"]
        .petrolero-nav-card-slot:nth-child(1) {
          --nav-shift-x: -8px;
        }

        .petrolero-nav-cards-list[data-active="1"]
        .petrolero-nav-card-slot:nth-child(n + 3) {
          --nav-shift-x: 8px;
        }

        .petrolero-nav-cards-list[data-active="2"]
        .petrolero-nav-card-slot:nth-child(-n + 2) {
          --nav-shift-x: -8px;
        }

        .petrolero-nav-cards-list[data-active="2"]
        .petrolero-nav-card-slot:nth-child(4) {
          --nav-shift-x: 8px;
        }

        .petrolero-nav-cards-list[data-active="3"]
        .petrolero-nav-card-slot:nth-child(-n + 3) {
          --nav-shift-x: -8px;
        }

        /* =====================================
           САМИ КАРТОЧКИ — ИЗОБРАЖЕНИЯ
        ===================================== */

        .petrolero-nav-card {
          display: block;
          position: relative;
          width: 100%;
          height: auto;

          color: #fff;
          text-decoration: none;

          --nav-tilt-x: 0deg;
          --nav-tilt-y: 0deg;

          transform:
            perspective(1000px)
            rotateX(var(--nav-tilt-x))
            rotateY(var(--nav-tilt-y))
            scale(1);

          transition: transform 400ms
            cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .petrolero-nav-card:hover,
        .petrolero-nav-card:focus-visible {
          transform:
            perspective(1000px)
            translateY(-9px)
            rotateX(var(--nav-tilt-x))
            rotateY(var(--nav-tilt-y))
            scale(1.065);
        }

        /* Хаотичное парение каждой карточки */

        .petrolero-nav-card-float {
          position: relative;
          display: block;
          width: 100%;
          height: auto;

          animation:
            petrolero-nav-card-float
            var(--nav-float-duration)
            ease-in-out
            var(--nav-float-delay)
            infinite;
        }

        @keyframes petrolero-nav-card-float {
          0%,
          100% {
            transform:
              translate3d(0, 0, 0)
              rotate(0);
          }

          31% {
            transform:
              translate3d(
                var(--nav-float-x1),
                var(--nav-float-y1),
                0
              )
              rotate(var(--nav-float-r1));
          }

          68% {
            transform:
              translate3d(
                var(--nav-float-x2),
                var(--nav-float-y2),
                0
              )
              rotate(var(--nav-float-r2));
          }
        }

        .petrolero-nav-card-image {
          display: block;
          width: 100%;
          height: auto;

          object-fit: initial;
          user-select: none;
          pointer-events: none;
        }

        /* Золотое свечение самой карточки */

        .petrolero-nav-card:hover
        .petrolero-nav-card-image,
        .petrolero-nav-card:focus-visible
        .petrolero-nav-card-image {
          animation:
            petrolero-nav-image-glow
            2.4s ease-in-out infinite;
        }

        @keyframes petrolero-nav-image-glow {
          0%,
          100% {
            filter: drop-shadow(
              0 0 4px rgba(255, 187, 76, 0.35)
            );
          }

          50% {
            filter: drop-shadow(
              0 0 12px rgba(255, 211, 131, 0.8)
            );
          }
        }

        /* =====================================
           НОМЕРА И НАЗВАНИЯ ВНУТРИ КАРТОЧЕК
        ===================================== */

        .petrolero-nav-card-heading {
          position: absolute;
          top: 6.4%;
          left: 6%;
          right: 6%;
          z-index: 2;

          display: flex;
          align-items: center;
          flex-direction: column;
          gap: 6px;

          text-align: center;
          pointer-events: none;
        }

        .petrolero-nav-card-number {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(21px, 2.1vw, 34px);
          line-height: 1;

          background: linear-gradient(
            105deg,
            #b17724,
            #fff0bc,
            #d79c3d,
            #fff6d6,
            #b17724
          );

          background-size: 240% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;

          animation:
            petrolero-nav-number-shine
            4s linear infinite;
        }

        @keyframes petrolero-nav-number-shine {
          from {
            background-position: 100% 50%;
          }

          to {
            background-position: -100% 50%;
          }
        }

        .petrolero-nav-card-title {
          position: relative;
          z-index: 0;
          isolation: isolate;

          display: inline-block;
          width: max-content;
          max-width: 100%;

          color: #fff5df;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(13px, 1.45vw, 22px);
          line-height: 1.1;
          white-space: nowrap;
        }

        /* Затемнение только под белым названием */

        .petrolero-nav-card-title::before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: -9px -12px;

          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.9),
            rgba(0, 0, 0, 0.54) 46%,
            transparent 76%
          );

          pointer-events: none;
        }

        /* =====================================
           ЗОЛОТЫЕ СТРЕЛКИ ВНУТРИ КАРТОЧЕК
        ===================================== */

        .petrolero-nav-card-arrow {
          position: absolute;
          z-index: 3;

          bottom: 8.5%;
          left: 50%;

          display: grid;
          place-items: center;

          width: clamp(28px, 3.2vw, 44px);
          aspect-ratio: 1;

          transform: translateX(-50%);

          border: 1px solid rgba(241, 190, 105, 0.85);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.67);
          color: #f6cb80;

          pointer-events: none;

          animation:
            petrolero-nav-arrow-glow
            2.4s ease-in-out infinite;
        }

        .petrolero-nav-card-arrow svg {
          animation:
            petrolero-nav-arrow-shift
            1.8s ease-in-out infinite;
        }

        @keyframes petrolero-nav-arrow-glow {
          0%,
          100% {
            box-shadow:
              0 0 6px rgba(255, 195, 104, 0.27);
          }

          50% {
            box-shadow:
              0 0 21px rgba(255, 195, 104, 0.66);
          }
        }

        @keyframes petrolero-nav-arrow-shift {
          0%,
          100% {
            transform: translateX(0);
          }

          50% {
            transform: translateX(3px);
          }
        }

        .petrolero-nav-card:hover
        .petrolero-nav-card-arrow,
        .petrolero-nav-card:focus-visible
        .petrolero-nav-card-arrow {
          background: #e9bd75;
          color: #080705;
        }

        .petrolero-nav-trigger:focus-visible,
        .petrolero-nav-card:focus-visible {
          outline: 2px solid #ffe0a3;
          outline-offset: 5px;
        }

        /* =====================================
           АНИМАЦИЯ ТЕКСТА ХИРО
        ===================================== */

        .petrolero-heading {
          font-size: clamp(1.3rem, 3.6vw, 4.2rem);
        }

        .petrolero-phrase {
          display: inline-block;
          position: relative;
          white-space: nowrap;
          opacity: 0;
          isolation: isolate;
        }

        .petrolero-phrase--left {
          --entry-x: -150vw;
        }

        .petrolero-phrase--right {
          --entry-x: 150vw;
        }

        .petrolero-phrase--active {
          animation:
            petrolero-drive
            var(--drive-duration) linear both;

          animation-delay: var(--phrase-delay);
        }

        .petrolero-phrase__letters {
          display: inline-block;
          position: relative;
          white-space: nowrap;
        }

        .petrolero-letter,
        .petrolero-space {
          display: inline-block;
          position: relative;
          vertical-align: baseline;
        }

        .petrolero-phrase--active .petrolero-letter {
          animation:
            petrolero-chain-impact
            var(--impact-duration)
            cubic-bezier(0.22, 0.8, 0.25, 1)
            both;

          animation-delay: var(--impact-delay);
        }

        @keyframes petrolero-drive {
          0% {
            opacity: 1;
            transform: translateX(var(--entry-x));
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes petrolero-chain-impact {
          0% {
            transform: translateX(0);
          }

          15% {
            transform: translateX(var(--impact-x));
          }

          36% {
            transform: translateX(var(--rebound-x));
          }

          60% {
            transform: translateX(var(--settle-x));
          }

          85%,
          100% {
            transform: translateX(0);
          }
        }

        .petrolero-intro {
          animation:
            petrolero-fade-in
            900ms ease-out 200ms both;
        }

        .petrolero-content {
          animation:
            petrolero-fade-in
            1000ms ease-out 2300ms both;
        }

        @keyframes petrolero-fade-in {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .petrolero-button {
          box-shadow:
            0 6px 30px rgba(213, 177, 121, 0.12);
        }

        .petrolero-button:hover {
          box-shadow:
            0 8px 34px rgba(213, 177, 121, 0.3);
        }

        .petrolero-arrow-ring {
          animation:
            petrolero-arrow-bounce
            1.8s ease-in-out infinite;
        }

        @keyframes petrolero-arrow-bounce {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(9px);
          }
        }

        /* =====================================
           ВТОРОЙ ЭКРАН
        ===================================== */

        .petrolero-molecular-section {
          background:
            radial-gradient(
              circle at 70% 35%,
              rgba(227, 162, 69, 0.12),
              transparent 27%
            ),
            radial-gradient(
              circle at 50% 78%,
              rgba(188, 129, 45, 0.1),
              transparent 24%
            ),
            #050505;
        }

        .petrolero-molecular-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;

          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.28),
            transparent 38%,
            transparent 75%,
            rgba(0, 0, 0, 0.3)
          );
        }

        .petrolero-molecular-canvas-wrap {
          position: absolute;
          inset: 0;
          z-index: 20;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .petrolero-molecular-canvas {
          display: block;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .petrolero-molecular-heading {
          pointer-events: none;
        }

        .petrolero-molecular-description {
          position: relative;
          max-width: 860px;
        }

        .petrolero-molecular-description p {
          text-wrap: pretty;
        }

        /* =====================================
           БУТЫЛОЧКИ
        ===================================== */

        .petrolero-bottles-stage,
        .petrolero-bottles-row,
        .petrolero-bottle {
          pointer-events: none;
        }

        .petrolero-bottles-glow {
          position: absolute;
          left: 50%;
          bottom: 4%;

          width: min(1100px, 90%);
          height: 120px;

          transform: translateX(-50%);
          border-radius: 50%;

          background: radial-gradient(
            ellipse,
            rgba(255, 194, 73, 0.27),
            rgba(223, 145, 30, 0.12) 45%,
            transparent 78%
          );

          filter: blur(28px);
        }

        .petrolero-bottles-row {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 18px;
          min-height: 330px;
        }

        .petrolero-bottle {
          position: relative;
          flex-shrink: 0;

          filter:
            drop-shadow(
              0 10px 26px rgba(0, 0, 0, 0.45)
            )
            drop-shadow(
              0 0 18px rgba(233, 182, 93, 0.08)
            );
        }

        .petrolero-bottle--left-big {
          width: clamp(160px, 17vw, 270px);
          height: clamp(210px, 28vw, 380px);
        }

        .petrolero-bottle--left-top {
          width: clamp(105px, 10vw, 150px);
          height: clamp(170px, 18vw, 235px);
        }

        .petrolero-bottle--center-small {
          width: clamp(96px, 9.5vw, 138px);
          height: clamp(154px, 16.5vw, 215px);
        }

        .petrolero-bottle--right-center {
          width: clamp(102px, 10vw, 148px);
          height: clamp(165px, 17vw, 226px);
        }

        .petrolero-bottle--right-big {
          width: clamp(165px, 18vw, 275px);
          height: clamp(215px, 29vw, 385px);
        }

        .petrolero-bottle-float-a {
          animation:
            petroleroBottleFloatA
            8.2s ease-in-out infinite;
        }

        .petrolero-bottle-float-b {
          animation:
            petroleroBottleFloatB
            6.9s ease-in-out infinite;
        }

        .petrolero-bottle-float-c {
          animation:
            petroleroBottleFloatC
            7.6s ease-in-out infinite;
        }

        .petrolero-bottle-float-d {
          animation:
            petroleroBottleFloatD
            8.8s ease-in-out infinite;
        }

        .petrolero-bottle-float-e {
          animation:
            petroleroBottleFloatE
            7.3s ease-in-out infinite;
        }

        @keyframes petroleroBottleFloatA {
          0%,
          100% {
            transform: rotate(-14deg) translateY(22px);
          }

          50% {
            transform: rotate(-10deg) translateY(4px);
          }
        }

        @keyframes petroleroBottleFloatB {
          0%,
          100% {
            transform: rotate(-18deg) translateY(-16px);
          }

          50% {
            transform: rotate(-13deg) translateY(-32px);
          }
        }

        @keyframes petroleroBottleFloatC {
          0%,
          100% {
            transform: rotate(-19deg) translateY(36px);
          }

          50% {
            transform: rotate(-12deg) translateY(18px);
          }
        }

        @keyframes petroleroBottleFloatD {
          0%,
          100% {
            transform: rotate(2deg) translateY(28px);
          }

          50% {
            transform: rotate(6deg) translateY(10px);
          }
        }

        @keyframes petroleroBottleFloatE {
          0%,
          100% {
            transform: rotate(11deg) translateY(18px);
          }

          50% {
            transform: rotate(7deg) translateY(-2px);
          }
        }

        /* =====================================
           ПЛАНШЕТ
        ===================================== */

        @media (min-width: 768px) and (max-width: 1023px) {
          .petrolero-heading {
            font-size: clamp(1.8rem, 5vw, 3.4rem);
          }

          .petrolero-image,
          .petrolero-video {
            object-position: 67% center;
          }

          .petrolero-molecular-heading {
            padding-top: 72px;
          }

          .petrolero-molecular-description {
            max-width: 720px;
          }
        }

        /* =====================================
           МОБИЛЬНОЕ МЕНЮ
        ===================================== */

        @media (max-width: 767px) {
          .petrolero-nav-trigger-label {
            font-size: 10px;
          }

          .petrolero-nav-panel-top {
            padding: 9px 18px 0;
            font-size: 8px;
          }

          .petrolero-nav-panel-top span:last-child {
            display: none;
          }

          .petrolero-nav-cards {
            overflow-x: auto;
            justify-content: flex-start;
            padding: 0 16px 10px;

            scrollbar-width: thin;
            scrollbar-color: #a77836 #050505;
          }

          .petrolero-nav-cards-list {
            flex: 0 0 max-content;
            width: max-content;
            justify-content: flex-start;
            gap: 10px;
            padding: 0 5px;
          }

          .petrolero-nav-card-slot {
            width: min(42vw, 25svh);
            height: auto;
          }

          .petrolero-nav-card-slot:nth-child(1),
          .petrolero-nav-card-slot:nth-child(4) {
            --nav-arch-y: -12px;
          }

          .petrolero-nav-card-slot:nth-child(2),
          .petrolero-nav-card-slot:nth-child(3) {
            --nav-arch-y: 9px;
          }

          .petrolero-nav-card-number {
            font-size: clamp(17px, 4.3vw, 25px);
          }

          .petrolero-nav-card-title {
            font-size: clamp(12px, 3.1vw, 17px);
          }

          .petrolero-nav-card-arrow {
            width: 29px;
          }
        }

        @media (max-height: 540px) and (min-width: 768px) {
          .petrolero-nav-card-slot {
            width: min(13vw, 24svh);
            height: auto;
          }

          .petrolero-nav-card-slot:nth-child(1),
          .petrolero-nav-card-slot:nth-child(4) {
            --nav-arch-y: -10px;
          }

          .petrolero-nav-card-slot:nth-child(2),
          .petrolero-nav-card-slot:nth-child(3) {
            --nav-arch-y: 7px;
          }

          .petrolero-nav-panel-top {
            padding-top: 6px;
          }
        }

        /* =====================================
           МОБИЛЬНЫЙ ХИРО И МОЛЕКУЛЫ
        ===================================== */

        @media (max-width: 767px) {
          .petrolero-copy {
            justify-content: flex-start;
            padding-top: 7vh;
          }

          .petrolero-heading {
            font-size: clamp(1.12rem, 5vw, 2.25rem);
            gap: 0.65rem;
          }

          .petrolero-intro {
            margin-bottom: 1.2rem;
          }

          .petrolero-content {
            margin-top: 1.25rem;
          }

          .petrolero-content p {
            max-width: 310px;
            font-size: 12px;
            line-height: 1.7;
          }

          .petrolero-content > div {
            margin-top: 1.2rem;
          }

          .petrolero-video,
          .petrolero-image {
            object-position: 70% center;
          }

          .petrolero-overlay {
            background: linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.96) 0%,
              rgba(0, 0, 0, 0.88) 34%,
              rgba(0, 0, 0, 0.35) 67%,
              rgba(0, 0, 0, 0.65) 100%
            );
          }

          .petrolero-scroll-arrow {
            bottom: 88px;
          }

          .petrolero-molecular-heading {
            padding-top: 54px;
          }

          .petrolero-molecular-heading h2 {
            font-size: clamp(1.7rem, 7vw, 2.5rem);
            line-height: 1.08;
          }

          .petrolero-molecular-description {
            margin-top: 22px;
          }

          .petrolero-molecular-description p {
            font-size: 12px;
            line-height: 1.75;
          }

          .petrolero-bottles-stage {
            min-height: 245px;
            padding-top: 36px;
          }

          .petrolero-bottles-row {
            min-height: 235px;
            gap: 3px;
            justify-content: space-between;
          }

          .petrolero-bottle--left-big {
            width: 26vw;
            height: 170px;
          }

          .petrolero-bottle--left-top {
            width: 18vw;
            height: 120px;
          }

          .petrolero-bottle--center-small {
            width: 16vw;
            height: 108px;
          }

          .petrolero-bottle--right-center {
            width: 16vw;
            height: 110px;
          }

          .petrolero-bottle--right-big {
            width: 27vw;
            height: 174px;
          }
        }

        /* =====================================
           УМЕНЬШЕНИЕ АНИМАЦИЙ
        ===================================== */

        @media (prefers-reduced-motion: reduce) {
          .petrolero-nav-panel {
            transition: none !important;
          }

          .petrolero-nav-card-slot,
          .petrolero-nav-card-float,
          .petrolero-nav-card-number,
          .petrolero-nav-card-arrow,
          .petrolero-nav-card-arrow svg {
            animation: none !important;
          }

          .petrolero-phrase,
          .petrolero-letter,
          .petrolero-intro,
          .petrolero-content,
          .petrolero-arrow-ring,
          .petrolero-bottle {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .petrolero-video-layer {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
