import Link from "next/link";
import Image from "next/image";
import type { DemoOrder } from "@/features/checkout/types";
import { priceLabel } from "@/features/catalog/lib/catalogUtils";
import AccountIcon from "./AccountIcon";

function orderDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function DemoOrdersList({ orders, compact = false }: { orders: DemoOrder[]; compact?: boolean }) {
  return (
    <div className="pa-demo-order-list">
      {orders.map((order) => (
        <Link key={order.id} className="pa-demo-order" href={"/account/orders/" + encodeURIComponent(order.id)}>
          <div className="pa-demo-order__identity">
            <span className="pa-demo-order__reference">{order.reference}</span>
            <span className="pa-demo-order__date">{orderDate(order.createdAt)}</span>
          </div>
          <div className="pa-demo-order__status">Сохранён</div>
          <div className="pa-demo-order__total">{priceLabel(order.subtotalKopecks)}</div>
          <AccountIcon name="arrow" size={17}/>
          {!compact && <small>Заявка в личном кабинете</small>}
        </Link>
      ))}
    </div>
  );
}

export function DemoOrderDetails({ order }: { order: DemoOrder }) {
  return (
    <>
      <section className="pa-surface">
        <div className="pa-surface__heading">
          <div><span className="pa-kicker">СОСТАВ ЗАКАЗА</span><h3>{order.reference}</h3></div>
          <span className="pa-tag">Сохранён</span>
        </div>
        <p className="pa-demo-order-date">Создан {orderDate(order.createdAt)}</p>
        <div className="pa-demo-items">
          {order.items.map((item) => (
            <article className="pa-demo-item" key={item.id}>
              <div className="pa-demo-item__visual">
                {item.image ? (
                  <Image src={item.image} unoptimized={item.image.startsWith("https://")} alt={item.title} fill
                    sizes="(max-width: 550px) 68px, 90px" />
                ) : <AccountIcon name="bag" size={27} />}
              </div>
              <div className="pa-demo-item__body">
                <strong>{item.title}</strong>
                <span>{!item.sku.startsWith("DEMO-") && <>АРТ. {item.sku} · </>}{item.quantity} шт. × {priceLabel(item.unitPriceKopecks)}</span>
              </div>
              <strong className="pa-demo-item__price">{priceLabel(item.lineTotalKopecks)}</strong>
            </article>
          ))}
        </div>
        <div className="pa-demo-order-subtotal">
          <span>Стоимость товаров</span>
          <strong>{priceLabel(order.subtotalKopecks)}</strong>
        </div>
        <p className="pa-demo-order-footnote">Стоимость доставки не включена.</p>
      </section>
      <section className="pa-surface">
        <div className="pa-surface__heading">
          <div><span className="pa-kicker">ПОЛУЧАТЕЛЬ</span><h3>Контактные данные</h3></div>
        </div>
        <div className="pa-demo-contact-grid">
          <div><small>Получатель</small><strong>{order.recipient}</strong></div>
          <div><small>Телефон</small><strong>{order.phone}</strong></div>
          <div><small>Адрес</small><strong>
            {order.city}, {order.street}{order.apartment ? ", " + order.apartment : ""}
            {order.postalCode ? ", " + order.postalCode : ""}
          </strong></div>
          {order.note && <div><small>Комментарий</small><strong>{order.note}</strong></div>}
        </div>
      </section>
      <Link href="/account/orders" className="pa-text-link">
        <AccountIcon name="arrow" size={16}/> К списку заказов
      </Link>
    </>
  );
}
