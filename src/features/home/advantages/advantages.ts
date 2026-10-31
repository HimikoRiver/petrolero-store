export type Advantage = {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
};

// Images are user-provided WebP files kept in public/home/images/icons/.
// Their filenames do not determine the reading order: each image is explicitly
// paired with the benefit it illustrates.
export const ADVANTAGES: readonly Advantage[] = [
  {
    id: "fuel-economy",
    number: "01",
    title: "Снижение расхода топлива",
    description: "Эстеровая синтетическая основа.",
    icon: "/home/images/icons/ico1.webp",
  },
  {
    id: "anti-wear",
    number: "02",
    title: "Защита от износа",
    description: "Современные противоизносные компоненты.",
    icon: "/home/images/icons/ico7.webp",
  },
  {
    id: "fuel-quality",
    number: "03",
    title: "Защита при некачественном топливе",
    description: "Помощь в борьбе с нежелательными отложениями.",
    icon: "/home/images/icons/ico6.webp",
  },
  {
    id: "oil-film",
    number: "04",
    title: "Прочная масляная плёнка",
    description: "Защитный слой в нагруженных парах трения.",
    icon: "/home/images/icons/ico5.webp",
  },
  {
    id: "cold-start",
    number: "05",
    title: "Лёгкий запуск в холод",
    description: "Смазка и защита при изменении температуры.",
    icon: "/home/images/icons/ico4.webp",
  },
  {
    id: "smooth-engine",
    number: "06",
    title: "Ровная работа двигателя",
    description: "Органический молибден помогает снижать трение.",
    icon: "/home/images/icons/ico3.webp",
  },
  {
    id: "engine-cleanliness",
    number: "07",
    title: "Чистота деталей двигателя",
    description: "Контроль нагара и угара масла.",
    icon: "/home/images/icons/ico2.webp",
  },
];
