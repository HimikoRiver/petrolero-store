"use client";

import Link from "next/link";
import SiteFooter from "@/components/layout/footer/SiteFooter";
import SiteHeader from "@/components/layout/header/SiteHeader";
import useReducedMotion from "@/hooks/useReducedMotion";
import { HeartIcon, CompareIcon, ChevronDownIcon } from "./components/CatalogIcons";
import { FILTERS, SORT_OPTIONS } from "./data/catalogConfig";
import CatalogOilCategories from "./components/CatalogOilCategories";
import CatalogProductCard from "./components/CatalogProductCard";
import CatalogQuickView from "./components/CatalogQuickView";
import CatalogCartDrawer from "./components/CatalogCartDrawer";
import CatalogCompareDialog from "./components/CatalogCompareDialog";
import CatalogAccountDialog from "./components/CatalogAccountDialog";
import useCatalogController from "./hooks/useCatalogController";
import "./styles/base.css";
import "./styles/dialogs.css";
import "./styles/polish.css";
import "./styles/responsive.css";
import "./styles/gallery.css";

export default function CatalogPage() {
  const reducedMotion = useReducedMotion();
  const { department, category, search, setSearch, sortOrder, setSortOrder, selectedFilters, minPrice, setMinPrice, maxPrice, setMaxPrice, openFilter, setOpenFilter, view, setView, preview, setPreview, cartOpen, setCartOpen, accountOpen, setAccountOpen, cartLines, favoriteIds, compareIds, setCompareIds, favoritesOnly, setFavoritesOnly, compareOpen, setCompareOpen, feedback, setFeedback, filtersRef, filterOptions, products, filterCount, cartCount, comparedProducts, cartTotal, resetFilters, changeDepartment, changeCategory, toggleValue, updateQuantity, addToCart, toggleFavorite, toggleCompare, heading, closeLayers } = useCatalogController();

  return (
    <div className="petrolero-catalog-page">
      <SiteHeader
        phase={3}
        reducedMotion={reducedMotion}
        mode="catalog"
        searchValue={search}
        onSearchChange={setSearch}
        cartCount={cartCount}
        onCartOpen={() => { closeLayers(); setCartOpen(true); }}
        onAccountOpen={() => { closeLayers(); setAccountOpen(true); }}
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
        </div>

        <h1>{heading}</h1>

        {department === "oils" && (
          <CatalogOilCategories
            selectedCategory={category}
            onCategoryChange={changeCategory}
          />
        )}

        <div className="petrolero-catalog-toolbar" ref={filtersRef} id="petrolero-catalog-products">
          <div className="petrolero-catalog-filter-buttons" role="group" aria-label="Фильтры товаров">
            <div className="petrolero-catalog-filter">
              <button
                type="button"
                aria-expanded={openFilter === "price"}
                onClick={() => setOpenFilter(openFilter === "price" ? null : "price")}
                className={minPrice || maxPrice ? "is-active" : ""}
              >Цена <ChevronDownIcon /></button>
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
                  <ChevronDownIcon />
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
            <div className="petrolero-catalog-collection-controls">
              <span className="petrolero-catalog-results">{products.length} товаров</span>
              <button type="button" className="petrolero-catalog-collection-button"
                aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((value) => !value)}>
                <HeartIcon filled={favoritesOnly} />
                <span>Избранное{favoriteIds.length ? " · " + favoriteIds.length : ""}</span>
              </button>
              <button type="button" className="petrolero-catalog-collection-button"
                onClick={() => { closeLayers(); setCompareOpen(true); }}>
                <CompareIcon />
                <span>Сравнение{compareIds.length ? " · " + compareIds.length : ""}</span>
              </button>
            </div>
            <div className="petrolero-catalog-sort-view">
              <label className="petrolero-catalog-sort">
                <span className="sr-only">Сортировка каталога</span>
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                  {SORT_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <ChevronDownIcon />
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
              <CatalogProductCard
                key={product.id}
                product={product}
                onPreview={setPreview}
                onAdd={addToCart}
                isFavorite={favoriteIds.includes(product.id)}
                isCompared={compareIds.includes(product.id)}
                onFavorite={toggleFavorite}
                onCompare={toggleCompare}
              />
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
          <span>{feedback.message}</span>
          {feedback.target === "cart" && <button type="button" onClick={() => { setFeedback(null); setCartOpen(true); }}>Корзина</button>}
          {feedback.target === "compare" && <button type="button" onClick={() => { setFeedback(null); setCompareOpen(true); }}>Сравнить</button>}
          <button type="button" aria-label="Закрыть уведомление" onClick={() => setFeedback(null)}>×</button>
        </div>
      )}

      {preview && <CatalogQuickView product={preview} onClose={() => setPreview(null)} onAdd={addToCart} />}

      {cartOpen && <CatalogCartDrawer cartLines={cartLines} cartCount={cartCount} cartTotal={cartTotal} onClose={() => setCartOpen(false)} updateQuantity={updateQuantity} />}

      {compareOpen && <CatalogCompareDialog comparedProducts={comparedProducts} onClose={() => setCompareOpen(false)} onClear={() => setCompareIds([])} toggleCompare={toggleCompare} />}

      {accountOpen && <CatalogAccountDialog onClose={() => setAccountOpen(false)} />}
    </div>
  );
}
