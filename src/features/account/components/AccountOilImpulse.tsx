"use client";

import { useEffect, useId, useRef, type PointerEvent } from "react";
import "../styles/oilImpulse.css";

/**
 * Oil-surface scene for the account welcome. Animated with CSS/SVG only:
 * no external assets, WebGL context or per-frame React re-renders.
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

    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      rootRef.current?.style.setProperty("--pa-oil-x", (x * 9).toFixed(1) + "px");
      rootRef.current?.style.setProperty("--pa-oil-y", (y * 5).toFixed(1) + "px");
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

  const haloId = id + "-halo";
  const surfaceId = id + "-surface";
  const metalId = id + "-metal";
  const dropId = id + "-drop";
  const lightId = id + "-light";

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
        viewBox="0 0 420 270"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id={haloId} cx="50%" cy="57%" r="50%">
            <stop offset="0%" stopColor="#b18145" stopOpacity=".22" />
            <stop offset="45%" stopColor="#8b5927" stopOpacity=".075" />
            <stop offset="100%" stopColor="#090909" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={surfaceId} cx="48%" cy="40%" r="61%">
            <stop offset="0%" stopColor="#513a23" stopOpacity=".7" />
            <stop offset="30%" stopColor="#27231d" stopOpacity=".86" />
            <stop offset="69%" stopColor="#121211" />
            <stop offset="100%" stopColor="#070808" />
          </radialGradient>
          <linearGradient id={metalId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5f3b1a" stopOpacity=".03" />
            <stop offset="22%" stopColor="#a87940" stopOpacity=".46" />
            <stop offset="42%" stopColor="#f1c886" stopOpacity=".96" />
            <stop offset="53%" stopColor="#fff0c2" />
            <stop offset="67%" stopColor="#c78c43" stopOpacity=".86" />
            <stop offset="100%" stopColor="#593916" stopOpacity=".04" />
          </linearGradient>
          <linearGradient id={dropId} x1="2%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#21160d" />
            <stop offset="18%" stopColor="#70451e" />
            <stop offset="42%" stopColor="#e4a85b" />
            <stop offset="58%" stopColor="#fff0bb" />
            <stop offset="75%" stopColor="#b87530" />
            <stop offset="100%" stopColor="#33200f" />
          </linearGradient>
          <linearGradient id={lightId} x1="0%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#ffedd0" stopOpacity=".92" />
            <stop offset="100%" stopColor="#d99746" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className="pa-oil-impulse__scene">
          <ellipse cx="210" cy="173" rx="188" ry="101" fill={"url(#" + haloId + ")"} />
          <ellipse
            className="pa-oil-impulse__surface"
            cx="210" cy="201" rx="172" ry="38"
            fill={"url(#" + surfaceId + ")"}
            stroke="#957047" strokeOpacity=".28" strokeWidth=".75"
          />
          <path
            d="M58 195C118 171 167 174 206 185C253 198 316 177 366 197"
            fill="none" stroke={"url(#" + metalId + ")"}
            strokeWidth="1.1" opacity=".42"
          />
          <path
            d="M79 213C141 229 271 231 347 211"
            fill="none" stroke={"url(#" + metalId + ")"}
            strokeWidth="1" opacity=".25"
          />
          <g className="pa-oil-impulse__waves" fill="none" stroke={"url(#" + metalId + ")"}>
            <ellipse className="pa-oil-impulse__wave pa-oil-impulse__wave--1" cx="210" cy="199" rx="24" ry="5.5" strokeWidth="1.6" />
            <ellipse className="pa-oil-impulse__wave pa-oil-impulse__wave--2" cx="210" cy="199" rx="24" ry="5.5" strokeWidth="1.25" />
            <ellipse className="pa-oil-impulse__wave pa-oil-impulse__wave--3" cx="210" cy="199" rx="24" ry="5.5" strokeWidth="1.4" />
            <ellipse className="pa-oil-impulse__wave pa-oil-impulse__wave--4" cx="210" cy="199" rx="24" ry="5.5" strokeWidth="1" />
          </g>
          <ellipse className="pa-oil-impulse__impact" cx="210" cy="194" rx="32" ry="8" fill="#090909" opacity=".6" />
          <ellipse className="pa-oil-impulse__impact-glow" cx="210" cy="194" rx="22" ry="5" fill="#bb8744" opacity=".25" />
          <g className="pa-oil-impulse__drop">
            <path
              d="M210 88C207 113 184 138 184 159C184 175 195 185 210 185C225 185 236 175 236 159C236 138 213 112 210 88Z"
              fill={"url(#" + dropId + ")"}
              stroke="#e5af69" strokeWidth=".55" strokeOpacity=".55"
            />
            <path
              d="M204 118C201 130 194 144 194 156C194 165 199 173 204 177"
              fill="none" stroke={"url(#" + lightId + ")"}
              strokeWidth="3" strokeLinecap="round"
            />
            <path
              d="M212 103C213 123 223 144 225 158"
              fill="none" stroke="#fff5d7" strokeWidth=".8"
              strokeLinecap="round" opacity=".48"
            />
          </g>
          <ellipse
            className="pa-oil-impulse__contact-ring"
            cx="210" cy="197" rx="26" ry="6"
            fill="none" stroke={"url(#" + metalId + ")"} strokeWidth="1.7"
          />
          <path
            className="pa-oil-impulse__lightline"
            d="M128 205C151 210 170 211 191 209"
            fill="none" stroke={"url(#" + metalId + ")"}
            strokeWidth="1.35" strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
