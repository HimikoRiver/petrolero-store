"use client";

import Image from "next/image";
import { useMemo, useState, type MouseEvent, type TouchEvent, type KeyboardEvent } from "react";
import type { CatalogGalleryFrame } from "./data/catalogData";

type ProductGalleryProps = {
  image: string | null;
  gallery?: readonly CatalogGalleryFrame[];
  title: string;
  mode?: "card" | "preview";
};

type GalleryFrame = CatalogGalleryFrame & { label: string };

export default function ProductGallery({
  image,
  gallery,
  title,
  mode = "card",
}: ProductGalleryProps) {
  const frames = useMemo<GalleryFrame[]>(() => {
    // A supplied gallery is the complete ordered sequence, including its
    // first view. This keeps four-angle atlases aligned from frame one.
    if (gallery?.length) return [...gallery];
    return image ? [{ kind: "image", src: image, label: "Основной вид" }] : [];
  }, [image, gallery]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const hasAngles = frames.length > 1;
  const index = Math.min(activeIndex, Math.max(frames.length - 1, 0));
  const frame = frames[index];

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!hasAngles) return;
    if ((event.target as Element).closest("button")) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width) return;

    const x = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width - 1);
    setActiveIndex(Math.min(frames.length - 1, Math.floor((x / bounds.width) * frames.length)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!hasAngles) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % frames.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + frames.length) % frames.length);
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    if (!hasAngles || !touch) return;
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!touchStart || !hasAngles) return;
    const touch = event.changedTouches[0];
    setTouchStart(null);
    if (!touch) return;

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    if (Math.abs(deltaX) < 35 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    setActiveIndex((current) =>
      deltaX < 0 ? (current + 1) % frames.length : (current - 1 + frames.length) % frames.length,
    );
  };

  return (
    <div
      className="petrolero-product-gallery"
      data-mode={mode}
      data-multiple={hasAngles}
      onMouseMove={handleMove}
      onMouseLeave={() => setActiveIndex(0)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={hasAngles ? 0 : undefined}
      role={hasAngles ? "group" : undefined}
      aria-roledescription={hasAngles ? "галерея изображений" : undefined}
      aria-label={hasAngles ? title + ": ракурсы товара, используйте стрелки влево и вправо" : undefined}
    >
      <div className="petrolero-product-gallery__picture">
        {!frame ? (
          <span className="petrolero-catalog-no-image" role="img" aria-label={title + ": фотография отсутствует"}>
            Фото готовится
          </span>
        ) : frame.kind === "image" ? (
          <Image
            src={frame.src}
            alt={title + " — " + frame.label}
            fill
            sizes={mode === "preview"
              ? "(max-width: 700px) 90vw, 410px"
              : "(max-width: 570px) 88vw, (max-width: 1050px) 44vw, (max-width: 1280px) 28vw, 22vw"}
            className="petrolero-product-gallery__photo"
          />
        ) : (
          <div className="petrolero-product-gallery__sprite-window" role="img" aria-label={title + " — " + frame.label}>
            <div
              className="petrolero-product-gallery__sprite"
              style={{
                backgroundImage: "url(\"" + frame.src + "\")",
                backgroundSize: frame.columns * 100 + "% 100%",
                backgroundPosition: (frame.index / Math.max(1, frame.columns - 1)) * 100 + "% 50%",
              }}
            />
          </div>
        )}
      </div>

      {hasAngles && (
        <div className="petrolero-product-gallery__indicators" role="group" aria-label="Выбор ракурса">
          {frames.map((item, itemIndex) => (
            <button
              key={itemIndex}
              type="button"
              className="petrolero-product-gallery__indicator"
              aria-label={item.label + ", изображение " + (itemIndex + 1) + " из " + frames.length}
              aria-pressed={index === itemIndex}
              onClick={() => setActiveIndex(itemIndex)}
            >
              <span />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
