"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import OilVideoSurface from "@/components/OilVideoSurface";
import type { OilRipple } from "@/components/OilVideoSurface";
import "./liquid-demo.css";

const MAX_RIPPLES = 12;
const PRIMARY_VIDEO_SRC = "/home/video/oil-loop.webm";
const FALLBACK_VIDEO_SRC = "/home/video/oil.webm";

function BrandMark() {
  return (
    <svg className="liquid-demo-mark" viewBox="0 0 70 88" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="liquid-gold" x1="7" y1="6" x2="62" y2="81" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1C6" />
          <stop offset="0.45" stopColor="#DBA85D" />
          <stop offset="1" stopColor="#8C5522" />
        </linearGradient>
      </defs>
      <path d="M35 2C29 16 7 38 7 56a28 28 0 0 0 56 0C63 38 41 16 35 2Z" fill="url(#liquid-gold)" />
      <path d="M36 29C30 40 22 48 22 57c0 8 6 14 14 14 7 0 12-4 14-10-15 3-24-9-14-32Z" fill="#0D0906" />
    </svg>
  );
}

export default function LiquidDemoPage() {
  const surfaceRef = useRef<HTMLElement>(null);
  const ripplesRef = useRef<OilRipple[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoSource, setVideoSource] = useState(PRIMARY_VIDEO_SRC);
  const lastPointerRef = useRef({ x: -1, y: -1, time: -1 });
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [hasWebGL, setHasWebGL] = useState(false);
  const [motionReduced, setMotionReduced] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    setHasWebGL(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (motionReduced) {
      video.pause();
    } else {
      void video.play().catch(() => {
        // Browser autoplay policies may pause the background until interaction.
      });
    }
  }, [motionReduced, videoSource, videoReady]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    ripplesRef.current = [];
    lastPointerRef.current = { x: -1, y: -1, time: -1 };
    if (motionReduced) {
      setPhase(3);
      return;
    }
    setPhase(0);
    timersRef.current = [
      setTimeout(() => setPhase(1), 700),
      setTimeout(() => setPhase(2), 2650),
      setTimeout(() => setPhase(3), 3650),
    ];
    return () => timersRef.current.forEach(clearTimeout);
  }, [run, motionReduced]);

  const emitRipple = (event: ReactPointerEvent<HTMLElement>, force = false) => {
    if (motionReduced || !surfaceRef.current) return;
    const now = performance.now() * 0.001;
    const rect = surfaceRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    const previous = lastPointerRef.current;
    const movedPx = previous.time < 0
      ? 0
      : Math.hypot((x - previous.x) * rect.width, (y - previous.y) * rect.height);
    const elapsed = now - previous.time;

    // Space impulses out along the cursor path so rings remain distinguishable.
    if (!force && previous.time >= 0 && (elapsed < 0.13 || movedPx < 16)) return;
    if (force && previous.time >= 0 && elapsed < 0.06) return;

    ripplesRef.current.push({
      x,
      y,
      time: now,
      strength: force ? 1.35 : Math.min(1.15, 0.85 + movedPx / 220),
    });
    if (ripplesRef.current.length > MAX_RIPPLES) ripplesRef.current.shift();
    lastPointerRef.current = { x, y, time: now };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    emitRipple(event);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest("button, a")) return;
    emitRipple(event, true);
  };

  const skipIntro = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase(3);
  };

  return (
    <main
      ref={surfaceRef}
      className="liquid-demo"
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      aria-label="Интерактивное интро Petrolero"
    >
      <div className="liquid-demo-surface" aria-hidden="true">
        <video
          ref={(node) => {
            videoRef.current = node;
            if (node && videoElement !== node) setVideoElement(node);
          }}
          className="liquid-demo-video"
          src={videoSource}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setVideoReady(true)}
          onError={() => {
            setVideoReady(false);
            if (videoSource === PRIMARY_VIDEO_SRC) {
              setVideoSource(FALLBACK_VIDEO_SRC);
            }
          }}
        />
        {hasWebGL && videoReady && videoElement && (
          <OilVideoSurface
            video={videoElement}
            ripplesRef={ripplesRef}
            reducedMotion={motionReduced}
          />
        )}
      </div>
      <div className="liquid-demo-shade" aria-hidden="true" />

      <div className="liquid-demo-brand" data-phase={phase}>
        <BrandMark />
        <span>PETROLERO</span>
      </div>

      <div className={`liquid-demo-navigation ${phase === 3 ? "is-visible" : ""}`}>
        <span>PREMIUM MOTOR OIL</span>
        <a href="/" className="liquid-demo-back">Вернуться на главную <span aria-hidden="true">↗</span></a>
      </div>

      <section className={`liquid-demo-copy ${phase === 3 ? "is-visible" : ""}`}>
        <p className="liquid-demo-eyebrow">МОТОРНЫЕ МАСЛА PETROLERO</p>
        <h1>ЛУЧШАЯ<br />ЗАЩИТА<br /><em>ДВИГАТЕЛЯ.</em></h1>
        <p className="liquid-demo-description">
          Масло в движении. Проведите курсором по поверхности.
        </p>
      </section>

      <div className="liquid-demo-bottom">
        <span>ЭКСПЕРИМЕНТАЛЬНЫЙ ПЕРВЫЙ ЭКРАН</span>
        {phase < 3 ? (
          <button type="button" onClick={skipIntro}>Пропустить интро →</button>
        ) : (
          <button type="button" onClick={() => setRun((value) => value + 1)}>Повторить интро ↻</button>
        )}
      </div>
    </main>
  );
}
