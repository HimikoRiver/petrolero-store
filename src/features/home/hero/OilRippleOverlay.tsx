"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { OilRipple } from "./OilVideoSurface";

type Props = {
  ripplesRef: RefObject<OilRipple[]>;
  reducedMotion: boolean;
  visible: boolean;
};

/**
 * Transparent 2D ripple highlights are independent of the video/WebGL
 * initialization, so ambient waves remain visible during initial loading.
 */
export default function OilRippleOverlay({ ripplesRef, reducedMotion, visible }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion || !visible) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;
    let frame = 0;
    let width = 0;
    let height = 0;
    let lastTime = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (timestamp: number) => {
      frame = requestAnimationFrame(draw);
      if (document.hidden || width <= 0 || height <= 0) return;
      // Reduce unnecessary redraw frequency on high-refresh-rate devices.
      if (timestamp - lastTime < 15) return;
      lastTime = timestamp;
      ctx.clearRect(0, 0, width, height);
      const now = performance.now() * 0.001;
      const unit = Math.min(width, height);
      for (const ripple of ripplesRef.current) {
        const age = now - ripple.time;
        if (age < 0 || age >= 2.4) continue;
        const radius = age * unit * 0.32;
        const fade = Math.pow(1 - age / 2.4, 1.35) * ripple.strength;
        const x = ripple.x * width;
        const y = (1 - ripple.y) * height;
        const ring = ctx.createRadialGradient(x, y, Math.max(0, radius - 11), x, y, radius + 11);
        ring.addColorStop(0, "rgba(225,159,70,0)");
        ring.addColorStop(0.35, `rgba(222,157,70,${0.09 * fade})`);
        ring.addColorStop(0.53, `rgba(255,225,169,${0.34 * fade})`);
        ring.addColorStop(0.70, `rgba(166,103,44,${0.15 * fade})`);
        ring.addColorStop(1, "rgba(180,105,47,0)");
        ctx.fillStyle = ring;
        ctx.beginPath();
        ctx.arc(x, y, radius + 11, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      ctx.clearRect(0, 0, width, height);
    };
  }, [ripplesRef, reducedMotion, visible]);

  return <canvas ref={canvasRef} className="petrolero-home-ripples" aria-hidden="true" />;
}
