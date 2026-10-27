
"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { ENGINE_NOTES } from "./technologyData";

const ENGINE_ICON_SRC = {
  protection: "/home/images/icons/engine-shield1.webp",
  innovation: "/home/images/icons/engine-gear1.webp",
  efficiency: "/home/images/icons/engine-speedometer1.webp",
  stability: "/home/images/icons/engine-oil-drop1.webp",
} as const;

const ENGINE_ICON_SCALE = {
  protection: 1.1,
  innovation: 1.08,
  efficiency: 1.23,
  stability: 1,
} as const;

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 675;
const CONNECTION_GAP = 12;

type NoteId = (typeof ENGINE_NOTES)[number]["id"];

type EngineAnnotationsProps = {
  revealedCount: number;
};

type ConnectionPaths = Partial<Record<NoteId, string>>;

function getTextRight(element: HTMLElement): number {
  const textRects: DOMRect[] = [];

  const children = element.querySelectorAll("strong, span");

  children.forEach((child) => {
    const range = document.createRange();

    range.selectNodeContents(child);

    for (const rect of Array.from(range.getClientRects())) {
      if (rect.width > 0) {
        textRects.push(rect);
      }
    }
  });

  if (textRects.length === 0) {
    return element.getBoundingClientRect().right;
  }

  return Math.max(...textRects.map((rect) => rect.right));
}

function getBendX(path: string): number {
  const match = path.match(/H\s*(-?\d+(?:\.\d+)?)/);

  return match ? Number(match[1]) : 0;
}

function buildPath(
  startX: number,
  startY: number,
  bendX: number,
  dotX: number,
  dotY: number,
): string {
  const distance = Math.abs(dotX - startX);

  if (distance < 1) {
    return `M${startX.toFixed(2)} ${startY.toFixed(2)}L${dotX} ${dotY}`;
  }

  // Keep the original elbow whenever there is enough room.
  // On narrower screens, prevent it from crossing the endpoints.
  const spacing = Math.min(14, distance / 4);

  const minX = Math.min(startX, dotX) + spacing;
  const maxX = Math.max(startX, dotX) - spacing;

  const safeBendX = Math.max(
    minX,
    Math.min(bendX, maxX),
  );

  return [
    `M${startX.toFixed(2)} ${startY.toFixed(2)}`,
    `H${safeBendX.toFixed(2)}`,
    `L${dotX} ${dotY}`,
  ].join("");
}

export default function EngineAnnotations({
  revealedCount,
}: EngineAnnotationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const noteRefs = useRef<
    Partial<Record<NoteId, HTMLDivElement | null>>
  >({});

  const [connections, setConnections] =
    useState<ConnectionPaths>({});

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let frame = 0;
    let disposed = false;

    const measure = () => {
      if (disposed) return;

      const containerRect = container.getBoundingClientRect();

      if (
        containerRect.width === 0 ||
        containerRect.height === 0
      ) {
        return;
      }

      const scaleX = SVG_WIDTH / containerRect.width;
      const scaleY = SVG_HEIGHT / containerRect.height;

      const compact = window.matchMedia(
        "(max-width: 1050px)",
      ).matches;

      const next: ConnectionPaths = {};

      for (const note of ENGINE_NOTES) {
        const noteElement = noteRefs.current[note.id];

        if (!noteElement) continue;

        const iconElement =
          noteElement.querySelector<HTMLElement>(
            ".petrolero-tech-note-icon",
          );

        const copyElement =
          noteElement.querySelector<HTMLElement>(
            ".petrolero-tech-note-copy",
          );

        if (!iconElement || !copyElement) continue;

        let startX: number;

        if (note.side === "left") {
          // Lines on the left begin after the final
          // visible edge of the text.
          const rightEdge = getTextRight(copyElement);

          startX =
            (rightEdge -
              containerRect.left +
              CONNECTION_GAP) *
            scaleX;
        } else {
          // Lines on the right stop before the icon.
          const iconRect =
            iconElement.getBoundingClientRect();

          startX =
            (iconRect.left -
              containerRect.left -
              CONNECTION_GAP) *
            scaleX;
        }

        /*
         * CSS places each label using top: ...%
         * and translateY(-50%).
         *
         * offsetTop is the label's intended center,
         * independent of its reveal animation.
         */
        const startY =
          noteElement.offsetTop * scaleY;

        const originalPath = compact
          ? note.compactLine
          : note.line;

        next[note.id] = buildPath(
          startX,
          startY,
          getBendX(originalPath),
          note.dotX,
          note.dotY,
        );
      }

      setConnections((previous) => {
        const unchanged = ENGINE_NOTES.every(
          (note) =>
            previous[note.id] === next[note.id],
        );

        return unchanged ? previous : next;
      });
    };

    const scheduleMeasure = () => {
      if (disposed) return;

      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(measure);
    };

    // Initial measurement.
    measure();

    const observer = new ResizeObserver(
      scheduleMeasure,
    );

    observer.observe(container);

    for (const note of ENGINE_NOTES) {
      const element = noteRefs.current[note.id];

      if (!element) continue;

      observer.observe(element);

      const icon = element.querySelector(
        ".petrolero-tech-note-icon",
      );

      const copy = element.querySelector(
        ".petrolero-tech-note-copy",
      );

      if (icon) observer.observe(icon);
      if (copy) observer.observe(copy);
    }

    window.addEventListener(
      "resize",
      scheduleMeasure,
    );

    // Fonts can change actual word widths.
    void document.fonts.ready.then(() => {
      if (!disposed) scheduleMeasure();
    });

    return () => {
      disposed = true;

      cancelAnimationFrame(frame);
      observer.disconnect();

      window.removeEventListener(
        "resize",
        scheduleMeasure,
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="petrolero-tech-annotations"
      aria-label="Технологические преимущества двигателя"
    >
      <svg
        className="petrolero-tech-connections"
        viewBox="0 0 1200 675"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        {ENGINE_NOTES.map((note, index) => (
          <g
            key={note.id}
            className={[
              "petrolero-tech-connection",
              index < revealedCount
                ? "is-visible"
                : "",
            ].join(" ")}
          >
            <path
              className="petrolero-tech-connection-path--responsive"
              d={
                connections[note.id] ??
                note.line
              }
              pathLength="100"
              style={{ display: "block" }}
            />

            <circle
              className="petrolero-tech-dot-glow"
              cx={note.dotX}
              cy={note.dotY}
              r="7"
            />

            <circle
              className="petrolero-tech-dot"
              cx={note.dotX}
              cy={note.dotY}
              r="3.1"
            />
          </g>
        ))}
      </svg>

      {ENGINE_NOTES.map((note, index) => (
        <div
          key={note.id}
          ref={(element) => {
            noteRefs.current[note.id] = element;
          }}
          className={[
            "petrolero-tech-note",
            `petrolero-tech-note--${note.side}-${note.position}`,
            index < revealedCount
              ? "is-visible"
              : "",
          ].join(" ")}
        >
          <span
            className="petrolero-tech-note-icon"
            aria-hidden="true"
          >
            <Image
              className="petrolero-tech-note-icon-image"
              src={ENGINE_ICON_SRC[note.id]}
              width={96}
              height={96}
              alt=""
              style={{
                transform: `scale(${ENGINE_ICON_SCALE[note.id]})`,
                transformOrigin: "center center",
              }}
            />
          </span>

          <span className="petrolero-tech-note-copy">
            <strong>{note.title}</strong>
            <span>{note.detail}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
