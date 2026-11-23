"use client";

import { useEffect, useId, useRef, type CSSProperties, type PointerEvent } from "react";
import "../styles/oilImpulse.css";

type BubbleVariant = "glass" | "smoke" | "chrome" | "amber";

type Bubble = {
  x: number;
  y: number;
  diameter: number;
  variant: BubbleVariant;
  duration: number;
  delay: number;
  travelX: number;
  travelY: number;
  opacity?: number;
};

/** Stable positioning prevents layout shifts and hydration inconsistencies. */
const BUBBLES: readonly Bubble[] = [
  { x: 51,  y: 69,  diameter: 31, variant: "glass",  duration: 12.1, delay: -2.0, travelX: 8,   travelY: -12 },
  { x: 121, y: 104, diameter: 73, variant: "smoke",  duration: 15.4, delay: -8.0, travelX: -9,  travelY: 16 },
  { x: 207, y: 55,  diameter: 49, variant: "glass",  duration: 11.9, delay: -4.4, travelX: 8,   travelY: -10 },
  { x: 283, y: 94,  diameter: 93, variant: "chrome", duration: 17.3, delay: -9.3, travelX: -10, travelY: 12 },
  { x: 387, y: 58,  diameter: 46, variant: "smoke",  duration: 13.8, delay: -3.6, travelX: -7,  travelY: 12 },
  { x: 450, y: 110, diameter: 58, variant: "glass",  duration: 15.8, delay: -6.5, travelX: -10, travelY: -12 },
  { x: 62,  y: 186, diameter: 43, variant: "glass",  duration: 13.7, delay: -7.3, travelX: 13,  travelY: 11 },
  { x: 153, y: 196, diameter: 62, variant: "chrome", duration: 16.0, delay: -1.7, travelX: -6,  travelY: -13 },
  { x: 198, y: 129, diameter: 36, variant: "amber",  duration: 10.8, delay: -2.5, travelX: 10,  travelY: -9 },
  { x: 354, y: 177, diameter: 76, variant: "amber",  duration: 15.5, delay: -6.3, travelX: 12,  travelY: -10 },
  { x: 256, y: 221, diameter: 44, variant: "glass",  duration: 12.3, delay: -4.9, travelX: -9,  travelY: 11 },
  { x: 446, y: 234, diameter: 56, variant: "smoke",  duration: 16.6, delay: -8.4, travelX: 8,   travelY: -14 },
  { x: 326, y: 23,  diameter: 26, variant: "glass",  duration: 11.7, delay: -5.1, travelX: 6,   travelY: 7 },
  { x: 95,  y: 247, diameter: 25, variant: "amber",  duration: 10.9, delay: -4.5, travelX: 6,   travelY: -10 },
  { x: 389, y: 266, diameter: 32, variant: "glass",  duration: 12.6, delay: -9.4, travelX: -11, travelY: -9 },
  { x: 236, y: 169, diameter: 30, variant: "smoke",  duration: 12.9, delay: -1.2, travelX: 7,   travelY: 10 },
];

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
      rootRef.current?.style.setProperty("--pa-bubbles-x", (x * 7).toFixed(1) + "px");
      rootRef.current?.style.setProperty("--pa-bubbles-y", (y * 5).toFixed(1) + "px");
      frameRef.current = null;
    });
  };

  const onPointerLeave = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      rootRef.current?.style.setProperty("--pa-bubbles-x", "0px");
      rootRef.current?.style.setProperty("--pa-bubbles-y", "0px");
      frameRef.current = null;
    });
  };

  const gradient = (name: string) => "url(#" + id + "-" + name + ")";

  return (
    <div
      ref={rootRef}
      className="pa-oil-impulse"
      aria-hidden="true"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <svg
        className="pa-oil-impulse__svg"
        viewBox="0 0 500 285"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <defs>
          <radialGradient id={id + "-aura"} cx="54%" cy="49%" r="58%">
            <stop offset="0%" stopColor="#ba8c5b" stopOpacity=".21" />
            <stop offset="58%" stopColor="#9d7448" stopOpacity=".08" />
            <stop offset="100%" stopColor="#17110c" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={id + "-glass"} cx="40%" cy="29%" r="75%" fx="36%" fy="23%">
            <stop offset="0%" stopColor="#f8e0bb" stopOpacity=".24" />
            <stop offset="32%" stopColor="#bfb3a8" stopOpacity=".12" />
            <stop offset="58%" stopColor="#302b29" stopOpacity=".24" />
            <stop offset="80%" stopColor="#d8b68a" stopOpacity=".42" />
            <stop offset="94%" stopColor="#29201a" stopOpacity=".72" />
            <stop offset="100%" stopColor="#cfad7e" stopOpacity=".6" />
          </radialGradient>

          <radialGradient id={id + "-smoke"} cx="32%" cy="22%" r="85%" fx="22%" fy="12%">
            <stop offset="0%" stopColor="#eed9ba" stopOpacity=".57" />
            <stop offset="18%" stopColor="#99928c" stopOpacity=".88" />
            <stop offset="37%" stopColor="#363433" stopOpacity=".98" />
            <stop offset="63%" stopColor="#131313" stopOpacity=".99" />
            <stop offset="83%" stopColor="#4d4035" stopOpacity=".96" />
            <stop offset="96%" stopColor="#d3a877" stopOpacity=".8" />
            <stop offset="100%" stopColor="#33291f" stopOpacity=".88" />
          </radialGradient>

          <radialGradient id={id + "-chrome"} cx="44%" cy="23%" r="87%" fx="40%" fy="19%">
            <stop offset="0%" stopColor="#ffefd2" stopOpacity=".78" />
            <stop offset="19%" stopColor="#a9a7a1" stopOpacity=".94" />
            <stop offset="34%" stopColor="#3e3b38" />
            <stop offset="59%" stopColor="#101011" />
            <stop offset="77%" stopColor="#75624e" />
            <stop offset="92%" stopColor="#dfb78d" />
            <stop offset="100%" stopColor="#27221e" />
          </radialGradient>

          <radialGradient id={id + "-amber"} cx="41%" cy="27%" r="84%" fx="34%" fy="16%">
            <stop offset="0%" stopColor="#fff0ca" stopOpacity=".69" />
            <stop offset="24%" stopColor="#cdb58e" stopOpacity=".58" />
            <stop offset="49%" stopColor="#4d3627" stopOpacity=".86" />
            <stop offset="75%" stopColor="#1d1715" stopOpacity=".98" />
            <stop offset="94%" stopColor="#a47746" stopOpacity=".91" />
            <stop offset="100%" stopColor="#2b211b" />
          </radialGradient>

          <linearGradient id={id + "-rim"} x1="0%" y1="0%" x2="100%" y2="95%">
            <stop offset="0%" stopColor="#fff2d7" stopOpacity=".75" />
            <stop offset="28%" stopColor="#e4c8a2" stopOpacity=".2" />
            <stop offset="55%" stopColor="#171414" stopOpacity=".11" />
            <stop offset="80%" stopColor="#a47e52" stopOpacity=".68" />
            <stop offset="100%" stopColor="#f0d1a4" stopOpacity=".36" />
          </linearGradient>

          <linearGradient id={id + "-mirror"} x1="0%" y1="0%" x2="42%" y2="100%">
            <stop offset="0%" stopColor="#d9b48a" stopOpacity="0" />
            <stop offset="35%" stopColor="#e7ddce" stopOpacity=".14" />
            <stop offset="49%" stopColor="#fff3dd" stopOpacity=".62" />
            <stop offset="58%" stopColor="#ab7f57" stopOpacity=".37" />
            <stop offset="100%" stopColor="#31231a" stopOpacity="0" />
          </linearGradient>

          <radialGradient id={id + "-gleam"} cx="50%" cy="48%" r="60%">
            <stop offset="0%" stopColor="#fff9e9" stopOpacity=".95" />
            <stop offset="55%" stopColor="#f4e4c6" stopOpacity=".41" />
            <stop offset="100%" stopColor="#fff1d7" stopOpacity="0" />
          </radialGradient>

          <clipPath id={id + "-clip"}>
            <circle r="48.5" />
          </clipPath>
        </defs>

        <g className="pa-oil-impulse__scene">
          <ellipse cx="256" cy="152" rx="252" ry="150" fill={gradient("aura")} />

          {BUBBLES.map((bubble, index) => {
            const isGlass = bubble.variant === "glass";
            const isChrome = bubble.variant === "chrome";
            const bubbleStyle = {
              "--pa-bubble-duration": bubble.duration + "s",
              "--pa-bubble-delay": bubble.delay + "s",
              "--pa-bubble-travel-x": bubble.travelX + "px",
              "--pa-bubble-travel-y": bubble.travelY + "px",
            } as CSSProperties;

            return (
              <g
                key={index}
                transform={"translate(" + bubble.x + " " + bubble.y + ") scale(" + bubble.diameter / 100 + ")"}
              >
                <g className="pa-oil-impulse__bubble" style={bubbleStyle}>
                  <circle r="49" fill={gradient(bubble.variant)} opacity={bubble.opacity ?? 1} />

                  <g clipPath={gradient("clip")}>
                    <path
                      d="M-61 -15C-30 -35 4 -18 14 -23C32 -32 51 -28 61 -8L61 11C32 -8 13 1 -8 10C-28 18 -41 7 -61 12Z"
                      fill={gradient("mirror")}
                      opacity={isGlass ? .35 : .6}
                    />
                    <path
                      d="M-52 25C-20 9 2 26 20 15C36 6 52 12 58 17L58 37C30 27 13 37 -5 34C-31 30 -43 38 -52 36Z"
                      fill={gradient("mirror")}
                      opacity={isGlass ? .13 : isChrome ? .54 : .29}
                    />
                    {!isGlass && (
                      <ellipse
                        cx="10" cy="37" rx="43" ry="10"
                        fill="#e6b47e" opacity={isChrome ? .15 : .09}
                        transform="rotate(-9 10 37)"
                      />
                    )}
                    <ellipse
                      cx="-18" cy="-31" rx="21" ry="7.5"
                      fill={gradient("gleam")}
                      transform="rotate(-25 -18 -31)"
                      opacity={isGlass ? .52 : .77}
                    />
                  </g>

                  <circle
                    r="48.6"
                    fill="none"
                    stroke={gradient("rim")}
                    strokeWidth={isGlass ? "1.3" : "1.1"}
                    opacity={isGlass ? .92 : .82}
                  />
                  <path
                    d="M-38 -11C-43 -25 -29 -42 -11 -46"
                    fill="none" stroke="#fff4e0"
                    strokeWidth={isGlass ? "1.8" : "2.8"}
                    strokeLinecap="round"
                    opacity={isGlass ? .31 : .56}
                  />
                  <path
                    d="M14 45C26 43 38 31 43 18"
                    fill="none" stroke="#f3c58d"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    opacity={isGlass ? .17 : .42}
                  />
                  <ellipse
                    cx="-29" cy="-28" rx="7" ry="3.2"
                    fill="#fff6e7" opacity={isGlass ? .25 : .55}
                    transform="rotate(-34 -29 -28)"
                  />
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
