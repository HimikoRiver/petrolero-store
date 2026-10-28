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

// The footer PETROLERO wordmark uses deterministic dark/gold metallic flecks.
// Reuse its palette and grain technique at droplet scale rather than a glossy lens.
function createMetalGrain() {
  let seed = 26371;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const dark: string[] = [];
  const light: string[] = [];

  for (let i = 0; i < 160; i++) {
    const x = (random() * 36).toFixed(2);
    const y = (random() * 50).toFixed(2);
    const size = 0.24 + random() * (i % 13 === 0 ? 1.1 : 0.65);
    const w = size.toFixed(2);
    const h = (size * (0.65 + random() * 0.65)).toFixed(2);
    const fleck = `M${x} ${y}h${w}v${h}h-${w}Z`;
    (random() > 0.35 ? dark : light).push(fleck);
  }

  return { dark: dark.join(""), light: light.join("") };
}

const METAL_GRAIN = createMetalGrain();

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
          const goldId = `petrolero-divider-gold-${drop.index}`;
          const grainId = `petrolero-divider-grain-${drop.index}`;

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
                  <linearGradient id={goldId} x1="0%" y1="0%" x2="16%" y2="100%">
                    <stop offset="0%" stopColor="#ffe0a0" />
                    <stop offset="24%" stopColor="#e4b96f" />
                    <stop offset="55%" stopColor="#bc8643" />
                    <stop offset="82%" stopColor="#e2ad65" />
                    <stop offset="100%" stopColor="#92602a" />
                  </linearGradient>
                  <pattern
                    id={grainId}
                    patternUnits="userSpaceOnUse"
                    width="36"
                    height="50"
                  >
                    <path d={METAL_GRAIN.dark} fill="#140c04" opacity=".96" />
                    <path d={METAL_GRAIN.light} fill="#ffdfa0" opacity=".68" />
                  </pattern>
                </defs>

                <path
                  d={DROP_PATH}
                  fill={`url(#${goldId})`}
                  stroke="#b58447"
                  strokeWidth=".6"
                  strokeOpacity=".6"
                />
                <path
                  d={DROP_PATH}
                  fill={`url(#${grainId})`}
                  opacity=".9"
                />
                <path
                  d="M11.5 26C13.8 20.4 16 16.2 17.7 10.3M9.6 31.7C9.6 35.7 11.3 38.8 14.1 40.7"
                  fill="none"
                  stroke="#ffe0a0"
                  strokeWidth=".85"
                  strokeLinecap="round"
                  strokeOpacity=".36"
                />
              </svg>
            </span>
          );
        })}
      </div>
    </div>
  );
}
