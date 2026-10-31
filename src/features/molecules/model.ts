export type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
};

export type PointerPosition = {
  x: number;
  y: number;
  active: boolean;
};

export const clamp = (
  value: number,
  min: number,
  max: number
) => Math.min(max, Math.max(min, value));

export const bottles = [
  {
    src: "/molecules/images/performance-1.webp",
    alt: "Petrolero Performance 1",
    variant: "left-big",
    float: "a",
  },
  {
    src: "/molecules/images/extra-life-2.webp",
    alt: "Petrolero Extra Life 2",
    variant: "left-top",
    float: "b",
  },
  {
    src: "/molecules/images/turbo-boost-3.webp",
    alt: "Petrolero Turbo Boost 3",
    variant: "center-small",
    float: "c",
  },
  {
    src: "/molecules/images/caremaker-5.webp",
    alt: "Petrolero Caremaker 5",
    variant: "right-center",
    float: "d",
  },
  {
    src: "/molecules/images/full-throttle-6.webp",
    alt: "Petrolero Full Throttle 6",
    variant: "right-big",
    float: "e",
  },
] as const;

