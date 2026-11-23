import Image from "next/image";
import "../styles/roadVisual.css";

/** Decorative account welcome artwork stored locally (no external image host). */
export default function AccountRoadVisual() {
  return (
    <div className="pa-road-visual" aria-hidden="true">
      <Image
        className="pa-road-visual__image"
        src="/account/road-sunset.webp"
        alt=""
        width={600}
        height={360}
        sizes="(max-width: 650px) 100vw, (max-width: 1199px) 40vw, 480px"
        quality={85}
      />
    </div>
  );
}
