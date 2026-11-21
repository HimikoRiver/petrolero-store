"use client";

import { useEffect, useRef } from "react";
import "./GoldenThreadsOrb.css";

type GoldParticle = {
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  phase: number;
  speed: number;
};

const PARTICLE_COUNT = 15;
const MAX_DPR = 2;

/** A quiet field of gold dust, with soft cursor repulsion.
 * The original component name is kept to preserve its login-page integration.
 */
export default function GoldenThreadsOrb() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const rootElement: HTMLDivElement = root;
    const canvasElement: HTMLCanvasElement = canvas;
    const context = canvasElement.getContext("2d", { alpha: true });
    if (!context) return;

    const ctx: CanvasRenderingContext2D = context;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    let width = 0;
    let height = 0;
    let frame = 0;
    let previousTime = 0;
    let isIntersecting = true;
    let particles: GoldParticle[] = [];

    const pointer = { x: 0, y: 0, active: false };

    // Fixed distribution prevents a visible reshuffle on every component render.
    function random(seed: number): number {
      const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return value - Math.floor(value);
    }

    function createParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const column = i % 5;
        const row = Math.floor(i / 5);
        const u = (column + 0.5 + (random(i + 1) - 0.5) * 0.62) / 5;
        const v = (row + 0.5 + (random(i + 23) - 0.5) * 0.64) / 3;
        const x = (0.12 + u * 0.76) * width;
        const y = (0.11 + v * 0.78) * height;

        return {
          anchorX: x,
          anchorY: y,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: i % 7 === 0 ? 2.8 : 1.05 + random(i + 45) * 1.35,
          opacity: 0.34 + random(i + 67) * 0.42,
          phase: random(i + 89) * Math.PI * 2,
          speed: 0.22 + random(i + 111) * 0.20,
        };
      });
    }

    function drawParticle(particle: GoldParticle) {
      const radius = particle.radius;
      const glow = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, radius * 4.5,
      );
      glow.addColorStop(0, "rgba(255, 235, 183, " + particle.opacity * 0.72 + ")");
      glow.addColorStop(0.23, "rgba(231, 171, 82, " + particle.opacity * 0.42 + ")");
      glow.addColorStop(1, "rgba(198, 116, 34, 0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius * 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(244, 195, 117, " + particle.opacity + ")";
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 243, 217, " + Math.min(0.94, particle.opacity + 0.18) + ")";
      ctx.beginPath();
      ctx.arc(particle.x - radius * 0.25, particle.y - radius * 0.27, radius * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }

    function draw(now: number) {
      frame = 0;
      if (!width || !height || document.hidden || !isIntersecting) return;

      const still = reduceMotion.matches;
      const elapsed = previousTime ? Math.min(32, now - previousTime) : 16.67;
      previousTime = now;
      const step = elapsed / 16.67;
      const seconds = now / 1000;
      ctx.clearRect(0, 0, width, height);

      const influence = Math.min(125, width * 0.29);
      for (const particle of particles) {
        let targetX = particle.anchorX;
        let targetY = particle.anchorY;

        if (!still) {
          targetX += Math.cos(seconds * particle.speed + particle.phase) * 12;
          targetY += Math.sin(seconds * particle.speed * 0.83 + particle.phase) * 10;
        }

        if (!still && pointer.active) {
          const dx = targetX - pointer.x;
          const dy = targetY - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < influence) {
            const intensity = Math.pow(1 - distance / influence, 1.35);
            const strength = intensity * 86;
            const unitX = distance > 0.001 ? dx / distance : Math.cos(particle.phase);
            const unitY = distance > 0.001 ? dy / distance : Math.sin(particle.phase);
            targetX += unitX * strength;
            targetY += unitY * strength;
          }
        }

        if (still) {
          particle.x = targetX;
          particle.y = targetY;
          particle.vx = 0;
          particle.vy = 0;
        } else {
          const damping = Math.pow(0.77, step);
          particle.vx = (particle.vx + (targetX - particle.x) * 0.052 * step) * damping;
          particle.vy = (particle.vy + (targetY - particle.y) * 0.052 * step) * damping;
          particle.x += particle.vx * step;
          particle.y += particle.vy * step;
        }

        drawParticle(particle);
      }

      if (!still) frame = window.requestAnimationFrame(draw);
    }

    function stop() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    }

    function start() {
      if (!width || !height || document.hidden || !isIntersecting || frame) return;
      if (reduceMotion.matches) {
        draw(0);
      } else {
        frame = window.requestAnimationFrame(draw);
      }
    }

    function resize() {
      const rect = rootElement.getBoundingClientRect();
      const nextWidth = Math.round(rect.width);
      const nextHeight = Math.round(rect.height);
      if (width === nextWidth && height === nextHeight) return;

      stop();
      width = nextWidth;
      height = nextHeight;
      if (!width || !height) return;

      const ratio = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvasElement.width = Math.round(width * ratio);
      canvasElement.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      createParticles();
      start();
    }

    function onPointerMove(event: PointerEvent) {
      if (!finePointer.matches || reduceMotion.matches) {
        pointer.active = false;
        return;
      }

      const rect = rootElement.getBoundingClientRect();
      // Listen on window, not on the visual, so the artwork never intercepts
      // clicks, input focus, or hover on the authentication form.
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.active = x >= -40 && y >= -40 &&
        x <= rect.width + 40 && y <= rect.height + 40;
      pointer.x = x;
      pointer.y = y;
    }

    function clearPointer() {
      pointer.active = false;
    }

    function onVisibilityChange() {
      if (document.hidden) stop();
      else start();
    }

    function onMotionChange() {
      clearPointer();
      stop();
      start();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(rootElement);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) start();
      else stop();
    });
    visibilityObserver.observe(rootElement);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", clearPointer);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reduceMotion.addEventListener("change", onMotionChange);

    resize();

    return () => {
      stop();
      observer.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", clearPointer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reduceMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div ref={rootRef} className="golden-threads-orb" aria-hidden="true">
      <canvas ref={canvasRef} className="golden-threads-orb__canvas" />
    </div>
  );
}
