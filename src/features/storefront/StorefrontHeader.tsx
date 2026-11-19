import Link from "next/link";
import BrandLogo from "@/features/home/header/BrandLogo";
import "./StorefrontHeader.css";

export default function StorefrontHeader() {
  return (
    <header className="petrolero-store-header">
      <div className="petrolero-store-header__inner">
        <Link className="petrolero-store-header__brand" href="/" aria-label="Petrolero — главная">
          <BrandLogo animated={false} variant="gold" />
        </Link>

        <nav className="petrolero-store-header__navigation" aria-label="Навигация магазина">
          <Link href="/">Главная</Link>
          <Link className="petrolero-store-header__active" href="/catalog" aria-current="page">
            Каталог
          </Link>
        </nav>

        <span className="petrolero-store-header__signature" aria-hidden="true">
          PETROLERO <span>/</span> STORE
        </span>
      </div>
    </header>
  );
}
