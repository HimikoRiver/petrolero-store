"use client";

import ProductGallery from "./ProductGallery";
import { priceLabel } from "../lib/catalogUtils";
import type { CatalogProduct } from "../data/catalogData";

type Props = { product: CatalogProduct; onClose: () => void; onAdd: (product: CatalogProduct) => void };

export default function CatalogQuickView({ product: preview, onClose, onAdd }: Props) {
  return (
<div className="petrolero-catalog-overlay" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <section className="petrolero-catalog-quickview" role="dialog" aria-modal="true" aria-label={"Быстрый просмотр " + preview.title}>
            <button type="button" className="petrolero-catalog-close" aria-label="Закрыть" onClick={() => onClose()}>×</button>
            <div className="petrolero-catalog-quickview__media">
              <ProductGallery
                key={preview.id}
                image={preview.image}
                gallery={preview.gallery}
                title={preview.title}
                mode="preview"
              />
            </div>
            <div className="petrolero-catalog-quickview__content">
              <p className="petrolero-catalog-item__sku">АРТ. {preview.sku}</p>
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
              <button type="button" className="petrolero-catalog-liquid-button" onClick={() => onAdd(preview)}>В корзину</button>
            </div>
          </section>
        </div>
  );
}
