"use client";

import { useEffect, useId, useRef, type PointerEvent } from "react";
import "../styles/oilImpulse.css";

/**
 * Close-up of dark oil catching narrow moving gold reflections.
 * SVG and CSS only: no external image, heavy WebGL scene or render loop.
 */
export default function AccountOilImpulse() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const element = rootRef.current;
    if (!element || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        element.dataset.visible = String(entry?.isIntersecting ?? true);
      },
      { threshold: 0.05 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      rootRef.current?.style.setProperty("--pa-oil-x", (x * 5).toFixed(1) + "px");
      rootRef.current?.style.setProperty("--pa-oil-y", (y * 3).toFixed(1) + "px");
      frameRef.current = null;
    });
  };

  const onPointerLeave = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      rootRef.current?.style.setProperty("--pa-oil-x", "0px");
      rootRef.current?.style.setProperty("--pa-oil-y", "0px");
      frameRef.current = null;
    });
  };

  const ambient = id + "-ambient";
  const depth = id + "-depth";
  const metal = id + "-metal";
  const reflected = id + "-reflected";
  const ripple = id + "-ripple";
  const bloom = id + "-bloom";
  const soften = id + "-soften";

  return (
    <div
      ref={rootRef}
      className="pa-oil-impulse"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-hidden="true"
    >
      <svg
        className="pa-oil-impulse__svg"
        viewBox="0 0 450 260"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <defs>
          <radialGradient id={ambient} cx="50%" cy="65%" r="64%">
            <stop offset="0%" stopColor="#7d512c" stopOpacity=".14" />
            <stop offset="50%" stopColor="#4a321f" stopOpacity=".055" />
            <stop offset="100%" stopColor="#0e0d0c" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={depth} x1="0" y1="0" x2="0.65" y2="1">
            <stop offset="0%" stopColor="#281c13" stopOpacity="0" />
            <stop offset="22%" stopColor="#221b15" stopOpacity=".34" />
            <stop offset="54%" stopColor="#141312" stopOpacity=".48" />
            <stop offset="86%" stopColor="#0d0d0d" stopOpacity=".18" />
            <stop offset="100%" stopColor="#0b0b0b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={metal} x1="0" y1="0" x2="1" y2=".12">
            <stop offset="0%" stopColor="#8a5b33" stopOpacity="0" />
            <stop offset="18%" stopColor="#a67540" stopOpacity=".2" />
            <stop offset="36%" stopColor="#f0c483" stopOpacity=".72" />
            <stop offset="45%" stopColor="#fff0c9" stopOpacity=".9" />
            <stop offset="58%" stopColor="#c18b4c" stopOpacity=".68" />
            <stop offset="82%" stopColor="#bb864b" stopOpacity=".2" />
            <stop offset="100%" stopColor="#7a4b26" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={reflected} x1=".05" y1="0" x2=".94" y2=".24">
            <stop offset="0%" stopColor="#9a6e3b" stopOpacity="0" />
            <stop offset="25%" stopColor="#d6a665" stopOpacity=".29" />
            <stop offset="46%" stopColor="#f8dba0" stopOpacity=".8" />
            <stop offset="60%" stopColor="#dfab6e" stopOpacity=".32" />
            <stop offset="100%" stopColor="#b27e43" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={ripple} x1="0" y1="0" x2="1" y2=".1">
            <stop offset="0%" stopColor="#b17a39" stopOpacity=".03" />
            <stop offset="30%" stopColor="#d3a36b" stopOpacity=".52" />
            <stop offset="54%" stopColor="#ffe0aa" stopOpacity=".85" />
            <stop offset="76%" stopColor="#b57c40" stopOpacity=".35" />
            <stop offset="100%" stopColor="#a16b37" stopOpacity=".02" />
          </linearGradient>
          <filter id={bloom} x="-30%" y="-170%" width="160%" height="440%">
            <feGaussianBlur stdDeviation="5.2" />
          </filter>
          <filter id={soften} x="-25%" y="-120%" width="150%" height="340%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        <g className="pa-oil-impulse__scene">
          <rect width="450" height="260" fill={"url(#" + ambient + ")"} />

          <g className="pa-oil-impulse__surface">
            <path
              d="M-25 179C62 156 103 190 175 175C230 163 274 158 326 171C379 185 412 168 481 153L481 264H-25Z"
              fill={"url(#" + depth + ")"}
            />
            <path
              d="M-19 174C62 152 118 185 171 174C222 164 265 156 317 169C373 184 418 164 471 157"
              fill="none" stroke={"url(#" + metal + ")"}
              strokeWidth="6" opacity=".16" filter={"url(#" + bloom + ")"}
            />
            <path
              className="pa-oil-impulse__sweep pa-oil-impulse__sweep--a"
              d="M-19 174C62 152 118 185 171 174C222 164 265 156 317 169C373 184 418 164 471 157"
              fill="none" stroke={"url(#" + metal + ")"}
              strokeWidth="1.55" strokeLinecap="round" opacity=".72"
            />
            <path
              className="pa-oil-impulse__sweep pa-oil-impulse__sweep--b"
              d="M-12 198C57 188 112 212 169 197C215 186 261 184 310 194C380 209 407 188 464 181"
              fill="none" stroke={"url(#" + reflected + ")"}
              strokeWidth="1.1" strokeLinecap="round" opacity=".54"
            />
            <path
              d="M3 217C76 227 129 222 174 211C230 198 272 203 325 215C372 225 427 215 463 205"
              fill="none" stroke={"url(#" + metal + ")"}
              strokeWidth="5" opacity=".18" filter={"url(#" + soften + ")"}
            />
            <path
              className="pa-oil-impulse__sweep pa-oil-impulse__sweep--c"
              d="M3 217C76 227 129 222 174 211C230 198 272 203 325 215C372 225 427 215 463 205"
              fill="none" stroke={"url(#" + metal + ")"}
              strokeWidth=".85" opacity=".34"
            />
            <path
              d="M20 229C92 235 142 220 200 221C258 222 326 242 417 221"
              fill="none" stroke={"url(#" + reflected + ")"}
              strokeWidth=".8" opacity=".18"
            />
          </g>

          <g className="pa-oil-impulse__ripples" fill="none" stroke={"url(#" + ripple + ")"}>
            <ellipse className="pa-oil-impulse__wave pa-oil-impulse__wave--1"
              cx="228" cy="179" rx="32" ry="7.2" strokeWidth="1.35" />
            <ellipse className="pa-oil-impulse__wave pa-oil-impulse__wave--2"
              cx="228" cy="179" rx="32" ry="7.2" strokeWidth="1.1" />
            <ellipse className="pa-oil-impulse__wave pa-oil-impulse__wave--3"
              cx="228" cy="179" rx="32" ry="7.2" strokeWidth=".9" />
          </g>
          <path
            className="pa-oil-impulse__highlight"
            d="M186 178C208 174 219 173 234 175C253 178 264 181 284 177"
            fill="none" stroke={"url(#" + metal + ")"}
            strokeWidth="1.25" strokeLinecap="round"
          />
          <ellipse className="pa-oil-impulse__glint"
            cx="229" cy="176" rx="11" ry="2"
            fill="#e8bd78" opacity=".28"
            filter={"url(#" + soften + ")"}
          />
        </g>
      </svg>
    </div>
  );
}
