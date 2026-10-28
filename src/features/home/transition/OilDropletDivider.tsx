import type { CSSProperties } from "react";
import "./OilDropletDivider.css";

type OilDropletDividerProps = {
  reducedMotion?: boolean;
};

// Deterministic variations keep the row organic without hydration mismatches.
const DROPLETS = Array.from({ length: 55 }, (_, index) => ({
  index,
  width: 12 + ((index * 13 + 7) % 12),
  offset: ((index * 17 + 5) % 17) - 8,
  duration: 3.8 + ((index * 11) % 13) * 0.23,
  delay: -((index * 7) % 31) * 0.27,
  opacity: 0.64 + ((index * 19) % 7) * 0.045,
  isSmall: index % 7 === 2 || index % 11 === 5,
}));

const DROP_PATH =
  "M18 2.8C16.5 7.3 13.8 12.4 10.5 17.8C7.7 22.5 5.8 26.9 5.8 32.1C5.8 39.6 11.3 45.6 18 45.6C24.7 45.6 30.2 39.6 30.2 32.1C30.2 26.9 28.3 22.5 25.5 17.8C22.2 12.4 19.5 7.3 18 2.8Z";

export default function OilDropletDivider({
  reducedMotion = false,
}: OilDropletDividerProps) {
  return (
    <div
      className="petrolero-oil-divider"
      data-reduced-motion={reducedMotion}
      aria-hidden="true"
    >
      <div className="petrolero-oil-divider__row">
        {DROPLETS.map((drop) => {
          const bodyId = `petrolero-divider-body-${drop.index}`;
          const glossId = `petrolero-divider-gloss-${drop.index}`;
          const lightId = `petrolero-divider-light-${drop.index}`;

          const variables = {
            "--drop-width": `${drop.width * (drop.isSmall ? 0.74 : 1)}px`,
            "--drop-offset": `${drop.offset}px`,
            "--drop-duration": `${drop.duration}s`,
            "--drop-delay": `${drop.delay}s`,
            "--drop-opacity": drop.opacity,
          } as CSSProperties;

          return (
            <span
              className="petrolero-oil-divider__cell"
              key={drop.index}
              style={variables}
            >
              <svg
                className="petrolero-oil-divider__drop"
                viewBox="0 0 36 50"
                xmlns="http://www.w3.org/2000/svg"
                focusable="false"
              >
                <defs>
                  <linearGradient id={bodyId} x1="2%" y1="8%" x2="96%" y2="94%">
                    <stop offset="0%" stopColor="#ffdf9f" />
                    <stop offset="16%" stopColor="#bc7c31" />
                    <stop offset="36%" stopColor="#3a2210" />
                    <stop offset="56%" stopColor="#e1a854" />
                    <stop offset="76%" stopColor="#7c4a20" />
                    <stop offset="100%" stopColor="#160e09" />
                  </linearGradient>
                  <linearGradient id={glossId} x1="0%" y1="0%" x2="85%" y2="100%">
                    <stop offset="0%" stopColor="#fff3d8" stopOpacity=".94" />
                    <stop offset="34%" stopColor="#ffe0a5" stopOpacity=".37" />
                    <stop offset="66%" stopColor="#d78f3f" stopOpacity="0" />
                    <stop offset="100%" stopColor="#f8cb7f" stopOpacity=".42" />
                  </linearGradient>
                  <radialGradient id={lightId} cx="37%" cy="29%" r="65%">
                    <stop offset="0%" stopColor="#fff5df" stopOpacity=".94" />
                    <stop offset="42%" stopColor="#d99c4c" stopOpacity=".39" />
                    <stop offset="100%" stopColor="#c1853f" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <path
                  d={DROP_PATH}
                  fill={`url(#${bodyId})`}
                  stroke="#d6a364"
                  strokeWidth=".75"
                  strokeOpacity=".86"
                />
                <path d={DROP_PATH} fill={`url(#${lightId})`} opacity=".62" />
                <path
                  className="petrolero-oil-divider__gloss"
                  d="M17.9 7.2C14.1 16.6 9.5 23.3 9.5 31.3C9.5 36.9 12.7 40.2 15.2 40.7C12.1 35 13 28.9 16.2 22.5C18 18.9 19.7 13.8 17.9 7.2Z"
                  fill={`url(#${glossId})`}
                />
                <path
                  d="M22.5 36.5C20.9 39.7 18.8 41.3 16.5 41.1"
                  stroke="#ffdfa2"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeOpacity=".62"
                  fill="none"
                />
                <ellipse
                  className="petrolero-oil-divider__glint"
                  cx="13.2"
                  cy="26"
                  rx="2.2"
                  ry="4.9"
                  transform="rotate(23 13.2 26)"
                  fill="#fff0ce"
                  opacity=".7"
                />
              </svg>
            </span>
          );
        })}
      </div>
    </div>
  );
}
