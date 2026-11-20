"use client";

import { HeartIcon, CompareIcon } from "./CatalogIcons";
import ProductGallery from "./ProductGallery";
import { priceLabel } from "../lib/catalogUtils";
import type { CatalogProduct } from "../data/catalogData";

export default function CatalogProductCard({
  product,
  onPreview,
  onAdd,
  isFavorite,
  isCompared,
  onFavorite,
  onCompare,
}: {
  product: CatalogProduct;
  onPreview: (product: CatalogProduct) => void;
  onAdd: (product: CatalogProduct) => void;
  isFavorite: boolean;
  isCompared: boolean;
  onFavorite: (product: CatalogProduct) => void;
  onCompare: (product: CatalogProduct) => void;
}) {
  return (
    <article className="petrolero-catalog-item">
      <div className="petrolero-catalog-item__media">
        <span className="petrolero-catalog-item__demo">ДЕМО</span>
        <ProductGallery
          image={product.image}
          gallery={product.gallery}
          title={product.title}
        />
        <button
          className="petrolero-catalog-item__quick"
          type="button"
          onClick={() => onPreview(product)}
        >
          Быстрый просмотр
        </button>
      </div>

      <div className="petrolero-catalog-item__body">
        <p className="petrolero-catalog-item__sku">АРТ. {product.sku}</p>
        <button
          className="petrolero-catalog-item__name"
          type="button"
          onClick={() => onPreview(product)}
        >
          {product.title}
        </button>
        <div className="petrolero-catalog-item__properties">
          {product.viscosity && <span>SAE {product.viscosity}</span>}
          {product.volumeLiters && <span>{product.volumeLiters < 1 ? product.volumeLiters * 1000 + " мл" : product.volumeLiters + " л"}</span>}
        </div>
        <div className="petrolero-catalog-item__bottom">
          <div className="petrolero-catalog-item__price">
            <strong>{priceLabel(product.priceKopecks)}</strong>
            <span>Тестовая цена</span>
          </div>
          <div className="petrolero-catalog-item__actions">
            <button type="button" className="petrolero-catalog-add petrolero-catalog-liquid-button"
              onClick={() => onAdd(product)} aria-label={"Добавить в корзину: " + product.title}>
              <span>В корзину</span>
            </button>
            <button type="button" className="petrolero-catalog-item__action-icon"
              aria-label={(isFavorite ? "Убрать из избранного: " : "В избранное: ") + product.title}
              title={isFavorite ? "Убрать из избранного" : "В избранное"}
              aria-pressed={isFavorite}
              onClick={() => onFavorite(product)}>
              <HeartIcon filled={isFavorite} />
            </button>
            <button type="button" className="petrolero-catalog-item__action-icon"
              aria-label={(isCompared ? "Убрать из сравнения: " : "Сравнить: ") + product.title}
              title={isCompared ? "Убрать из сравнения" : "Сравнить"}
              aria-pressed={isCompared}
              onClick={() => onCompare(product)}>
              <CompareIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

