export const VEHICLE_TYPES = [
  { id: "cars", number: "01", title: "ЛЕГКОВЫЕ", type: "car" },
  { id: "moto", number: "02", title: "МОТО", type: "moto" },
  { id: "trucks", number: "03", title: "ГРУЗОВЫЕ", type: "truck" },
] as const;

// Positions use the same coordinate space as EngineAnnotations (1200 × 620).
// Dots sit near the engine's visible oil channels and mechanical assemblies.
export const ENGINE_NOTES = [
  {
    id: "protection", title: "Надёжная защита", detail: "двигателя",
    icon: "shield", side: "left", position: "top", time: 1.5,
    dotX: 344, dotY: 212, line: "M238 158H267L344 212",
  },
  {
    id: "innovation", title: "Инновационные", detail: "формулы",
    icon: "gear", side: "right", position: "top", time: 3.4,
    dotX: 859, dotY: 221, line: "M962 158H934L859 221",
  },
  {
    id: "efficiency", title: "Максимальная", detail: "эффективность",
    icon: "gauge", side: "left", position: "bottom", time: 5.3,
    dotX: 350, dotY: 418, line: "M238 458H273L350 418",
  },
  {
    id: "stability", title: "Стабильная работа", detail: "под нагрузкой",
    icon: "drop", side: "right", position: "bottom", time: 7.2,
    dotX: 857, dotY: 420, line: "M962 458H931L857 420",
  },
] as const;
