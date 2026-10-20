"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import OilVideoSurface from "./OilVideoSurface";
import type { OilRipple } from "./OilVideoSurface";
import "./HeroSection.css";

const VIDEO_SRC = "/home/video/oil.webm";
const MAX_RIPPLES = 12;

type HeroSectionProps = {
  phase: 0 | 1 | 2 | 3;
  reducedMotion: boolean;
  onNext: () => void;
};

export default function HeroSection({ phase, reducedMotion, onNext }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ripplesRef = useRef<OilRipple[]>([]);
  const lastPointerRef = useRef({ x: -1, y: -1, time: -1 });
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    setWebglReady(Boolean(gl));
    setVideoElement(video);

    const syncVideo = () => {
      setVideoReady(video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA);
    };

    // The source may already be ready when hydration completes.
    syncVideo();
    video.addEventListener("loadeddata", syncVideo);
    video.addEventListener("canplay", syncVideo);
    video.addEventListener("playing", syncVideo);
    video.addEventListener("emptied", syncVideo);
    return () => {
      video.removeEventListener("loadeddata", syncVideo);
      video.removeEventListener("canplay", syncVideo);
      video.removeEventListener("playing", syncVideo);
      video.removeEventListener("emptied", syncVideo);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
    } else {
      void video.play().catch(() => {
        // Keep the video as the fallback when autoplay is restricted.
      });
    }
  }, [reducedMotion, videoReady]);

  // Generate ambient waves while this screen is visible, even if the
  // visitor never moves the pointer. Pause the work offscreen.
  useEffect(() => {
    const section = heroRef.current;
    if (!section || reducedMotion) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    let sequence = 0;
    const spawn = () => {
      if (document.hidden) return;
      const time = performance.now() * 0.001;
      const x = 0.23 + 0.54 * (0.5 + 0.5 * Math.sin(sequence * 2.39996));
      const y = 0.24 + 0.49 * (0.5 + 0.5 * Math.cos(sequence * 1.73205));
      ripplesRef.current.push({ x, y, time, strength: 1.15 });
      if (ripplesRef.current.length > MAX_RIPPLES) {
        ripplesRef.current.splice(0, ripplesRef.current.length - MAX_RIPPLES);
      }
      sequence += 1;
    };

    const stop = () => {
      if (timer !== null) clearInterval(timer);
      timer = null;
    };
    const start = () => {
      if (timer !== null || document.hidden) return;
      spawn();
      timer = setInterval(spawn, 740);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.08 },
    );
    observer.observe(section);

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (section.getBoundingClientRect().bottom > 0 &&
               section.getBoundingClientRect().top < window.innerHeight) start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
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
          onClick={onNext}
        >
          <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
            <path d="M12 3v17m-7-7 7 7 7-7" />
          </svg>
        </button>
      </section>
  );
}
