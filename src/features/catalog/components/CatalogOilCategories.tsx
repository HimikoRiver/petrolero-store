"use client";

import Image from "next/image";
import { ArrowRightIcon } from "./CatalogIcons";
import { CATALOG_CATEGORIES, type ProductCategory } from "../data/catalogData";

type OilCategory = "all" | Exclude<ProductCategory, "additives">;

type CatalogOilCategoriesProps = {
  selectedCategory: OilCategory;
  onCategoryChange: (category: OilCategory) => void;
};

/**
 * ПУТИ К ИКОНКАМ — МЕНЯТЬ ЗДЕСЬ.
 * Файлы должны лежать в public/catalog/icons/.
 * Подставь реальные имена своих трёх WebP, если они отличаются.
 */
const CATEGORY_ICONS: Record<Exclude<ProductCategory, "additives">, string> = {
  passenger: "/catalog/icons/car.webp",       // Легковые масла
  motorcycle: "/catalog/icons/moto.webp",      // Мото масла
  commercial: "/catalog/icons/truck.webp",     // Грузовые автомобили
};

export default function CatalogOilCategories({
  selectedCategory,
  onCategoryChange,
}: CatalogOilCategoriesProps) {
  return (
    <div className="petrolero-catalog-subcategories" role="group" aria-label="Категории моторных масел">
      {CATALOG_CATEGORIES.map((item) => {
        const isActive = selectedCategory === item.id;

        return (
          <button
            key={item.id}
            className="petrolero-catalog-subcategory"
            data-active={isActive}
            type="button"
            aria-pressed={isActive}
            onClick={() => onCategoryChange(isActive ? "all" : item.id)}
          >
            <Image
              className="petrolero-catalog-subcategory__image"
              src={CATEGORY_ICONS[item.id]}
              alt=""
              width={74}
              height={66}
              sizes="74px"
            />
            <span>{item.title}</span>
            <ArrowRightIcon />
          </button>
        );
      })}
    </div>
  );
}
