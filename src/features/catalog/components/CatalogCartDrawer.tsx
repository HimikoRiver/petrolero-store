"use client";

import Image from "next/image";
import { CATALOG_PRODUCTS } from "../data/catalogData";
import { priceLabel } from "../lib/catalogUtils";
import type { CartLine } from "../types";

type Props = {
  cartLines: CartLine[];
  cartCount: number;
  cartTotal: number;
  onClose: () => void;
  updateQuantity: (id: string, delta: number) => void;
};

export default function CatalogCartDrawer({ cartLines, cartCount, cartTotal, onClose, updateQuantity }: Props) {
  return (
<div className="petrolero-catalog-overlay" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <aside className="petrolero-catalog-drawer" role="dialog" aria-modal="true" aria-label="Демонстрационная корзина">
            <header>
              <div><p>Магазин Petrolero</p><h2>Корзина <span>({cartCount})</span></h2></div>
              <button type="button" className="petrolero-catalog-close" aria-label="Закрыть" onClick={() => onClose()}>×</button>
            </header>
            {cartLines.length ? (
              <>
                <div className="petrolero-catalog-drawer__items">
                  {cartLines.map((line) => {
                    const product = CATALOG_PRODUCTS.find((item) => item.id === line.id);
                    if (!product) return null;
                    return (
                      <div className="petrolero-catalog-drawer__item" key={line.id}>
                        {product.image ? (
                          <Image src={product.image} alt={product.title} width={90} height={100} sizes="90px" />
                        ) : (
                          <span className="petrolero-catalog-no-image" role="img" aria-label="Фото пока отсутствует">Нет фото</span>
                        )}
                        <div>
                          <strong>{product.title}</strong>
                          <p>{priceLabel(product.priceKopecks)}</p>
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
                  <small>Оформление заказа временно недоступно.</small>
                </div>
              </>
            ) : (
              <div className="petrolero-catalog-drawer__empty">
                <h3>Корзина пуста</h3>
                <p>Выберите товары в каталоге.</p>
              </div>
            )}
          </aside>
        </div>
  );
}
