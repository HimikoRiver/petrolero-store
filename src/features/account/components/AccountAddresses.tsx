"use client";

import { useState, type FormEvent } from "react";
import GoldShimmerButton from "@/components/ui/GoldShimmerButton";
import type { DeliveryAddress } from "../data/accountDetails";

type Draft = Omit<DeliveryAddress, "id">;
type Props = { initialAddresses: DeliveryAddress[]; preview: boolean };
type Message = { error: boolean; text: string } | null;

const emptyDraft = (isDefault: boolean): Draft => ({
  label: "Дом",
  recipient: "",
  phone: "",
  city: "",
  street: "",
  apartment: null,
  postalCode: null,
  isDefault,
});

const sortDefault = (a: DeliveryAddress, b: DeliveryAddress) =>
  Number(b.isDefault) - Number(a.isDefault);

export default function AccountAddresses({ initialAddresses, preview }: Props) {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(initialAddresses);
  const [editingId, setEditingId] = useState<string | null>(
    initialAddresses.length ? null : "new",
  );
  const [draft, setDraft] = useState<Draft>(emptyDraft(!initialAddresses.length));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const startAdd = () => {
    setEditingId("new");
    setDraft(emptyDraft(addresses.length === 0));
    setMessage(null);
    setDeleteId(null);
  };
  const startEdit = (address: DeliveryAddress) => {
    const { id: _id, ...values } = address;
    void _id;
    setEditingId(address.id);
    setDraft(values);
    setMessage(null);
    setDeleteId(null);
  };
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft(current => ({ ...current, [key]: value }));

  const refreshAddresses = async () => {
    const response = await fetch("/api/account/addresses", { cache: "no-store" });
    if (!response.ok) throw new Error("Не удалось обновить список адресов.");
    const data: { addresses: DeliveryAddress[] } = await response.json();
    setAddresses([...data.addresses].sort(sortDefault));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || !editingId) return;
    setPending(true);
    setMessage(null);
    try {
      if (preview) {
        const id = editingId === "new" ? "preview-" + Date.now() : editingId;
        const item = { ...draft, id, isDefault: draft.isDefault || addresses.length === 0 };
        setAddresses(current => (
          editingId === "new"
            ? [...current.map(a => item.isDefault ? { ...a, isDefault: false } : a), item]
            : current.map(a => a.id === id ? item : item.isDefault ? { ...a, isDefault: false } : a)
        ).sort(sortDefault));
      } else {
        const response = await fetch("/api/account/addresses", {
          method: editingId === "new" ? "POST" : "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...draft, ...(editingId !== "new" ? { id: editingId } : {}) }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Не удалось сохранить адрес.");
        await refreshAddresses();
      }

      setEditingId(null);
      setMessage({
        error: false,
        text: preview ? "Демоадрес добавлен на экран. После обновления страницы он исчезнет." : "Адрес сохранён.",
      });
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : "Не удалось сохранить адрес." });
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: string) => {
    if (pending) return;
    setPending(true);
    setMessage(null);
    try {
      if (preview) {
        setAddresses(current => {
          const removed = current.find(a => a.id === id);
          const remaining = current.filter(a => a.id !== id);
          if (removed?.isDefault && remaining.length) remaining[0].isDefault = true;
          return [...remaining].sort(sortDefault);
        });
      } else {
        const response = await fetch("/api/account/addresses", {
          method: "DELETE", credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Не удалось удалить адрес.");
        await refreshAddresses();
      }
      if (editingId === id) setEditingId(null);
      setDeleteId(null);
      setMessage({ error: false, text: preview ? "Демоадрес убран." : "Адрес удалён." });
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : "Не удалось удалить адрес." });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="pa-addresses">
      <div className="pa-addresses__toolbar">
        <div className="pa-addresses__count">
          <strong>{addresses.length}</strong>
          <span>{addresses.length === 1 ? "сохранённый адрес" : "адресов в списке"}</span>
        </div>
        {editingId !== "new" && (
          <button className="pa-small-action" type="button" onClick={startAdd} disabled={pending || addresses.length >= 10}>
            + Добавить адрес
          </button>
        )}
      </div>
      {preview && <p className="pa-addresses__notice">Предпросмотр: добавленные здесь адреса существуют только на экране и не сохраняются.</p>}
      {message && <p className="pa-form-message" role={message.error ? "alert" : "status"} data-error={message.error}>{message.text}</p>}

      {addresses.length > 0 && (
        <div className="pa-address-grid">
          {addresses.map(address => (
            <article className="pa-address-card" key={address.id} data-default={address.isDefault}>
              <div className="pa-address-card__top">
                <span className="pa-address-card__label">{address.label}</span>
                {address.isDefault && <span className="pa-address-card__default">Основной</span>}
              </div>
              <p className="pa-address-card__place">{address.city}</p>
              <p className="pa-address-card__street">{address.street}{address.apartment ? ", " + address.apartment : ""}</p>
              <p className="pa-address-card__person">{address.recipient} · {address.phone}</p>
              {address.postalCode && <p className="pa-address-card__postal">Индекс: {address.postalCode}</p>}
              <div className="pa-address-card__actions">
                <button type="button" className="pa-small-action" onClick={() => startEdit(address)} disabled={pending}>Изменить</button>
                <button type="button" className="pa-small-action pa-small-action--muted"
                  onClick={() => setDeleteId(address.id)} disabled={pending}>Удалить</button>
              </div>
              {deleteId === address.id && (
                <div className="pa-address-card__confirm">
                  <p>Удалить этот адрес?</p>
                  <button type="button" onClick={() => remove(address.id)} disabled={pending}>Да, удалить</button>
                  <button type="button" onClick={() => setDeleteId(null)} disabled={pending}>Отмена</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {editingId && (
        <div className="pa-address-editor">
          <div className="pa-address-editor__heading">
            <div>
              <span className="pa-kicker">ДАННЫЕ ДОСТАВКИ</span>
              <h4>{editingId === "new" ? "Новый адрес" : "Редактирование адреса"}</h4>
            </div>
            {(addresses.length > 0 || editingId !== "new") && (
              <button type="button" className="pa-small-action pa-small-action--muted"
                onClick={() => setEditingId(null)} disabled={pending}>Закрыть</button>
            )}
          </div>
          <form className="pa-form" onSubmit={submit}>
            <div className="pa-form-grid">
              <label className="pa-edit-field">
                <span>Название <em>*</em></span>
                <input required maxLength={32} value={draft.label} onChange={e => set("label", e.target.value)} placeholder="Дом, работа…" />
              </label>
              <label className="pa-edit-field">
                <span>Получатель <em>*</em></span>
                <input autoComplete="name" required maxLength={100} value={draft.recipient} onChange={e => set("recipient", e.target.value)} placeholder="Имя и фамилия" />
              </label>
              <label className="pa-edit-field">
                <span>Телефон <em>*</em></span>
                <input type="tel" autoComplete="tel" required maxLength={32} value={draft.phone} onChange={e => set("phone", e.target.value)} placeholder="+7 900 000-00-00" />
              </label>
              <label className="pa-edit-field">
                <span>Город / населённый пункт <em>*</em></span>
                <input autoComplete="address-level2" required maxLength={120} value={draft.city} onChange={e => set("city", e.target.value)} placeholder="Название города" />
              </label>
              <label className="pa-edit-field pa-edit-field--wide">
                <span>Улица, дом, корпус <em>*</em></span>
                <input autoComplete="address-line1" required maxLength={180} value={draft.street} onChange={e => set("street", e.target.value)} placeholder="Улица и номер дома" />
              </label>
              <label className="pa-edit-field">
                <span>Квартира / офис</span>
                <input autoComplete="address-line2" maxLength={50} value={draft.apartment ?? ""} onChange={e => set("apartment", e.target.value)} placeholder="Если есть" />
              </label>
              <label className="pa-edit-field">
                <span>Почтовый индекс</span>
                <input autoComplete="postal-code" maxLength={16} value={draft.postalCode ?? ""} onChange={e => set("postalCode", e.target.value)} placeholder="По желанию" />
              </label>
            </div>
            <label className="pa-checkbox">
              <input type="checkbox" checked={draft.isDefault}
                onChange={e => set("isDefault", e.target.checked)} />
              <span>Использовать как основной адрес доставки</span>
            </label>
            <div className="pa-form-actions">
              <GoldShimmerButton type="submit" disabled={pending}>
                {pending ? "Сохранение…" : editingId === "new" ? "Добавить адрес" : "Сохранить адрес"}
              </GoldShimmerButton>
              {editingId !== "new" && (
                <button className="pa-small-action pa-small-action--muted" type="button"
                  disabled={pending} onClick={() => setEditingId(null)}>Отменить</button>
              )}
            </div>
          </form>
        </div>
      )}

      {!addresses.length && !editingId && (
        <div className="pa-addresses__empty">
          <p>Пока нет адресов доставки. Добавьте первый адрес, чтобы подготовить данные для заказа.</p>
          <button type="button" className="pa-small-action" onClick={startAdd}>Добавить адрес</button>
        </div>
      )}
    </div>
  );
}
