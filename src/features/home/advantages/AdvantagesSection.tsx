import Image from "next/image";
import { ADVANTAGES } from "./advantages";
import "./AdvantagesSection.css";

export default function AdvantagesSection() {
  return (
    <section
      className="petrolero-advantages"
      aria-labelledby="petrolero-advantages-heading"
    >
      <div className="petrolero-advantages-inner">
        <div className="petrolero-advantages-heading">
          <span className="petrolero-advantages-kicker">
            ИНЖЕНЕРИЯ ЗАЩИТЫ
          </span>
          <h2 id="petrolero-advantages-heading">ПРЕИМУЩЕСТВА</h2>
          <span className="petrolero-advantages-rule" aria-hidden="true" />
        </div>
        <div className="petrolero-advantages-grid">
          {ADVANTAGES.map((advantage) => (
            <article className="petrolero-advantage-card" key={advantage.id}>
              <span className="petrolero-advantage-number" aria-hidden="true">
                {advantage.number}
              </span>
              <div className="petrolero-advantage-icon" aria-hidden="true">
                <Image
                  src={advantage.icon}
                  alt=""
                  width={112}
                  height={112}
                  sizes="(max-width: 600px) 64px, 80px"
                  unoptimized
                />
              </div>
              <div className="petrolero-advantage-text">
                <h3>{advantage.title}</h3>
                <p>{advantage.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
