"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { clamp } from "./model";
import type { Particle, PointerPosition } from "./model";

export default function MolecularCanvas({
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

    const context = canvas.getContext("2d", {
      alpha: true,
    });

    if (!context) return;

    // Context type is non-null in nested canvas animation callbacks.
    const ctx: CanvasRenderingContext2D = context;

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

