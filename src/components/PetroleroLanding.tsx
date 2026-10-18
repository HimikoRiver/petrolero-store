"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import PetroleroHeader from "./PetroleroHeader";
import PetroleroStory from "./PetroleroStory";
import PetroleroThirdSection from "./PetroleroThirdSection";
import OilVideoSurface from "./OilVideoSurface";
import type { OilRipple } from "./OilVideoSurface";
import "./PetroleroLanding.css";

const VIDEO_SRC = "/home/video/oil.webm";
const MAX_RIPPLES = 12;

export default function PetroleroLanding() {
  const heroRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ripplesRef = useRef<OilRipple[]>([]);
  const lastPointerRef = useRef({ x: -1, y: -1, time: -1 });

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [showcase, setShowcase] = useState(false);

  const handleShowcaseChange = useCallback((active: boolean) => {
    setShowcase(active);
  }, []);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    setWebglReady(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    setVideoElement(videoRef.current);

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
    } else {
      void video.play().catch(() => {
        // Autoplay is decorative; the video itself remains the fallback.
      });
    }
  }, [reducedMotion, videoReady]);

  useEffect(() => {
    if (reducedMotion) {
      setPhase(3);
      return;
    }

    // If opening the page on an existing scroll position, do not leave
    // the brand centered over the second section.
    if (window.scrollY > window.innerHeight * 0.35) {
      setPhase(3);
      return;
    }

    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), 450),
      setTimeout(() => setPhase(2), 2300),
      setTimeout(() => setPhase(3), 3300),
    ];

    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const emitRipple = (event: ReactPointerEvent<HTMLElement>, force = false) => {
    if (reducedMotion || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const now = performance.now() * 0.001;
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    const previous = lastPointerRef.current;
    const moved = previous.time < 0
      ? 0
      : Math.hypot((x - previous.x) * rect.width, (y - previous.y) * rect.height);
    const elapsed = now - previous.time;

    if (!force && previous.time >= 0 && (elapsed < 0.13 || moved < 16)) return;
    if (force && previous.time >= 0 && elapsed < 0.06) return;

    ripplesRef.current.push({
      x,
      y,
      time: now,
      strength: force ? 1.35 : Math.min(1.15, 0.85 + moved / 220),
    });
    if (ripplesRef.current.length > MAX_RIPPLES) ripplesRef.current.shift();
    lastPointerRef.current = { x, y, time: now };
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest("button, a, input")) return;
    emitRipple(event, true);
  };

  return (
    <main className="petrolero-home">
      <PetroleroHeader phase={phase} showcase={showcase} reducedMotion={reducedMotion} />

      <section
        ref={heroRef}
        className="petrolero-home-hero"
        aria-label="Моторные масла Petrolero"
        onPointerMove={(event) => emitRipple(event)}
        onPointerDown={onPointerDown}
      >
        <div className="petrolero-home-oil" aria-hidden="true">
          <video
            ref={videoRef}
            className="petrolero-home-video"
            src={VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
          />
          {webglReady && videoReady && videoElement && (
            <OilVideoSurface
              video={videoElement}
              ripplesRef={ripplesRef}
              reducedMotion={reducedMotion}
            />
          )}
        </div>
        <div className="petrolero-home-vignette" aria-hidden="true" />

        <div className="petrolero-home-copy" data-visible={phase === 3}>
          <p className="petrolero-home-eyebrow">МОТОРНЫЕ МАСЛА PETROLERO</p>
          <h1>
            <span>ЛУЧШАЯ ЗАЩИТА</span>
            <span>ВАШЕГО <em>ДВИГАТЕЛЯ</em></span>
          </h1>
          <p className="petrolero-home-slogan">В ДВИЖЕНИИ. ПОД НАГРУЗКОЙ. КАЖДЫЙ ДЕНЬ.</p>
        </div>

        <button
          className="petrolero-home-scroll"
          type="button"
          aria-label="Перейти ко второму экрану"
          onClick={() => storyRef.current?.scrollIntoView({
            behavior: reducedMotion ? "instant" : "smooth",
            block: "start",
          })}
        >
          <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
            <path d="M12 3v17m-7-7 7 7 7-7" />
          </svg>
        </button>
      </section>

      <div ref={storyRef}>
        <PetroleroStory onShowcaseChange={handleShowcaseChange} reducedMotion={reducedMotion} />
      </div>

      <PetroleroThirdSection />
    </main>
  );
}
