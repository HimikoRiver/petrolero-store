"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import GoldShimmerButton from "@/components/ui/GoldShimmerButton";
import AdminNavigation from "./AdminNavigation";
import { adminApi, formatDate, formatMoney } from "./lib/client";
import { REVIEW_STATUSES, type AdminOrderDetails, type AdminOrderSummary, type Paginated, type ReviewStatus } from "./data/types";
import "./admin.css";
import "./management.css";

const buyer = { id: "preview-customer-1", name: "Александр К.", email: "demo-buyer@example.test" };
const demoOrderItems = [
  {
    id: "preview-line-1", productId: "preview-oil", sku: "PET-530-4L",
    title: "PETROLERO FUSION 5W-30", image: null,
    quantity: 2, unitPriceKopecks: 459000, lineTotalKopecks: 918000,
  },
  {
    id: "preview-line-2", productId: "preview-add", sku: "PET-AD-150",
    title: "PETROLERO PROTECT", image: null,
    quantity: 1, unitPriceKopecks: 189000, lineTotalKopecks: 189000,
  },
];

const previewOrders: AdminOrderDetails[] = [
  {
    id: "preview-order-1", reference: "DEMO-0148B1A0", createdAt: "2026-11-20T13:15:00Z",
    recipient: "Александр К.", phone: "+7 900 000-11-22",
    subtotalKopecks: 1107000, reviewStatus: "NEW", staffNote: null,
    reviewedAt: null, reviewedById: null, itemCount: 2, buyer,
    city: "Москва", street: "ул. Примерная, 10",
    apartment: "кв. 14", postalCode: "101000", note: "Свяжитесь со мной по телефону",
    items: demoOrderItems,
  },
  {
    id: "preview-order-2", reference: "DEMO-B5227D9F", createdAt: "2026-11-19T10:05:00Z",
    recipient: "Елена В.", phone: "+7 900 000-33-44",
    subtotalKopecks: 459000, reviewStatus: "REVIEWED", staffNote: "Проверены контактные данные.",
    reviewedAt: "2026-11-20T11:00:00Z", reviewedById: "preview-admin",
    itemCount: 1, buyer: { id: "preview-customer-2", name: "Елена В.", email: "buyer-two@example.test" },
    city: "Санкт-Петербург", street: "Невский проспект, 2",
    apartment: null, postalCode: null, note: null,
    items: [{ ...demoOrderItems[0], id: "preview-line-3", quantity: 1, lineTotalKopecks: 459000 }],
  },
];

type OrderPage = Paginated<AdminOrderSummary>;

export default function AdminOrders({ preview = false }: { preview?: boolean }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [status, setStatus] = useState<ReviewStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [demoOrders, setDemoOrders] = useState(previewOrders);
  const [result, setResult] = useState<OrderPage>({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrderDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<ReviewStatus>("NEW");
  const [staffNote, setStaffNote] = useState("");
  const closeButton = useRef<HTMLButtonElement>(null);

  const matching = useMemo(() => preview ? demoOrders.filter(order =>
    (status === "all" || order.reviewStatus === status) &&
    [order.reference, order.recipient, order.buyer.email, order.phone]
      .join(" ").toLowerCase().includes(deferredQuery.toLowerCase()),
  ) : [], [demoOrders, deferredQuery, status, preview]);

  useEffect(() => {
    if (preview) return;
    const abort = new AbortController();
    let active = true;
    const load = async () => {
      try {
        const params = new URLSearchParams({
          page: String(page), status, q: deferredQuery,
        });
        const data = await adminApi<OrderPage>("/api/admin/orders?" + params.toString(), {
          signal: abort.signal,
        });
        if (!active) return;
        setResult(data);
        setError("");
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Не удалось получить список.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; abort.abort(); };
  }, [page, status, deferredQuery, revision, preview]);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    let active = true;
    const load = async () => {
      setDetailLoading(true);
      setDetailError("");
      setDetail(null);
      try {
        const item = preview
          ? demoOrders.find(order => order.id === selectedId)
          : (await adminApi<{ order: AdminOrderDetails }>(
              "/api/admin/orders/" + encodeURIComponent(selectedId),
            )).order;
        if (!item) throw new Error("Заявка не найдена.");
        if (!active) return;
        setDetail(item);
        setNewStatus(item.reviewStatus);
        setStaffNote(item.staffNote ?? "");
      } catch (e) {
        if (active) setDetailError(e instanceof Error ? e.message : "Ошибка загрузки заявки.");
      } finally {
        if (active) setDetailLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [selectedId, preview, demoOrders]);

  useEffect(() => {
    if (!selectedId) return;
    const previous = document.body.style.overflow;
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setSelectedId(null);
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", keydown);
      focused?.focus();
    };
  }, [selectedId, saving]);

  const close = () => { if (!saving) setSelectedId(null); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!detail || saving) return;
    setSaving(true);
    setDetailError("");
    setNotice("");
    try {
      let updated: AdminOrderDetails;
      if (preview) {
        updated = {
          ...detail, reviewStatus: newStatus,
          staffNote: staffNote.trim() || null,
          reviewedAt: new Date().toISOString(), reviewedById: "preview-admin",
        };
        setDemoOrders(current => current.map(order => order.id === detail.id ? updated : order));
      } else {
        const response = await adminApi<{ order: AdminOrderDetails }>(
          "/api/admin/orders/" + encodeURIComponent(detail.id),
          { method: "PATCH", body: JSON.stringify({ reviewStatus: newStatus, staffNote }) },
        );
        updated = response.order;
        setRevision(value => value + 1);
      }
      setDetail(updated);
      setNotice(preview ? "" : "Заявка обновлена.");
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "Не удалось сохранить заявку.");
    } finally {
      setSaving(false);
    }
  };

  const displayed = preview ? matching.slice((page - 1) * 25, page * 25) : result.items;
  const total = preview ? matching.length : result.total;
  const pages = preview ? Math.max(1, Math.ceil(total / 25)) : result.pages;

  return (
    <main className="pt-admin">
      <div className="pt-admin__layout">
        <nav className="pt-admin__breadcrumbs" aria-label="Навигация">
          <Link href="/">Petrolero</Link><span>/</span>Администрирование
        </nav>
        <AdminNavigation active="orders" preview={preview} />
        <header className="pt-admin__header pt-manage__header">
          <div>
            <span className="pt-admin__kicker">PETROLERO / ЗАЯВКИ</span>
            <h1>Заказы<span>.</span></h1>
            <p>Просмотр заявок, контактных данных и состава корзины.</p>
          </div>
          <div className="pt-manage__header-metric">
            <span>НАЙДЕНО ЗАЯВОК</span>
            <strong>{total}</strong>
          </div>
        </header>
        <div className="pt-admin__toolbar pt-manage__toolbar">
          <label>
            <span className="pt-admin__sr-only">Поиск заявки</span>
            <input type="search" value={query}
              onChange={event => { setQuery(event.target.value); setPage(1); }}
              placeholder="Номер заявки, получатель, телефон или почта…" />
          </label>
          <div className="pt-admin__tabs" role="group" aria-label="Статус заявки">
            <button type="button" aria-pressed={status === "all"}
              onClick={() => { setStatus("all"); setPage(1); }}>Все</button>
            {REVIEW_STATUSES.map(item => (
              <button key={item.value} type="button" aria-pressed={status === item.value}
                onClick={() => { setStatus(item.value); setPage(1); }}>{item.label}</button>
            ))}
          </div>
        </div>

        {notice && <div className="pt-admin__message" role="status">{notice}</div>}
        {error && <div className="pt-admin__message pt-admin__message--error" role="alert">{error}
          <button type="button" onClick={() => { setLoading(true); setRevision(value => value + 1); }}>Повторить</button>
        </div>}
        {loading ? <p className="pt-admin__placeholder" role="status">Загружаем заявки…</p>
          : displayed.length ? (
            <div className="pt-manage__table" role="list" aria-label="Заявки">
              <div className="pt-manage__table-head pt-manage__orders-head">
                <span>НОМЕР И ДАТА</span><span>ПОКУПАТЕЛЬ</span>
                <span>ПОЗИЦИИ</span><span>СУММА ТОВАРОВ</span><span>ВНУТРЕННИЙ СТАТУС</span><span></span>
              </div>
              {displayed.map(order => (
                <article key={order.id} className="pt-manage__row pt-manage__order-row" role="listitem">
                  <div className="pt-manage__main">
                    <strong>{order.reference}</strong><small>{formatDate(order.createdAt)}</small>
                  </div>
                  <div className="pt-manage__secondary">
                    <strong>{order.recipient}</strong><small>{order.buyer.email}</small>
                  </div>
                  <span className="pt-manage__muted">{order.itemCount} поз.</span>
                  <span>{formatMoney(order.subtotalKopecks)}</span>
                  <span className="pt-manage__status" data-status={order.reviewStatus}>
                    {REVIEW_STATUSES.find(item => item.value === order.reviewStatus)?.label ?? order.reviewStatus}
                  </span>
                  <button className="pt-manage__row-action" type="button" onClick={() => setSelectedId(order.id)}>
                    Подробнее
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="pt-admin__empty">
              <h2>Заявок не найдено</h2>
              <p>Проверьте фильтры. Новые заявки появятся после заполнения формы оформления.</p>
            </div>
          )}
        <div className="pt-manage__pagination" aria-label="Навигация по страницам заявок">
          <span>Страница {page} из {pages}</span>
          <div>
            <button type="button" disabled={page <= 1} onClick={() => setPage(v => Math.max(1, v - 1))}>Назад</button>
            <button type="button" disabled={page >= pages} onClick={() => setPage(v => v + 1)}>Вперёд</button>
          </div>
        </div>
      </div>

      {selectedId && (
        <div className="pt-admin__overlay" onPointerDown={e => {
          if (e.target === e.currentTarget) close();
        }}>
          <aside className="pt-admin__editor pt-manage__drawer" role="dialog" aria-modal="true" aria-labelledby="pt-order-title">
            <header className="pt-admin__editor-head">
              <div>
                <span className="pt-admin__kicker">ЗАЯВКА / ДЕТАЛИ</span>
                <h2 id="pt-order-title">{detail?.reference ?? "Загрузка…"}</h2>
              </div>
              <button ref={closeButton} type="button" aria-label="Закрыть" onClick={close} disabled={saving}>×</button>
            </header>
            <div className="pt-manage__drawer-content">
              {detailLoading ? <p role="status">Загружаем заявку…</p> : detail ? (
                <>
                  <div className="pt-manage__details-grid">
                    <div><small>Дата</small><strong>{formatDate(detail.createdAt)}</strong></div>
                    <div><small>Покупатель</small><strong>{detail.buyer.name}</strong><span>{detail.buyer.email}</span></div>
                    <div><small>Получатель</small><strong>{detail.recipient}</strong><span>{detail.phone}</span></div>
                    <div><small>Адрес</small><strong>{detail.city}, {detail.street}</strong>
                      <span>{[detail.apartment, detail.postalCode].filter(Boolean).join(", ")}</span></div>
                  </div>
                  {detail.note && <div className="pt-manage__buyer-note"><small>Комментарий покупателя</small><p>{detail.note}</p></div>}
                  <section className="pt-manage__detail-section">
                    <h3>Состав заявки</h3>
                    {detail.items.map(item => (
                      <div className="pt-manage__item" key={item.id}>
                        <div className="pt-manage__item-image">
                          {item.image ? <Image src={item.image} unoptimized={item.image.startsWith("https://")}
                            alt={item.title} fill sizes="65px" /> : <span>Фото</span>}
                        </div>
                        <div><strong>{item.title}</strong>
                          <small>{item.sku} · {item.quantity} шт. × {formatMoney(item.unitPriceKopecks)}</small>
                        </div>
                        <b>{formatMoney(item.lineTotalKopecks)}</b>
                      </div>
                    ))}
                    <div className="pt-manage__sum"><span>Стоимость товаров</span><strong>{formatMoney(detail.subtotalKopecks)}</strong></div>
                  </section>
                  <form className="pt-manage__edit-form" onSubmit={save}>
                    <h3>Внутренняя обработка</h3>
                    <label><span>Статус проверки</span>
                      <select value={newStatus} disabled={saving} onChange={e => setNewStatus(e.target.value as ReviewStatus)}>
                        {REVIEW_STATUSES.map(item => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </label>
                    <label><span>Заметка администрации</span>
                      <textarea maxLength={2000} rows={4} disabled={saving}
                        placeholder="Видна только администраторам"
                        value={staffNote} onChange={e => setStaffNote(e.target.value)} />
                    </label>
                    {detail.reviewedAt && <p className="pt-manage__fine">Последнее изменение: {formatDate(detail.reviewedAt)}</p>}
                    {detailError && <p className="pt-manage__error" role="alert">{detailError}</p>}
                    <GoldShimmerButton type="submit" disabled={saving}>
                      {saving ? "Сохранение…" : "Сохранить изменения"}
                    </GoldShimmerButton>
                  </form>
                </>
              ) : (
                <div className="pt-manage__error" role="alert">
                  {detailError || "Не удалось открыть заявку."}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
