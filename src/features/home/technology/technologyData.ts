export const VEHICLE_TYPES = [
  { id: "cars", number: "01", title: "ЛЕГКОВЫЕ", type: "car" },
  { id: "moto", number: "02", title: "МОТО", type: "moto" },
  { id: "trucks", number: "03", title: "ГРУЗОВЫЕ", type: "truck" },
] as const;

// The 1200x675 SVG matches the 16:9 video. Anchor endpoints are editable
// independently; these are visual placements based on the engine reference.
// Connection endpoints now align with the new transparent engine video.
export const ENGINE_NOTES = [
  {
    id: "protection", title: "Надёжная защита", detail: "двигателя",
    icon: "shield", side: "left", position: "top", time: 1.5,
    dotX: 355, dotY: 234, line: "M128 202H270L355 234", compactLine: "M248 202H282L355 234",
  },
{
  id: "innovation",
  title: "Инновационные",
  detail: "формулы",
  icon: "gear",
  side: "right",
  position: "top",
  time: 3.4,
  dotX: 690,
  dotY: 240,
  line: "M1074 202H940L690 240",
  compactLine: "M956 202H925L690 240",
},
  {
    id: "efficiency", title: "Максимальная", detail: "эффективность",
    icon: "gauge", side: "left", position: "bottom", time: 5.3,
    dotX: 407, dotY: 552, line: "M170 500H310L407 552", compactLine: "M248 500H320L407 552",
  },
{
  id: "stability",
  title: "Стабильная работа",
  detail: "под нагрузкой",
  icon: "drop",
  side: "right",
  position: "bottom",
  time: 7.2,
  dotX: 846,
  dotY: 486,
  line: "M1060 494H945L846 486",
  compactLine: "M956 500H920L846 486",
},
] as const;
