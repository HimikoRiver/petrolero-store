"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATALOG_PRODUCTS } from "@/features/catalog/data/catalogData";
import AccountIcon from "./AccountIcon";

const STORAGE_KEY = "petrolero-demo-favorites";

function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export default function AccountFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[] | null>(null);

  useEffect(() => {
      setFavoriteIds(readFavorites());
  }, []);

  const favorites = CATALOG_PRODUCTS.filter((product) =>
    product.published && favoriteIds?.includes(product.id),
  );

  const remove = (id: string) => {
    const next = (favoriteIds || []).filter((item) => item !== id);
    setFavoriteIds(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Local storage can be disabled; the visible selection still updates.
    }
  };

  if (favoriteIds === null) {
    return <p className="pa-muted" role="status">Загрузка сохранённых товаров…</p>;
  }

  if (!favorites.length) {
    return (
      <div className="pa-empty">
        <div className="pa-empty__icon"><AccountIcon name="heart" size={34} /></div>
        <h3>Здесь пока нет товаров</h3>
        <p>Отмечайте понравившиеся масла и присадки сердцем в каталоге. Они появятся в этом списке.</p>
        <Link href="/catalog" className="pa-button pa-button--gold petrolero-store-button">
          Перейти в каталог <AccountIcon name="arrow" size={17} />
        </Link>
      </div>
    );
  }

  return (
    <div className="pa-favorites">
      {favorites.map((product) => (
        <article className="pa-favorite" key={product.id}>
          <div className="pa-favorite__visual">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 550px) 112px, 160px"
                className="pa-favorite__image"
              />
            ) : <AccountIcon name="bag" size={30} />}
          </div>
          <div className="pa-favorite__info">
            <span className="pa-kicker">АРТ. {product.sku}</span>
            <h3>{product.title}</h3>
          </div>
          <button
            type="button"
            className="pa-button pa-button--outline petrolero-store-button"
            onClick={() => remove(product.id)}
            aria-label={"Убрать из избранного: " + product.title}
          >
            Удалить
          </button>
        </article>
      ))}
    </div>
  );
}
