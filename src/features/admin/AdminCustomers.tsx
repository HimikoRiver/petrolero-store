"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import GoldShimmerButton from "@/components/ui/GoldShimmerButton";
import AdminNavigation from "./AdminNavigation";
import { adminApi, formatDate, formatMoney } from "./lib/client";
import type { AdminCustomerDetails, AdminCustomerSummary, Paginated } from "./data/types";
import "./admin.css";
import "./management.css";

const previewCustomers: AdminCustomerDetails[] = [
  {
    id: "preview-customer-1", name: "Александр К.", email: "demo-buyer@example.test",
    phone: "+7 900 000-11-22", emailVerified: true,
    createdAt: "2026-11-10T09:00:00Z",
    ordersCount: 1, addressesCount: 1, favoritesCount: 3,
    adminNote: "Предпочтительный способ связи — телефон.",
    addresses: [{
      id: "demo-address-1", label: "Дом", recipient: "Александр К.",
      phone: "+7 900 000-11-22", city: "Москва",
      street: "ул. Примерная, 10", apartment: "кв. 14",
      postalCode: "101000", isDefault: true,
    }],
    orders: [{
      id: "preview-order-1", reference: "DEMO-0148B1A0",
      createdAt: "2026-11-20T13:15:00Z",
      subtotalKopecks: 1107000, reviewStatus: "NEW",
    }],
  },
  {
    id: "preview-customer-2", name: "Елена В.", email: "buyer-two@example.test",
    phone: null, emailVerified: false,
    createdAt: "2026-11-17T15:00:00Z",
    ordersCount: 1, addressesCount: 0, favoritesCount: 0,
    adminNote: null, addresses: [],
    orders: [{
      id: "preview-order-2", reference: "DEMO-B5227D9F",
      createdAt: "2026-11-19T10:05:00Z",
      subtotalKopecks: 459000, reviewStatus: "REVIEWED",
    }],
  },
];

type CustomersPage = Paginated<AdminCustomerSummary>;

export default function AdminCustomers({ preview = false }: { preview?: boolean }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [verified, setVerified] = useState<"all" | "yes" | "no">("all");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [sample, setSample] = useState(previewCustomers);
  const [result, setResult] = useState<CustomersPage>({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminCustomerDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [saving, setSaving] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const closeButton = useRef<HTMLButtonElement>(null);

  const matching = useMemo(() => preview ? sample.filter(customer =>
    (verified === "all" || customer.emailVerified === (verified === "yes")) &&
    [customer.name, customer.email, customer.phone ?? ""]
      .join(" ").toLowerCase().includes(deferredQuery.toLowerCase()),
  ) : [], [sample, deferredQuery, verified, preview]);

  useEffect(() => {
    if (preview) return;
    const abort = new AbortController();
    let active = true;
    const load = async () => {
      try {
        const params = new URLSearchParams({
          page: String(page), verified, q: deferredQuery,
        });
        const data = await adminApi<CustomersPage>("/api/admin/customers?" + params.toString(), {
          signal: abort.signal,
        });
        if (!active) return;
        setResult(data);
        setError("");
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Не удалось получить покупателей.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; abort.abort(); };
  }, [page, verified, deferredQuery, revision, preview]);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    let active = true;
    const load = async () => {
      setDetailLoading(true);
      setDetailError("");
      setDetail(null);
      try {
        const customer = preview
          ? sample.find(item => item.id === selectedId)
          : (await adminApi<{ customer: AdminCustomerDetails }>(
              "/api/admin/customers/" + encodeURIComponent(selectedId),
            )).customer;
        if (!customer) throw new Error("Покупатель не найден.");
        if (!active) return;
        setDetail(customer);
        setAdminNote(customer.adminNote ?? "");
      } catch (e) {
        if (active) setDetailError(e instanceof Error ? e.message : "Ошибка загрузки профиля.");
      } finally {
        if (active) setDetailLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [selectedId, preview, sample]);

  useEffect(() => {
    if (!selectedId) return;
    const previous = document.body.style.overflow;
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setSelectedId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
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
      let updated: AdminCustomerDetails;
      if (preview) {
        updated = { ...detail, adminNote: adminNote.trim() || null };
        setSample(items => items.map(item => item.id === detail.id ? updated : item));
      } else {
        updated = (await adminApi<{ customer: AdminCustomerDetails }>(
          "/api/admin/customers/" + encodeURIComponent(detail.id),
          { method: "PATCH", body: JSON.stringify({ adminNote }) },
        )).customer;
        setRevision(value => value + 1);
      }
      setDetail(updated);
      setNotice(preview ? "" : "Заметка покупателя сохранена.");
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "Не удалось сохранить заметку.");
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
        <AdminNavigation active="customers" preview={preview} />
        <header className="pt-admin__header pt-manage__header">
          <div>
            <span className="pt-admin__kicker">PETROLERO / КЛИЕНТСКАЯ БАЗА</span>
            <h1>Покупатели<span>.</span></h1>
            <p>Контакты зарегистрированных клиентов, подтверждение почты и история заявок.</p>
          </div>
          <div className="pt-manage__header-metric">
            <span>НАЙДЕНО ПОКУПАТЕЛЕЙ</span>
            <strong>{total}</strong>
          </div>
        </header>
        <div className="pt-admin__toolbar pt-manage__toolbar">
          <label>
            <span className="pt-admin__sr-only">Поиск покупателя</span>
            <input type="search" value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              placeholder="Поиск по имени, телефону или почте…" />
          </label>
          <div className="pt-admin__tabs" role="group" aria-label="Подтверждение почты">
            {([["all", "Все"], ["yes", "Подтверждены"], ["no", "Без подтверждения"]] as const).map(
              ([key, label]) => (
                <button type="button" key={key} aria-pressed={verified === key}
                  onClick={() => { setVerified(key); setPage(1); }}>{label}</button>
              ),
            )}
          </div>
        </div>
        {notice && <div className="pt-admin__message" role="status">{notice}</div>}
        {error && <div className="pt-admin__message pt-admin__message--error" role="alert">{error}
          <button type="button" onClick={() => { setLoading(true); setRevision(value => value + 1); }}>Повторить</button>
        </div>}
        {loading ? <p className="pt-admin__placeholder" role="status">Загружаем покупателей…</p>
          : displayed.length ? (
            <div className="pt-manage__table" role="list" aria-label="Покупатели">
              <div className="pt-manage__table-head pt-manage__customers-head">
                <span>ПОКУПАТЕЛЬ</span><span>ТЕЛЕФОН</span><span>РЕГИСТРАЦИЯ</span>
                <span>ЗАЯВКИ</span><span>ПОЧТА</span><span></span>
              </div>
              {displayed.map(customer => (
                <article className="pt-manage__row pt-manage__customer-row" role="listitem" key={customer.id}>
                  <div className="pt-manage__main">
                    <strong>{customer.name}</strong><small>{customer.email}</small>
                  </div>
                  <span>{customer.phone || "—"}</span>
                  <span className="pt-manage__muted">{formatDate(customer.createdAt)}</span>
                  <span>{customer.ordersCount} тест.</span>
                  <span className="pt-manage__status" data-status={customer.emailVerified ? "REVIEWED" : "NEW"}>
                    {customer.emailVerified ? "Подтверждена" : "Ожидает"}
                  </span>
                  <button type="button" className="pt-manage__row-action"
                    onClick={() => setSelectedId(customer.id)}>Профиль</button>
                </article>
              ))}
            </div>
          ) : (
            <div className="pt-admin__empty">
              <h2>Покупатели не найдены</h2>
              <p>Здесь будут зарегистрированные клиенты, когда они создадут аккаунт и появятся в базе.</p>
            </div>
          )}
        <div className="pt-manage__pagination" aria-label="Навигация по страницам покупателей">
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
          <aside className="pt-admin__editor pt-manage__drawer" role="dialog" aria-modal="true" aria-labelledby="pt-customer-title">
            <header className="pt-admin__editor-head">
              <div>
                <span className="pt-admin__kicker">КАРТОЧКА ПОКУПАТЕЛЯ</span>
                <h2 id="pt-customer-title">{detail?.name ?? "Загрузка…"}</h2>
              </div>
              <button type="button" ref={closeButton} aria-label="Закрыть" onClick={close} disabled={saving}>×</button>
            </header>
            <div className="pt-manage__drawer-content">
              {detailLoading ? <p role="status">Загружаем профиль…</p> : detail ? (
                <>
                  <div className="pt-manage__details-grid">
                    <div><small>Почта</small><strong>{detail.email}</strong>
                      <span>{detail.emailVerified ? "Подтверждена" : "Не подтверждена"}</span></div>
                    <div><small>Телефон</small><strong>{detail.phone || "Не указан"}</strong></div>
                    <div><small>Дата регистрации</small><strong>{formatDate(detail.createdAt)}</strong></div>
                    <div><small>Активность</small><strong>{detail.ordersCount} заявок</strong>
                      <span>{detail.favoritesCount} в избранном · {detail.addressesCount} адресов</span></div>
                  </div>
                  <section className="pt-manage__detail-section">
                    <h3>Сохранённые адреса</h3>
                    {detail.addresses.length ? (
                      <div className="pt-manage__address-list">
                        {detail.addresses.map(address => (
                          <div className="pt-manage__address" key={address.id}>
                            <div><strong>{address.label}</strong>
                              {address.isDefault && <small>Основной</small>}</div>
                            <p>{address.city}, {address.street}
                              {address.apartment ? ", " + address.apartment : ""}
                              {address.postalCode ? ", " + address.postalCode : ""}</p>
                            <small>{address.recipient} · {address.phone}</small>
                          </div>
                        ))}
                      </div>
                    ) : <p className="pt-manage__muted">Адреса ещё не добавлены.</p>}
                  </section>
                  <section className="pt-manage__detail-section">
                    <h3>Последние заявки</h3>
                    {detail.orders.length ? (
                      <div className="pt-manage__customer-orders">
                        {detail.orders.map(order => (
                          <div key={order.id}>
                            <strong>{order.reference}</strong>
                            <small>{formatDate(order.createdAt)}</small>
                            <span>{formatMoney(order.subtotalKopecks)}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="pt-manage__muted">Заявок пока нет.</p>}
                  </section>
                  <form className="pt-manage__edit-form" onSubmit={save}>
                    <h3>Внутренняя заметка</h3>
                    <p className="pt-manage__fine">Заметка доступна только администраторам. Профиль, пароль и права покупателя здесь не изменяются.</p>
                    <label>
                      <span>Комментарий для сотрудников</span>
                      <textarea maxLength={2000} rows={4} disabled={saving}
                        placeholder="Информация для внутренней работы"
                        value={adminNote} onChange={e => setAdminNote(e.target.value)} />
                    </label>
                    {detailError && <p className="pt-manage__error" role="alert">{detailError}</p>}
                    <GoldShimmerButton type="submit" disabled={saving}>
                      {saving ? "Сохранение…" : "Сохранить заметку"}
                    </GoldShimmerButton>
                  </form>
                </>
              ) : (
                <div className="pt-manage__error" role="alert">
                  {detailError || "Не удалось открыть профиль."}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
