"use client";

import { useId } from "react";
import type { SVGProps } from "react";
import "./FuelEconomyIcon.css";

export type FuelEconomyIconProps = SVGProps<SVGSVGElement> & {
  /** Turn off the independent animations, e.g. outside the viewport. */
  animated?: boolean;
  /** Accessible name for this icon. */
  title?: string;
};

const RINGS = [
  "M120 19 138 30 138 51 120 62 102 51 102 30Z",
  "M52 76 70 87 70 108 52 119 34 108 34 87Z",
  "M188 76 206 87 206 108 188 119 170 108 170 87Z",
  "M54 146 72 157 72 178 54 189 36 178 36 157Z",
  "M186 146 204 157 204 178 186 189 168 178 168 157Z",
  "M120 178 138 189 138 210 120 221 102 210 102 189Z",
] as const;

export default function FuelEconomyIcon({
  animated = true,
  title = "Снижение расхода топлива",
  className = "",
  ...svgProps
}: FuelEconomyIconProps) {
  const id = useId().replace(/:/g, "");
  const goldId = `petrolero-fuel-gold-${id}`;
  const glowId = `petrolero-fuel-glow-${id}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 240"
      width="220"
      height="220"
      fill="none"
      role="img"
      aria-label={title}
      className={`petrolero-fuel-icon ${animated ? "petrolero-fuel-icon--animated" : ""} ${className}`.trim()}
      {...svgProps}
    >
      <defs>
        <linearGradient id={goldId} x1="22" y1="22" x2="219" y2="214" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1C5" />
          <stop offset=".24" stopColor="#C89949" />
          <stop offset=".53" stopColor="#F6D98C" />
          <stop offset=".79" stopColor="#8F5B25" />
          <stop offset="1" stopColor="#E8BA6F" />
        </linearGradient>
        <linearGradient id={glowId} x1="91" y1="76" x2="144" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8DEA8" stopOpacity=".16" />
          <stop offset="1" stopColor="#CC8E33" stopOpacity=".035" />
        </linearGradient>
      </defs>

      {/* Polygonal molecule: rigid engineering lines, no rounded shield. */}
      <g className="petrolero-fuel__network" stroke={`url(#${goldId})`} strokeLinejoin="bevel">
        <path
          className="petrolero-fuel__bond petrolero-fuel__bond--1"
          d="M120 62V81"
          strokeWidth="2.7"
        />
        <path
          className="petrolero-fuel__bond petrolero-fuel__bond--2"
          d="M92 103 70 97"
          strokeWidth="2.7"
        />
        <path
          className="petrolero-fuel__bond petrolero-fuel__bond--3"
          d="M148 103 170 97"
          strokeWidth="2.7"
        />
        <path
          className="petrolero-fuel__bond petrolero-fuel__bond--4"
          d="M92 134 72 157"
          strokeWidth="2.7"
        />
        <path
          className="petrolero-fuel__bond petrolero-fuel__bond--5"
          d="M148 134 168 157"
          strokeWidth="2.7"
        />
        <path
          className="petrolero-fuel__bond petrolero-fuel__bond--6"
          d="M120 160V178"
          strokeWidth="2.7"
        />

        {RINGS.map((path, index) => (
          <path
            key={path}
            d={path}
            className={`petrolero-fuel__ring petrolero-fuel__ring--${index + 1}`}
            strokeWidth="3.1"
          />
        ))}
      </g>

      {/* Main molecule contains an oil drop, drawn from vector paths. */}
      <path
        d="M120 78 153 97V135L120 154 87 135V97Z"
        fill={`url(#${glowId})`}
        stroke={`url(#${goldId})`}
        strokeWidth="3.5"
        strokeLinejoin="bevel"
        className="petrolero-fuel__core"
      />
      <path
        d="M120 94C116 102 104 114 104 123C104 132 111 139 120 139C129 139 136 132 136 123C136 114 124 102 120 94Z"
        stroke={`url(#${goldId})`}
        strokeWidth="3.8"
        strokeLinejoin="bevel"
        className="petrolero-fuel__drop"
      />
      <path
        d="M113 123C113 128 115 130 119 131"
        stroke="#FFF1C5"
        strokeWidth="2.2"
        strokeLinecap="square"
        className="petrolero-fuel__reflection"
      />

      {/* Small downward fuel-use indicator, deliberately subordinate. */}
      <g className="petrolero-fuel__indicator" stroke={`url(#${goldId})`} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M208 190V213" />
        <path d="m198 203 10 10 10-10" />
      </g>
    </svg>
  );
}
