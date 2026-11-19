"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import SiteFooter from "@/features/home/footer/SiteFooter";
import StorefrontHeader from "@/features/storefront/StorefrontHeader";
import {
  CATALOG_CATEGORIES,
  CATALOG_PRODUCTS,
  type CatalogProduct,
  type ProductCategory,
  type ProductPackaging,
} from "./catalogData";
import "./CatalogPage.css";

type Department = "oils" | "additives";
type OilCategory = "all" | Exclude<ProductCategory, "additives">;
type SortOrder = "default" | "newest" | "price-asc" | "price-desc";
type FilterKey = "viscosity" | "acea" | "api" | "approvals" | "ilsac";
type FilterSelections = Record<FilterKey, string[]>;
type CartLine = { id: string; quantity: number };

const FILTERS: readonly { key: FilterKey; label: string }[] = [
  { key: "viscosity", label: "Вязкость, SAE" },
  { key: "acea", label: "ACEA" },
  { key: "api", label: "API" },
  { key: "approvals", label: "Одобрения" },
  { key: "ilsac", label: "ILSAC" },
];

const EMPTY_FILTERS: FilterSelections = {
  viscosity: [], acea: [], api: [], approvals: [], ilsac: [],
};

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "newest", label: "Сначала новые" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
];

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency", currency: "RUB", maximumFractionDigits: 0,
});

function priceLabel(kopecks: number | null) {
  return kopecks === null ? "Цена уточняется" : currency.format(kopecks / 100);
}

function filterValues(product: CatalogProduct, key: FilterKey): string[] {
  return key === "viscosity"
    ? (product.viscosity ? [product.viscosity] : [])
    : product[key];
}

function ProductVisual({
  packaging,
  title,
  viscosity,
  compact = false,
}: {
  packaging: ProductPackaging;
  title: string;
  viscosity?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={"petrolero-product-visual petrolero-product-visual--" + packaging +
        (compact ? " petrolero-product-visual--compact" : "")}
      role="img"
      aria-label={"Демонстрационная упаковка " + title}
    >
      <div className="petrolero-product-visual__shadow" />
      <div className="petrolero-product-visual__pack">
        {packaging !== "drum" && (
          <div className="petrolero-product-visual__neck" aria-hidden="true" />
        )}
        <div className="petrolero-product-visual__rim" aria-hidden="true" />
        <div className="petrolero-product-visual__ribs" aria-hidden="true" />
        <div className="petrolero-product-visual__label">
          <span className="petrolero-product-visual__brand">petrolero</span>
          <span className="petrolero-product-visual__spec">
            {viscosity || "ADDITIVE"}
          </span>
        </div>
        <div className="petrolero-product-visual__base" aria-hidden="true" />
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onPreview,
  onAdd,
}: {
  product: CatalogProduct;
  onPreview: (product: CatalogProduct) => void;
  onAdd: (product: CatalogProduct) => void;
}) {
  return (
    <article className="petrolero-catalog-item">
      <div className="petrolero-catalog-item__media">
        <span className="petrolero-catalog-item__demo">ДЕМО</span>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            width={520}
            height={580}
            sizes="(max-width: 650px) 100vw, (max-width: 1050px) 50vw, 33vw"
          />
        ) : (
          <ProductVisual
            packaging={product.packaging}
            title={product.title}
            viscosity={product.viscosity}
          />
        )}
        <button
          className="petrolero-catalog-item__quick"
          type="button"
          onClick={() => onPreview(product)}
        >
          Быстрый просмотр
        </button>
      </div>

      <div className="petrolero-catalog-item__body">
        <p className="petrolero-catalog-item__sku">{product.sku} / ТЕСТ</p>
        <button
          className="petrolero-catalog-item__name"
          type="button"
          onClick={() => onPreview(product)}
        >
          {product.title}
        </button>
        <div className="petrolero-catalog-item__properties">
          {product.viscosity && <span>SAE {product.viscosity}</span>}
          {product.volumeLiters && <span>{product.volumeLiters * 1000 < 1000 ? product.volumeLiters * 1000 + " мл" : product.volumeLiters + " л"}</span>}
        </div>
        <div className="petrolero-catalog-item__bottom">
          <div>
            <strong>{priceLabel(product.priceKopecks)}</strong>
            <span>Тестовая цена</span>
          </div>
          <button type="button" onClick={() => onAdd(product)} aria-label={"Добавить в корзину: " + product.title}>
            В корзину <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CatalogPage() {
  const [department, setDepartment] = useState<Department>("oils");
  const [category, setCategory] = useState<OilCategory>("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [selectedFilters, setSelectedFilters] = useState<FilterSelections>(EMPTY_FILTERS);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [preview, setPreview] = useState<CatalogProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("petrolero-demo-cart") || "[]") as unknown;
      if (Array.isArray(saved)) {
        const valid = saved.filter((item): item is CartLine =>
          Boolean(item) &&
          typeof item === "object" &&
          "id" in item &&
          "quantity" in item &&
          typeof item.id === "string" &&
          typeof item.quantity === "number" &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          CATALOG_PRODUCTS.some((product) => product.id === item.id),
        );
        setCartLines(valid);
      }
    } catch {
      // Invalid or unavailable localStorage; use an empty demo cart.
    }
    setCartHydrated(true);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem("petrolero-demo-cart", JSON.stringify(cartLines));
    } catch {
      // This demo remains usable when storage is restricted.
    }
  }, [cartLines, cartHydrated]);

  useEffect(() => {
    if (!openFilter) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !filtersRef.current?.contains(event.target)) {
        setOpenFilter(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenFilter(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openFilter]);

  useEffect(() => {
    if (!preview && !cartOpen && !accountOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreview(null);
        setCartOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [preview, cartOpen, accountOpen]);

  const scopedProducts = useMemo(
    () => CATALOG_PRODUCTS.filter((product) =>
      product.published &&
      (department === "additives"
        ? product.category === "additives"
        : product.category !== "additives" && (category === "all" || product.category === category)),
    ),
    [department, category],
  );

  const filterOptions = useMemo(() => {
    const entries = FILTERS.map(({ key }) => [
      key,
      [...new Set(scopedProducts.flatMap((product) => filterValues(product, key)))].sort(
        (a, b) => a.localeCompare(b, "ru", { numeric: true }),
      ),
    ]);
    return Object.fromEntries(entries) as Record<FilterKey, string[]>;
  }, [scopedProducts]);

  const products = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("ru");
    const filtered = scopedProducts.filter((product) => {
      if (normalizedSearch && ![
        product.title, product.sku, product.description, product.viscosity || "",
      ].join(" ").toLocaleLowerCase("ru").includes(normalizedSearch)) return false;

      const price = product.priceKopecks === null ? null : product.priceKopecks / 100;
      const from = minPrice === "" ? null : Number(minPrice);
      const to = maxPrice === "" ? null : Number(maxPrice);
      if (from !== null && (price === null || price < from)) return false;
      if (to !== null && (price === null || price > to)) return false;

      return FILTERS.every(({ key }) =>
        selectedFilters[key].length === 0 ||
        selectedFilters[key].some((value) => filterValues(product, key).includes(value)),
      );
    });

    if (sortOrder === "newest") {
      filtered.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    } else if (sortOrder.startsWith("price-")) {
      const direction = sortOrder === "price-asc" ? 1 : -1;
      filtered.sort((a, b) => {
        if (a.priceKopecks === null) return 1;
        if (b.priceKopecks === null) return -1;
        return (a.priceKopecks - b.priceKopecks) * direction;
      });
    }
    return filtered;
  }, [scopedProducts, search, minPrice, maxPrice, selectedFilters, sortOrder]);

  const filterCount = Object.values(selectedFilters).reduce((total, selected) => total + selected.length, 0)
    + Number(Boolean(minPrice || maxPrice));
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cartLines.reduce((sum, line) => {
    const product = CATALOG_PRODUCTS.find((item) => item.id === line.id);
    return sum + (product?.priceKopecks || 0) * line.quantity;
  }, 0);

  const resetFilters = () => {
    setSelectedFilters(EMPTY_FILTERS);
    setMinPrice("");
    setMaxPrice("");
    setOpenFilter(null);
  };

  const changeDepartment = (value: Department) => {
    setDepartment(value);
    setCategory("all");
    resetFilters();
  };

  const changeCategory = (value: OilCategory) => {
    setCategory(value);
    resetFilters();
  };

  const toggleValue = (key: FilterKey, value: string) => {
    setSelectedFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((selected) => selected !== value)
        : [...current[key], value],
    }));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartLines((current) => {
      const existing = current.find((line) => line.id === id);
      if (!existing) return delta > 0 ? [...current, { id, quantity: delta }] : current;
      return current
        .map((line) => line.id === id ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line)
        .filter((line) => line.quantity > 0);
    });
  };

  const addToCart = (product: CatalogProduct) => {
    updateQuantity(product.id, 1);
    setFeedback("Добавлено в демонстрационную корзину");
  };

  const heading = department === "additives"
    ? "ПРИСАДКИ"
    : category === "all"
      ? "МОТОРНЫЕ МАСЛА"
      : CATALOG_CATEGORIES.find((item) => item.id === category)?.title.toLocaleUpperCase("ru-RU")
        || "МОТОРНЫЕ МАСЛА";

  const closeLayers = () => {
    setPreview(null);
    setCartOpen(false);
    setAccountOpen(false);
  };

  return (
    <div className="petrolero-catalog-page">
      <StorefrontHeader
        search={search}
        onSearchChange={setSearch}
        cartCount={cartCount}
        onCartClick={() => { closeLayers(); setCartOpen(true); }}
        onAccountClick={() => { closeLayers(); setAccountOpen(true); }}
      />

      <main className="petrolero-catalog-main">
        <nav className="petrolero-catalog-breadcrumbs" aria-label="Навигационная цепочка">
          <Link href="/">Главная</Link><span aria-hidden="true">/</span>
          <span>Каталог</span><span aria-hidden="true">/</span>
          <span aria-current="page">{heading.toLocaleLowerCase("ru-RU")}</span>
        </nav>

        <div className="petrolero-catalog-topline">
          <div className="petrolero-catalog-departments" role="group" aria-label="Группа товаров">
            <button aria-pressed={department === "oils"} onClick={() => changeDepartment("oils")} type="button">Моторные масла</button>
            <button aria-pressed={department === "additives"} onClick={() => changeDepartment("additives")} type="button">Присадки</button>
          </div>
          <span className="petrolero-catalog-demo-note">Демонстрационное наполнение · цены тестовые</span>
        </div>

        <h1>{heading}</h1>

        {department === "oils" && (
          <div className="petrolero-catalog-subcategories" aria-label="Категории моторных масел">
            {CATALOG_CATEGORIES.map((item, index) => (
              <button
                className="petrolero-catalog-subcategory"
                data-active={category === item.id}
                type="button"
                onClick={() => changeCategory(category === item.id ? "all" : item.id)}
                aria-pressed={category === item.id}
                key={item.id}
              >
                <ProductVisual
                  packaging={index === 1 ? "canister" : "drum"}
                  title={item.title}
                  compact
                />
                <span>{item.title}</span>
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M4 10h12M11 5l5 5-5 5" />
                </svg>
              </button>
            ))}
          </div>
        )}

        <div className="petrolero-catalog-toolbar" ref={filtersRef}>
          <div className="petrolero-catalog-filter-buttons" role="group" aria-label="Фильтры товаров">
            <div className="petrolero-catalog-filter">
              <button
                type="button"
                aria-expanded={openFilter === "price"}
                onClick={() => setOpenFilter(openFilter === "price" ? null : "price")}
                className={minPrice || maxPrice ? "is-active" : ""}
              >Цена <span aria-hidden="true">⌄</span></button>
              {openFilter === "price" && (
                <div className="petrolero-catalog-dropdown petrolero-catalog-dropdown--price">
                  <p>Стоимость, ₽</p>
                  <div className="petrolero-catalog-price-fields">
                    <label>От
                      <input
                        type="number" min="0" step="1" inputMode="numeric"
                        value={minPrice} placeholder="0"
                        onChange={(event) => setMinPrice(event.target.value)}
                      />
                    </label>
                    <label>До
                      <input
                        type="number" min="0" step="1" inputMode="numeric"
                        value={maxPrice} placeholder="Любая"
                        onChange={(event) => setMaxPrice(event.target.value)}
                      />
                    </label>
                  </div>
                  <button className="petrolero-catalog-dropdown__done" type="button" onClick={() => setOpenFilter(null)}>
                    Применить
                  </button>
                </div>
              )}
            </div>

            {department === "oils" && FILTERS.map(({ key, label }) => (
              <div className="petrolero-catalog-filter" key={key}>
                <button
                  type="button"
                  className={selectedFilters[key].length ? "is-active" : ""}
                  aria-expanded={openFilter === key}
                  onClick={() => setOpenFilter(openFilter === key ? null : key)}
                >
                  {label}
                  {selectedFilters[key].length > 0 && <span className="petrolero-catalog-filter__count">{selectedFilters[key].length}</span>}
                  <span aria-hidden="true">⌄</span>
                </button>
                {openFilter === key && (
                  <div className="petrolero-catalog-dropdown">
                    <p>{label}</p>
                    <div className="petrolero-catalog-dropdown__options">
                      {filterOptions[key].length ? filterOptions[key].map((value) => (
                        <label key={value}>
                          <input
                            type="checkbox"
                            checked={selectedFilters[key].includes(value)}
                            onChange={() => toggleValue(key, value)}
                          />
                          <span>{value}</span>
                        </label>
                      )) : <span className="petrolero-catalog-dropdown__empty">Нет параметров</span>}
                    </div>
                    <button className="petrolero-catalog-dropdown__done" type="button" onClick={() => setOpenFilter(null)}>
                      Показать товары
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filterCount > 0 && <button type="button" className="petrolero-catalog-reset" onClick={resetFilters}>Очистить фильтр ×</button>}
          </div>

          <div className="petrolero-catalog-toolbar__bottom">
            <span className="petrolero-catalog-results">{products.length} товаров</span>
            <div className="petrolero-catalog-sort-view">
              <label>
                <span className="sr-only">Сортировка каталога</span>
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                  {SORT_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <div className="petrolero-catalog-view-buttons" role="group" aria-label="Вид списка товаров">
                <button type="button" aria-label="Плитка" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="17" height="17" aria-hidden="true">
                    <rect x="2" y="2" width="4" height="4"/><rect x="8" y="2" width="4" height="4"/><rect x="14" y="2" width="4" height="4"/>
                    <rect x="2" y="8" width="4" height="4"/><rect x="8" y="8" width="4" height="4"/><rect x="14" y="8" width="4" height="4"/>
                    <rect x="2" y="14" width="4" height="4"/><rect x="8" y="14" width="4" height="4"/><rect x="14" y="14" width="4" height="4"/>
                  </svg>
                </button>
                <button type="button" aria-label="Список" aria-pressed={view === "list"} onClick={() => setView("list")}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="17" height="17" aria-hidden="true">
                    <rect x="2" y="3" width="3" height="3"/><rect x="7" y="4" width="11" height="1.5"/>
                    <rect x="2" y="9" width="3" height="3"/><rect x="7" y="10" width="11" height="1.5"/>
                    <rect x="2" y="15" width="3" height="3"/><rect x="7" y="16" width="11" height="1.5"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="petrolero-catalog-items" data-view={view}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onPreview={setPreview} onAdd={addToCart} />
            ))}
          </div>
        ) : (
          <div className="petrolero-catalog-no-results" role="status">
            <h2>Товары не найдены</h2>
            <p>Измени параметры фильтрации или поисковый запрос.</p>
            <button type="button" onClick={() => { resetFilters(); setSearch(""); }}>Сбросить фильтры</button>
          </div>
        )}
      </main>
      <SiteFooter />

      {feedback && (
        <div className="petrolero-catalog-feedback" role="status">
          {feedback}
          <button type="button" onClick={() => { setFeedback(null); setCartOpen(true); }}>Открыть корзину</button>
          <button type="button" aria-label="Закрыть уведомление" onClick={() => setFeedback(null)}>×</button>
        </div>
      )}

      {preview && (
        <div className="petrolero-catalog-overlay" onPointerDown={(event) => { if (event.target === event.currentTarget) setPreview(null); }}>
          <section className="petrolero-catalog-quickview" role="dialog" aria-modal="true" aria-label={"Быстрый просмотр " + preview.title}>
            <button type="button" className="petrolero-catalog-close" aria-label="Закрыть" onClick={() => setPreview(null)}>×</button>
            <div className="petrolero-catalog-quickview__media">
              {preview.image
                ? <Image src={preview.image} alt={preview.title} width={420} height={460}/>
                : <ProductVisual packaging={preview.packaging} title={preview.title} viscosity={preview.viscosity} />}
            </div>
            <div className="petrolero-catalog-quickview__content">
              <p className="petrolero-catalog-item__sku">ТЕСТОВАЯ КАРТОЧКА / {preview.sku}</p>
              <h2>{preview.title}</h2>
              <p>{preview.description}</p>
              <dl>
                {preview.viscosity && <><dt>Вязкость SAE</dt><dd>{preview.viscosity}</dd></>}
                {!!preview.acea.length && <><dt>ACEA</dt><dd>{preview.acea.join(", ")}</dd></>}
                {!!preview.api.length && <><dt>API</dt><dd>{preview.api.join(", ")}</dd></>}
                {!!preview.approvals.length && <><dt>Одобрения</dt><dd>{preview.approvals.join(", ")}</dd></>}
                {!!preview.ilsac.length && <><dt>ILSAC</dt><dd>{preview.ilsac.join(", ")}</dd></>}
                {preview.volumeLiters && <><dt>Объём</dt><dd>{preview.volumeLiters < 1 ? preview.volumeLiters * 1000 + " мл" : preview.volumeLiters + " л"}</dd></>}
              </dl>
              <strong>{priceLabel(preview.priceKopecks)} <small>демо</small></strong>
              <button type="button" onClick={() => addToCart(preview)}>Добавить в корзину +</button>
            </div>
          </section>
        </div>
      )}

      {cartOpen && (
        <div className="petrolero-catalog-overlay" onPointerDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="petrolero-catalog-drawer" role="dialog" aria-modal="true" aria-label="Демонстрационная корзина">
            <header>
              <div><p>Магазин Petrolero</p><h2>Корзина <span>({cartCount})</span></h2></div>
              <button type="button" className="petrolero-catalog-close" aria-label="Закрыть" onClick={() => setCartOpen(false)}>×</button>
            </header>
            {cartLines.length ? (
              <>
                <div className="petrolero-catalog-drawer__items">
                  {cartLines.map((line) => {
                    const product = CATALOG_PRODUCTS.find((item) => item.id === line.id);
                    if (!product) return null;
                    return (
                      <div className="petrolero-catalog-drawer__item" key={line.id}>
                        <ProductVisual packaging={product.packaging} title={product.title} viscosity={product.viscosity} compact />
                        <div>
                          <strong>{product.title}</strong>
                          <p>{priceLabel(product.priceKopecks)} / тест</p>
                          <div className="petrolero-catalog-quantity">
                            <button type="button" aria-label={"Уменьшить количество " + product.title} onClick={() => updateQuantity(product.id, -1)}>−</button>
                            <span>{line.quantity}</span>
                            <button type="button" aria-label={"Увеличить количество " + product.title} onClick={() => updateQuantity(product.id, 1)}>+</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="petrolero-catalog-drawer__summary">
                  <p><span>Итого (демо)</span><strong>{priceLabel(cartTotal)}</strong></p>
                  <small>Заказы и оплата пока не подключены. Корзина предназначена для проверки интерфейса.</small>
                </div>
              </>
            ) : (
              <div className="petrolero-catalog-drawer__empty">
                <h3>Корзина пуста</h3>
                <p>Добавь тестовый товар из каталога.</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {accountOpen && (
        <div className="petrolero-catalog-overlay" onPointerDown={(event) => { if (event.target === event.currentTarget) setAccountOpen(false); }}>
          <section className="petrolero-catalog-account" role="dialog" aria-modal="true" aria-label="Личный кабинет">
            <button type="button" className="petrolero-catalog-close" aria-label="Закрыть" onClick={() => setAccountOpen(false)}>×</button>
            <p>ЛИЧНЫЙ КАБИНЕТ</p>
            <h2>Вход в аккаунт</h2>
            <span>Авторизацию подключим отдельно с защищённым хранением пользователей и заказов. Сейчас доступна демонстрация каталога.</span>
          </section>
        </div>
      )}
    </div>
  );
}
