"use client";

import Link from "next/link";
import SiteFooter from "@/components/layout/footer/SiteFooter";
import SiteHeader from "@/components/layout/header/SiteHeader";
import useReducedMotion from "@/hooks/useReducedMotion";
import CatalogOilCategories from "./components/CatalogOilCategories";
import CatalogAdditivesFeature from "./components/CatalogAdditivesFeature";
import CatalogToolbar from "./components/CatalogToolbar";
import CatalogProductCard from "./components/CatalogProductCard";
import CatalogQuickView from "./components/CatalogQuickView";
import CatalogCartDrawer from "@/features/cart/components/CatalogCartDrawer";
import CatalogCompareDialog from "./components/CatalogCompareDialog";
import useCatalogController from "./hooks/useCatalogController";
import "./styles/base.css";
import "./styles/dialogs.css";
import "./styles/polish.css";
import "./styles/responsive.css";
import "./styles/gallery.css";
import "./styles/additives.css";

export default function CatalogPage() {
  const reducedMotion = useReducedMotion();
  const controller = useCatalogController();
  const { department, category, search, setSearch, sortOrder, setSortOrder, selectedFilters, minPrice, setMinPrice, maxPrice, setMaxPrice, openFilter, setOpenFilter, view, setView, preview, setPreview, cartOpen, setCartOpen, cartLines, favoriteIds, compareIds, setCompareIds, favoritesOnly, setFavoritesOnly, compareOpen, setCompareOpen, feedback, setFeedback, filtersRef, filterOptions, products, filterCount, cartCount, comparedProducts, cartTotal, resetFilters, changeDepartment, changeCategory, toggleValue, updateQuantity, addToCart, toggleFavorite, toggleCompare, heading, closeLayers } = controller;

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
      />

      <main className="petrolero-catalog-main" data-department={department}>
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

        {department === "additives" && <CatalogAdditivesFeature />}

        {department === "oils" && (
          <CatalogOilCategories
            selectedCategory={category}
            onCategoryChange={changeCategory}
          />
        )}

        <CatalogToolbar controller={controller} onCompareOpen={() => { closeLayers(); setCompareOpen(true); }} />

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

    </div>
  );
}
