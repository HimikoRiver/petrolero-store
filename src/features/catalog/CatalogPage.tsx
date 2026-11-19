"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import SiteFooter from "@/features/home/footer/SiteFooter";
import StorefrontHeader from "@/features/storefront/StorefrontHeader";
import {
  CATALOG_CATEGORIES,
  CATALOG_PRODUCTS,
  type CatalogProduct,
  type CatalogSelection,
} from "./catalogData";
import "./CatalogPage.css";

type SortOrder = "default" | "newest" | "price-asc" | "price-desc";

const SORT_LABELS: { value: SortOrder; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "newest", label: "Сначала новые" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
];

function formatPrice(priceKopecks: number | null): string {
  if (priceKopecks === null) return "Цена уточняется";

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(priceKopecks / 100);
}

function productMatchesSearch(product: CatalogProduct, normalizedSearch: string) {
  if (!normalizedSearch) return true;

  const searchable = [
    product.title,
    product.sku,
    product.description,
    product.viscosity || "",
  ]
    .join(" ")
    .toLocaleLowerCase("ru-RU");

  return searchable.includes(normalizedSearch);
}

function sortProducts(products: readonly CatalogProduct[], sortOrder: SortOrder) {
  const result = [...products];

  if (sortOrder === "newest") {
    result.sort(
      (left, right) =>
        Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
  } else if (sortOrder === "price-asc" || sortOrder === "price-desc") {
    const direction = sortOrder === "price-asc" ? 1 : -1;

    result.sort((left, right) => {
      if (left.priceKopecks === null) return right.priceKopecks === null ? 0 : 1;
      if (right.priceKopecks === null) return -1;
      return (left.priceKopecks - right.priceKopecks) * direction;
    });
  }

  return result;
}

export default function CatalogPage() {
  const [category, setCategory] = useState<CatalogSelection>("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("ru-RU");
    const matches = CATALOG_PRODUCTS.filter(
      (product) =>
        product.published &&
        (category === "all" || product.category === category) &&
        productMatchesSearch(product, normalizedSearch),
    );
    return sortProducts(matches, sortOrder);
  }, [category, search, sortOrder]);

  const hasPublishedProducts = CATALOG_PRODUCTS.some((product) => product.published);
  const activeCategoryTitle =
    category === "all"
      ? "Все товары"
      : CATALOG_CATEGORIES.find((item) => item.id === category)?.title || "Все товары";

  const resetFilters = () => {
    setCategory("all");
    setSearch("");
    setSortOrder("default");
  };

  return (
    <div className="petrolero-catalog">
      <StorefrontHeader />

      <main>
        <section className="petrolero-catalog-hero" aria-labelledby="catalog-title">
          <div className="petrolero-catalog-container petrolero-catalog-hero__inner">
            <nav className="petrolero-catalog-breadcrumbs" aria-label="Навигационная цепочка">
              <Link href="/">Главная</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Каталог</span>
            </nav>

            <div className="petrolero-catalog-hero__content">
              <div>
                <p className="petrolero-catalog-eyebrow">PETROLERO / ПРОДУКЦИЯ</p>
                <h1 id="catalog-title">Каталог<span>.</span></h1>
                <p className="petrolero-catalog-hero__description">
                  Моторные масла и присадки для разных условий эксплуатации.
                  Выберите категорию, чтобы перейти к продукции.
                </p>
              </div>
              <div className="petrolero-catalog-hero__graphic" aria-hidden="true">
                <div className="petrolero-catalog-hero__orb petrolero-catalog-hero__orb--outer" />
                <div className="petrolero-catalog-hero__orb petrolero-catalog-hero__orb--middle" />
                <div className="petrolero-catalog-hero__orb petrolero-catalog-hero__orb--inner" />
                <span className="petrolero-catalog-hero__graphic-label">P / 01</span>
              </div>
            </div>
            <div className="petrolero-catalog-hero__meta" aria-hidden="true">
              <span>МАСЛА / ПРИСАДКИ</span>
              <span>01 — 04</span>
            </div>
          </div>
        </section>

        <section className="petrolero-catalog-categories" aria-labelledby="catalog-categories-title">
          <div className="petrolero-catalog-container">
            <div className="petrolero-catalog-section-head">
              <div>
                <p className="petrolero-catalog-eyebrow">01 / НАПРАВЛЕНИЯ</p>
                <h2 id="catalog-categories-title">Выберите категорию</h2>
              </div>
              <p>Четыре направления продукции Petrolero</p>
            </div>

            <div className="petrolero-catalog-category-grid">
              {CATALOG_CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    "petrolero-catalog-category" +
                    (category === item.id ? " petrolero-catalog-category--active" : "")
                  }
                  onClick={() => {
                    setCategory(item.id);
                    document.getElementById("catalog-products")?.scrollIntoView({
                      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                        ? "instant"
                        : "smooth",
                      block: "start",
                    });
                  }}
                  aria-pressed={category === item.id}
                  aria-label={"Показать: " + item.title}
                >
                  <span className="petrolero-catalog-category__number">{item.index} / 04</span>
                  <span className="petrolero-catalog-category__image">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      width={640}
                      height={490}
                      sizes="(max-width: 580px) 100vw, (max-width: 950px) 50vw, 25vw"
                    />
                  </span>
                  <span className="petrolero-catalog-category__bottom">
                    <strong>{item.title}</strong>
                    <span aria-hidden="true">↗</span>
                  </span>
                  <span className="petrolero-catalog-category__description">{item.description}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          className="petrolero-catalog-products"
          id="catalog-products"
          aria-labelledby="catalog-products-title"
        >
          <div className="petrolero-catalog-container">
            <div className="petrolero-catalog-section-head petrolero-catalog-section-head--products">
              <div>
                <p className="petrolero-catalog-eyebrow">02 / АССОРТИМЕНТ</p>
                <h2 id="catalog-products-title">{activeCategoryTitle}</h2>
              </div>
              <p>{visibleProducts.length} товаров</p>
            </div>

            <div className="petrolero-catalog-controls">
              <div className="petrolero-catalog-filters" role="group" aria-label="Категории товаров">
                <button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"}>
                  Все
                </button>
                {CATALOG_CATEGORIES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    aria-pressed={category === item.id}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              <div className="petrolero-catalog-control-fields">
                <label className="petrolero-catalog-search">
                  <span className="sr-only">Поиск по каталогу</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <circle cx="10" cy="10" r="6.5" />
                    <path d="m15 15 6 6" />
                  </svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Название, артикул, вязкость"
                  />
                </label>

                <label className="petrolero-catalog-sort">
                  <span className="sr-only">Сортировка товаров</span>
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  >
                    {SORT_LABELS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {visibleProducts.length > 0 ? (
              <div className="petrolero-catalog-product-grid">
                {visibleProducts.map((product) => (
                  <article className="petrolero-catalog-product" key={product.id}>
                    <div className="petrolero-catalog-product__image">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={480}
                          height={520}
                          sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 25vw"
                        />
                      ) : (
                        <span className="petrolero-catalog-product__no-image" aria-hidden="true">
                          PETROLERO
                        </span>
                      )}
                    </div>
                    <div className="petrolero-catalog-product__body">
                      <span className="petrolero-catalog-product__sku">АРТ. {product.sku}</span>
                      <h3>{product.title}</h3>
                      <span className="petrolero-catalog-product__price">
                        {formatPrice(product.priceKopecks)}
                      </span>
                      <span className="petrolero-catalog-product__stock">
                        {product.stockQuantity > 0 ? "В наличии" : "Нет в наличии"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="petrolero-catalog-empty" role="status">
                <span className="petrolero-catalog-empty__index" aria-hidden="true">P / 00</span>
                <div className="petrolero-catalog-empty__symbol" aria-hidden="true">P</div>
                <h3>
                  {hasPublishedProducts
                    ? "Ничего не найдено"
                    : "Каталог готовится к запуску"}
                </h3>
                <p>
                  {hasPublishedProducts
                    ? "Попробуйте изменить поисковый запрос или выбрать другую категорию."
                    : "Скоро здесь появятся моторные масла и присадки Petrolero."}
                </p>
                {(category !== "all" || search || sortOrder !== "default") && (
                  <button type="button" onClick={resetFilters}>
                    Сбросить фильтры <span aria-hidden="true">↗</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="petrolero-catalog-bottom">
          <div className="petrolero-catalog-container petrolero-catalog-bottom__inner">
            <p>Petrolero</p>
            <span>Формула надёжности</span>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
