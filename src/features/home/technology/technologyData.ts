export const VEHICLE_TYPES = [
  { id: "cars", number: "01", title: "ЛЕГКОВЫЕ", type: "car" },
  { id: "moto", number: "02", title: "МОТО", type: "moto" },
  { id: "trucks", number: "03", title: "ГРУЗОВЫЕ", type: "truck" },
] as const;

// The 1200x675 SVG matches the 16:9 video. Anchor endpoints are editable
// independently; these are visual placements based on the engine reference.
// Left/right labels sit at x≈5% / 82%, dots terminate on the engine itself.
export const ENGINE_NOTES = [
  {
    id: "protection", title: "Надёжная защита", detail: "двигателя",
    icon: "shield", side: "left", position: "top", time: 1.5,
    dotX: 385, dotY: 250, line: "M128 202H260L385 250", compactLine: "M248 202H282L375 248",
  },
{
  id: "innovation",
  title: "Инновационные",
  detail: "формулы",
  icon: "gear",
  side: "right",
  position: "top",
  time: 3.4,
  dotX: 740,
  dotY: 224,
  line: "M1074 202H900L740 224",
  compactLine: "M956 202H933L893 269",
},
  {
    id: "efficiency", title: "Максимальная", detail: "эффективность",
    icon: "gauge", side: "left", position: "bottom", time: 5.3,
    dotX: 445, dotY: 466, line: "M170 500H290L445 466", compactLine: "M248 500H306L470 452",
  },
{
  id: "stability",
  title: "Стабильная работа",
  detail: "под нагрузкой",
  icon: "drop",
  side: "right",
  position: "bottom",
  time: 7.2,
  dotX: 958,
  dotY: 410,
  line: "M1060 494H996L958 410",
  compactLine: "M956 500H926L833 452",
},
] as const;
