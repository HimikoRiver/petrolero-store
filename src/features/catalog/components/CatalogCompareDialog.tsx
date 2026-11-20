"use client";

import Image from "next/image";
import { CompareIcon } from "./CatalogIcons";
import { CATALOG_CATEGORIES, type CatalogProduct } from "../data/catalogData";
import { priceLabel } from "../lib/catalogUtils";

type Props = {
  comparedProducts: CatalogProduct[];
  onClose: () => void;
  onClear: () => void;
  toggleCompare: (product: CatalogProduct) => void;
};

export default function CatalogCompareDialog({ comparedProducts, onClose, onClear, toggleCompare }: Props) {
  return (
<div className="petrolero-catalog-overlay" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <section className="petrolero-catalog-compare-dialog" role="dialog" aria-modal="true" aria-label="Сравнение товаров">
            <header className="petrolero-catalog-compare-dialog__header">
              <div>
                <p>ВЫБРАННЫЕ ТОВАРЫ</p>
                <h2>Сравнение <span>({comparedProducts.length}/3)</span></h2>
              </div>
              <button type="button" className="petrolero-catalog-close" aria-label="Закрыть сравнение" onClick={() => onClose()}>×</button>
            </header>
            {comparedProducts.length ? (
              <>
                <div className="petrolero-catalog-compare-scroll">
                  <table className="petrolero-catalog-compare-table">
                    <thead>
                      <tr>
                        <th scope="col">Параметр</th>
                        {comparedProducts.map((item) => (
                          <th scope="col" key={item.id}>
                            <div className="petrolero-catalog-compare-table__photo">
                              {item.image
                                ? <Image src={item.image} alt={item.title} fill sizes="180px" style={{ objectFit: "contain" }} />
                                : <span>Фото готовится</span>}
                            </div>
                            <strong>{item.title}</strong>
                            <button type="button" onClick={() => toggleCompare(item)} aria-label={"Убрать из сравнения: " + item.title}>Убрать ×</button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        ["Цена", (item: CatalogProduct) => priceLabel(item.priceKopecks)],
                        ["Категория", (item: CatalogProduct) => item.category === "additives" ? "Присадки" : CATALOG_CATEGORIES.find((category) => category.id === item.category)?.title ?? "Моторные масла"],
                        ["Объём", (item: CatalogProduct) => item.volumeLiters ? (item.volumeLiters < 1 ? item.volumeLiters * 1000 + " мл" : item.volumeLiters + " л") : "—"],
                        ["SAE", (item: CatalogProduct) => item.viscosity || "—"],
                        ["ACEA", (item: CatalogProduct) => item.acea.join(", ") || "—"],
                        ["API", (item: CatalogProduct) => item.api.join(", ") || "—"],
                        ["ILSAC", (item: CatalogProduct) => item.ilsac.join(", ") || "—"],
                        ["Одобрения", (item: CatalogProduct) => item.approvals.join(", ") || "—"],
                      ] as const).map(([label, getValue]) => (
                        <tr key={label}>
                          <th scope="row">{label}</th>
                          {comparedProducts.map((item) => <td key={item.id}>{getValue(item)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="petrolero-catalog-compare-dialog__footer">
                  
                  <button type="button" onClick={() => onClear()}>Очистить сравнение</button>
                </div>
              </>
            ) : (
              <div className="petrolero-catalog-compare-dialog__empty">
                <CompareIcon />
                <p>Выберите товары значком сравнения рядом с кнопкой «В корзину».</p>
                <button type="button" className="petrolero-catalog-liquid-button" onClick={() => onClose()}>К товарам</button>
              </div>
            )}
          </section>
        </div>
  );
}
