import Image from "next/image";
import "../styles/roadVisual.css";

/**
 * Road landscape fades into the account welcome itself rather than sitting
 * inside a separate framed image. Purely decorative and non-interactive.
 */
export default function AccountRoadVisual() {
  return (
    <div className="pa-road-visual" aria-hidden="true">
      <Image
        className="pa-road-visual__image"
        src="/catalog/fon2.webp"
        alt=""
        fill
        sizes="(max-width: 650px) 100vw, (max-width: 1199px) 80vw, 65vw"
        quality={85}
      />
    </div>
  );
}
