"use client";

import { useEffect, useRef, useState } from "react";
import EngineAnnotations from "./EngineAnnotations";
import VehicleCards from "./VehicleCards";
import { ENGINE_NOTES } from "./technologyData";
import "./TechnologySection.css";

const VIDEO_SRC = "/home/video/block4.webm";

export default function TechnologySection({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const explicitlyPausedRef = useRef(false);
  const [paused, setPaused] = useState(true);
  const [revealedCount, setRevealedCount] = useState(0);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let isMounted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!isMounted) return;
        if (entry.isIntersecting) {
          if (!explicitlyPausedRef.current && !reducedMotion) {
            void video.play().catch(() => {
              if (isMounted) setPaused(true);
            });
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => {
      isMounted = false;
      observer.disconnect();
      video.pause();
    };
  }, [reducedMotion]);

  const updateTimeline = () => {
    const seconds = videoRef.current?.currentTime ?? 0;
    const count = ENGINE_NOTES.filter((note) => seconds >= note.time).length;
    setRevealedCount((previous) => Math.max(previous, count));
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      explicitlyPausedRef.current = false;
      void video.play().catch(() => setPaused(true));
    } else {
      explicitlyPausedRef.current = true;
      video.pause();
    }
  };

  return (
    <section ref={sectionRef} className="petrolero-technology" aria-label="Подбор масла и технологии защиты двигателя">
      <div className="petrolero-tech-inner">
        <div className="petrolero-tech-section-heading">
          <span className="petrolero-tech-heading-line" aria-hidden="true" />
          <h2>НАЙДИТЕ СВОЁ МАСЛО</h2>
          <span className="petrolero-tech-heading-line" aria-hidden="true" />
        </div>

        <VehicleCards />

        <div className="petrolero-tech-section-heading petrolero-tech-section-heading--engine">
          <span className="petrolero-tech-heading-line" aria-hidden="true" />
          <h2>ТЕХНОЛОГИЯ В ДЕТАЛЯХ</h2>
          <span className="petrolero-tech-heading-line" aria-hidden="true" />
        </div>

        <div className={`petrolero-tech-stage ${paused ? "is-paused" : "is-playing"}`}>
          <video
            ref={videoRef}
            className="petrolero-tech-video"
            src={VIDEO_SRC}
            muted
            playsInline
            loop
            preload="metadata"
            disablePictureInPicture
            aria-label="Двигатель с движущимся золотистым маслом"
            onTimeUpdate={updateTimeline}
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
            onError={() => { setVideoError(true); setPaused(true); }}
          />
          <div className="petrolero-tech-video-shade" aria-hidden="true" />
          {videoError ? (
            <p className="petrolero-tech-error" role="status">
              Не удалось загрузить видео. Проверь файл public/home/video/block4.webm.
            </p>
          ) : null}
          <EngineAnnotations revealedCount={revealedCount} />
          <button
            className="petrolero-tech-play"
            type="button"
            onClick={togglePlayback}
            aria-label={paused ? "Воспроизвести видео двигателя" : "Приостановить видео двигателя"}
            aria-pressed={!paused}
          >
            <svg className="petrolero-tech-play-outline" viewBox="0 0 56 56" aria-hidden="true">
              <rect x="1.5" y="1.5" width="53" height="53" pathLength="100" />
            </svg>
            {paused ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true"><path d="m8 4 12 8-12 8V4Z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
