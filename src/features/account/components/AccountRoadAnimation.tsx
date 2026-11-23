"use client";

import { useEffect, useId, useRef, type PointerEvent } from "react";
import "../styles/roadAnimation.css";

type RoadKnot = { y: number; x: number; width: number };
type RoadPoint = RoadKnot;

/**
 * A perspective S-curve: far-away markings and borders shrink naturally.
 * All geometry is calculated once at module load, not on animation frames.
 */
const ROAD_KNOTS: readonly RoadKnot[] = [
  { y: 28, x: 272, width: 5 },
  { y: 49, x: 279, width: 8 },
  { y: 64, x: 248, width: 13 },
  { y: 81, x: 285, width: 21 },
  { y: 96, x: 310, width: 30 },
  { y: 110, x: 284, width: 42 },
  { y: 131, x: 241, width: 58 },
  { y: 151, x: 205, width: 73 },
  { y: 171, x: 198, width: 92 },
  { y: 191, x: 243, width: 120 },
  { y: 220, x: 308, width: 169 },
  { y: 250, x: 386, width: 242 },
  { y: 325, x: 528, width: 415 },
];

function roadAt(y: number): RoadPoint {
  const last = ROAD_KNOTS.length - 1;
  const clamped = Math.max(ROAD_KNOTS[0].y, Math.min(y, ROAD_KNOTS[last].y));
  let index = 0;
  while (index < last - 1 && ROAD_KNOTS[index + 1].y < clamped) index++;

  const p0 = ROAD_KNOTS[Math.max(0, index - 1)];
  const p1 = ROAD_KNOTS[index];
  const p2 = ROAD_KNOTS[index + 1];
  const p3 = ROAD_KNOTS[Math.min(last, index + 2)];
  const t = (clamped - p1.y) / (p2.y - p1.y);

  const catmull = (a: number, b: number, c: number, d: number) =>
    0.5 * ((2 * b) + (-a + c) * t +
      (2 * a - 5 * b + 4 * c - d) * t * t +
      (-a + 3 * b - 3 * c + d) * t * t * t);

  return {
    y: clamped,
    x: catmull(p0.x, p1.x, p2.x, p3.x),
    width: Math.max(4, catmull(p0.width, p1.width, p2.width, p3.width)),
  };
}

function sampleRoad(start: number, end: number, step = 2): RoadPoint[] {
  const points: RoadPoint[] = [];
  for (let y = start; y < end; y += step) points.push(roadAt(y));
  points.push(roadAt(end));
  return points;
}

function roadRibbon(start: number, end: number, left: number, right: number): string {
  const points = sampleRoad(start, end, 2);
  const x = (point: RoadPoint, ratio: number) => (point.x + point.width * ratio).toFixed(2);
  const y = (point: RoadPoint) => point.y.toFixed(2);
  return (
    "M" + points.map((point) => x(point, left) + " " + y(point)).join("L") +
    "L" + points.slice().reverse().map((point) => x(point, right) + " " + y(point)).join("L") +
    "Z"
  );
}

const ROAD_PATH = roadRibbon(28, 325, -0.5, 0.5);
const SHOULDER_LEFT = roadRibbon(28, 325, -0.5, -0.456);
const SHOULDER_RIGHT = roadRibbon(28, 325, 0.456, 0.5);
const LINE_LEFT = roadRibbon(28, 325, -0.484, -0.464);
const LINE_RIGHT = roadRibbon(28, 325, 0.464, 0.484);
const INNER_GLEAM = roadRibbon(28, 325, -0.447, -0.442);

const MARK_RANGES = [
  [35, 39], [49, 54], [67, 73], [84, 92], [101, 110],
  [121, 133], [143, 155], [166, 183], [199, 219],
  [239, 266], [284, 316],
] as const;
const MARKS = MARK_RANGES.map(([start, end]) =>
  roadRibbon(start, end, -0.018, 0.018),
);

export default function AccountRoadAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const uniqueId = useId().replace(/:/g, "");

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => { node.dataset.visible = String(entry?.isIntersecting ?? true); },
      { threshold: 0.05 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const setPointer = (x: number, y: number) => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      rootRef.current?.style.setProperty("--pa-road-shift-x", x.toFixed(2) + "px");
      rootRef.current?.style.setProperty("--pa-road-shift-y", y.toFixed(2) + "px");
      frameRef.current = null;
    });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 9;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
    setPointer(x, y);
  };

  const url = (name: string) => "url(#" + uniqueId + "-" + name + ")";

  return (
    <div
      ref={rootRef}
      className="pa-road"
      aria-hidden="true"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setPointer(0, 0)}
    >
      <svg
        className="pa-road__svg"
        viewBox="0 0 500 300"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <defs>
          <linearGradient id={uniqueId + "-asphalt"} x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#292a2b" />
            <stop offset="47%" stopColor="#343435" />
            <stop offset="80%" stopColor="#303032" />
            <stop offset="100%" stopColor="#252527" />
          </linearGradient>
          <linearGradient id={uniqueId + "-stripe"} x1="0%" y1="0%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#a46b2d" />
            <stop offset="38%" stopColor="#d79843" />
            <stop offset="64%" stopColor="#f2b352" />
            <stop offset="100%" stopColor="#c58531" />
          </linearGradient>
          <linearGradient id={uniqueId + "-edge"} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a2a09d" />
            <stop offset="35%" stopColor="#f5eee2" />
            <stop offset="100%" stopColor="#dfd6c7" />
          </linearGradient>
          <radialGradient id={uniqueId + "-ambient"} cx="60%" cy="88%" r="65%">
            <stop offset="0%" stopColor="#b28a57" stopOpacity=".12" />
            <stop offset="70%" stopColor="#8b693c" stopOpacity=".028" />
            <stop offset="100%" stopColor="#090909" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="332" cy="234" rx="284" ry="190" fill={url("ambient")} />
        <g className="pa-road__parallax">
          <g className="pa-road__landscape">
            <path d={ROAD_PATH} fill="#080807" stroke="#080807" strokeWidth="8" />
            <path d={ROAD_PATH} fill={url("asphalt")} />
            <path d={SHOULDER_LEFT} fill="#161719" opacity=".9" />
            <path d={SHOULDER_RIGHT} fill="#171819" opacity=".85" />

            <path d={LINE_LEFT} fill={url("edge")} />
            <path d={LINE_RIGHT} fill={url("edge")} />

            <path className="pa-road__inside-glint" d={INNER_GLEAM} fill="#d8bb8c" opacity=".17" />

            {MARKS.map((path, index) => (
              <path
                key={index}
                className="pa-road__mark"
                d={path}
                fill={url("stripe")}
                style={{ animationDelay: String(index * -0.48) + "s" }}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
