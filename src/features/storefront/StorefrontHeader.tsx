"use client";

import Link from "next/link";
import Image from "next/image";
import { AccountIcon, CartIcon, SearchIcon } from "@/features/home/header/HeaderIcons";
import "./StorefrontHeader.css";

type StorefrontHeaderProps = {
  search: string;
  onSearchChange: (search: string) => void;
  cartCount: number;
  onCartClick: () => void;
  onAccountClick: () => void;
};

export default function StorefrontHeader({
  search,
  onSearchChange,
  cartCount,
  onCartClick,
  onAccountClick,
}: StorefrontHeaderProps) {
  return (
    <header className="petrolero-shop-header">
      <div className="petrolero-shop-header__inner">
        <Link className="petrolero-shop-header__logo" href="/" aria-label="Petrolero — главная">
          <Image src="/home/images/petrolero-logo.svg" alt="Petrolero" width={132} height={55} unoptimized />
        </Link>
        <nav className="petrolero-shop-header__nav" aria-label="Разделы магазина">
          <Link href="/">Главная</Link>
          <Link href="/catalog" aria-current="page">Каталог</Link>
        </nav>
        <label className="petrolero-shop-header__search">
          <span className="sr-only">Поиск по товарам</span>
          <input
            type="search"
            placeholder="Найти масло или присадку"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <SearchIcon />
        </label>
        <nav className="petrolero-shop-header__actions" aria-label="Действия покупателя">
          <button type="button" onClick={onAccountClick} aria-label="Войти в аккаунт">
            <AccountIcon />
            <span>Войти</span>
          </button>
          <button type="button" onClick={onCartClick} aria-label={"Корзина, товаров: " + cartCount}>
            <span className="petrolero-shop-header__cart-icon">
              <CartIcon />
              {cartCount > 0 && <span className="petrolero-shop-header__counter">{cartCount}</span>}
            </span>
            <span>Корзина</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
