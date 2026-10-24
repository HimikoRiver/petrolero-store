"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "./SteelSection.css";

type SteelSectionProps = {
  reducedMotion: boolean;
};

const VEHICLE_LOADS = [
  {
    id: "cars",
    type: "ЛЕГКОВЫЕ",
    title: "ЧАСТЫЕ ОСТАНОВКИ И ЗАПУСКИ",
    image: "/home/images/cards/1.webp",
    detail: "Городской режим, частые пуски и перепады температур.",
    icon: "/home/images/icons/petrolero-gold-icon-1.webp",
    alt: "Легковой автомобиль в плотном ночном потоке на мокрой дороге",
  },
  {
    id: "moto",
    type: "МОТО",
    title: "ВЫСОКИЕ ОБОРОТЫ",
    image: "/home/images/cards/2.webp",
    detail: "Повышенные обороты и интенсивный нагрев двигателя.",
    icon: "/home/images/icons/petrolero-gold-icon-2.webp",
    alt: "Мотоциклист проходит поворот горной дороги",
  },
  {
    id: "trucks",
    type: "ГРУЗОВЫЕ",
    title: "ДЛИТЕЛЬНЫЕ НАГРУЗКИ",
    image: "/home/images/cards/3.webp",
    detail: "Тяжёлый груз, высокое давление и длительные пробеги.",
    icon: "/home/images/icons/petrolero-gold-icon-3.webp",
    alt: "Тяжёлый грузовик преодолевает горный подъём",
  },
] as const;

/** A monochrome visual explanation of the loads engines experience. */
export default function SteelSection({ reducedMotion }: SteelSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="petrolero-steel"
      aria-labelledby="petrolero-steel-heading"
      data-visible={visible || reducedMotion}
    >
      <div className="petrolero-steel-layout">
        <div className="petrolero-steel-copy">
          <h2 id="petrolero-steel-heading" className="petrolero-steel-title">
            <strong>МЕТАЛЛ</strong>
            <span>ПОД <em>НАГРУЗКОЙ</em></span>
          </h2>
          <div className="petrolero-steel-description">
            <p>
              Когда двигатель работает, его детали постоянно испытывают экстремальные условия:
              <span> высокое давление, сильный нагрев и постоянное трение.</span>
              <br />Нагрузка зависит от типа техники и условий эксплуатации.
            </p>
            <p>
              Моторное масло должно сохранять защитную плёнку между движущимися поверхностями,
              помогая <span>уменьшать трение и износ.</span> Поэтому важно учитывать
              требования двигателя и условия, в которых он работает.
            </p>
          </div>
        </div>

        <div className="petrolero-steel-cards" aria-label="Нагрузки на разные виды техники">
          {VEHICLE_LOADS.map((vehicle) => (
            <article key={vehicle.id} className="petrolero-steel-card">
              <Image
                className="petrolero-steel-card-image"
                src={vehicle.image}
                alt={vehicle.alt}
                width={680}
                height={768}
                sizes="(max-width: 700px) 90vw, (max-width: 1024px) 30vw, 340px"
                loading="lazy"
              />
              <div className="petrolero-steel-card-copy">
                <div className="petrolero-steel-card-icon" aria-hidden="true">
                  <Image src={vehicle.icon} alt="" width={724} height={480} sizes="96px" />
                </div>
                <p className="petrolero-steel-card-type">{vehicle.type}</p>
                <h3 className="petrolero-steel-card-title">{vehicle.title}</h3>
                <p className="petrolero-steel-card-detail">{vehicle.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
