export const VEHICLE_TYPES = [
  { id: "cars", number: "01", title: "ЛЕГКОВЫЕ", type: "car" },
  { id: "moto", number: "02", title: "МОТО", type: "moto" },
  { id: "trucks", number: "03", title: "ГРУЗОВЫЕ", type: "truck" },
] as const;

export const ENGINE_NOTES = [
  { id: "protection", title: "Надёжная защита", detail: "двигателя", icon: "shield", side: "left", position: "top", time: 1.5, dotX: 346, dotY: 228, line: "M228 152H266L346 228" },
  { id: "innovation", title: "Инновационные", detail: "формулы", icon: "gear", side: "right", position: "top", time: 3.4, dotX: 850, dotY: 229, line: "M972 152H932L850 229" },
  { id: "efficiency", title: "Максимальная", detail: "эффективность", icon: "gauge", side: "left", position: "bottom", time: 5.3, dotX: 350, dotY: 404, line: "M228 465H266L350 404" },
  { id: "stability", title: "Стабильная работа", detail: "под нагрузкой", icon: "drop", side: "right", position: "bottom", time: 7.2, dotX: 846, dotY: 397, line: "M972 465H934L846 397" },
] as const;
