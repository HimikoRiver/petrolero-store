"use client";

import Link from "next/link";
import Image from "next/image";
import useFavoriteProducts from "@/features/favorites/useFavoriteProducts";
import { CATALOG_PRODUCTS } from "@/features/catalog/data/catalogData";
import AccountIcon from "./AccountIcon";

export default function AccountFavorites({ preview = false }: { preview?: boolean }) {
  const {
    favoriteIds,
    favoritesReady,
    favoritesSaving,
    favoritesError,
    toggleFavoriteId,
    retryFavorites,
  } = useFavoriteProducts(preview);

  const favorites = CATALOG_PRODUCTS.filter((product) =>
    product.published && favoriteIds.includes(product.id),
  );

  if (!favoritesReady) {
    return (
      <div className="pa-favorites">
        <p className="pa-muted" role="status">
          {favoritesError || "Загружаем ваше избранное…"}
        </p>
        {favoritesError && (
          <button className="pa-button pa-button--outline petrolero-store-button"
            type="button" onClick={retryFavorites}>
            Повторить загрузку
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {!preview && (
        <p className="pa-favorites-sync-note">
          <AccountIcon name="heart" size={16} />
          Сохранённые товары синхронизируются между устройствами в вашем аккаунте.
        </p>
      )}

      {favoritesError && (
        <p role="alert" className="pa-favorites-error">
          {favoritesError}
          <button type="button" onClick={retryFavorites}>Обновить список</button>
        </p>
      )}

      {!favorites.length ? (
        <div className="pa-empty">
          <div className="pa-empty__icon"><AccountIcon name="heart" size={34} /></div>
          <h3>Здесь пока нет товаров</h3>
          <p>Отмечайте понравившиеся масла и присадки сердцем в каталоге. Они появятся в этом списке.</p>
          <Link href="/catalog" className="pa-button pa-button--gold petrolero-store-button">
            Перейти в каталог <AccountIcon name="arrow" size={17} />
          </Link>
        </div>
      ) : (
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
                onClick={() => { void toggleFavoriteId(product.id); }}
                disabled={favoritesSaving}
                aria-label={"Убрать из избранного: " + product.title}
              >
                {favoritesSaving ? "Сохранение…" : "Удалить"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
