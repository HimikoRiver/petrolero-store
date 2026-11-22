"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import GoldShimmerButton from "@/components/ui/GoldShimmerButton";
import useDemoCart from "@/features/cart/hooks/useDemoCart";
import type { CatalogProduct } from "@/features/catalog/data/catalogData";
import { priceLabel } from "@/features/catalog/lib/catalogUtils";
import type { DeliveryAddress } from "@/features/account/data/accountDetails";
import "./checkout.css";

type Contact = {
  recipient: string;
  phone: string;
  city: string;
  street: string;
  apartment: string;
  postalCode: string;
  note: string;
};

const blank: Contact = {
  recipient: "", phone: "", city: "", street: "",
  apartment: "", postalCode: "", note: "",
};

export default function CheckoutPage({ catalogProducts }: { catalogProducts: readonly CatalogProduct[] }) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { cartLines, cartCount, cartTotal, cartHydrated, updateQuantity, clearCart } = useDemoCart(catalogProducts);
  const [form, setForm] = useState<Contact>(blank);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);

  const setField = (field: keyof Contact, value: string) =>
    setForm(current => ({ ...current, [field]: value }));

  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch("/api/account/addresses", { cache: "no-store" });
        if (!response.ok) return;
        const result: { addresses: DeliveryAddress[] } = await response.json();
        if (cancelled) return;
        setAddresses(result.addresses);
        if (result.addresses.length) {
          const chosen = result.addresses.find(a => a.isDefault) ?? result.addresses[0];
          setSelectedAddress(chosen.id);
          setForm(current => ({
            ...current,
            recipient: chosen.recipient,
            phone: chosen.phone,
            city: chosen.city,
            street: chosen.street,
            apartment: chosen.apartment ?? "",
            postalCode: chosen.postalCode ?? "",
          }));
        } else {
          setForm(current => ({ ...current, recipient: current.recipient || session.user.name || "" }));
        }
      } catch {
        // The order form stays editable if the saved-address service is unavailable.
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [session?.user?.id, session?.user?.name]);

  const applyAddress = (id: string) => {
    setSelectedAddress(id);
    const address = addresses.find(item => item.id === id);
    if (!address) return;
    setForm(current => ({
      ...current,
      recipient: address.recipient,
      phone: address.phone,
      city: address.city,
      street: address.street,
      apartment: address.apartment ?? "",
      postalCode: address.postalCode ?? "",
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.user || !cartLines.length || !cartHydrated || submittingRef.current) return;
    submittingRef.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/account/demo-orders", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lines: cartLines.map(({ id, quantity }) => ({ id, quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Не удалось сохранить заявку.");
        return;
      }
      clearCart();
      router.push("/account/orders/" + encodeURIComponent(data.order.id));
      router.refresh();
    } catch {
      setError("Не удалось связаться с сервером. Попробуйте ещё раз.");
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  };

  const products = cartLines.map(line => ({
    ...line, product: catalogProducts.find(product => product.id === line.id),
  })).filter((line) => Boolean(line.product));

  return (
    <main className="pt-checkout">
      <div className="pt-checkout__inner">
        <nav className="pt-checkout__breadcrumb" aria-label="Навигация">
          <Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link>
          <span>/</span><span>Оформление</span>
        </nav>
        <header className="pt-checkout__heading">
          <div>
            <span className="pt-checkout__kicker">PETROLERO / ПОКУПКИ / 01</span>
            <h1>Оформление заказа</h1>
            <p>Проверьте состав корзины и укажите данные для доставки.</p>
          </div>
          <span className="pt-checkout__number" aria-hidden="true">01</span>
        </header>

        {!cartHydrated ? (
          <div className="pt-checkout__loading" role="status">Загружаем корзину…</div>
        ) : !products.length ? (
          <section className="pt-checkout__empty">
            <h2>Корзина пуста</h2>
            <p>Добавьте масла или присадки в каталоге, чтобы увидеть оформление заказа.</p>
            <Link href="/catalog" className="pt-checkout__text-link">Перейти в каталог →</Link>
          </section>
        ) : (
          <div className="pt-checkout__columns">
            <section className="pt-checkout__customer" aria-labelledby="pt-checkout-customer-title">
              <span className="pt-checkout__kicker">ШАГ 01 / ПОКУПАТЕЛЬ</span>
              <h2 id="pt-checkout-customer-title">Контактные данные</h2>
              {!sessionPending && !session?.user && (
                <div className="pt-checkout__login-note">
                  Для сохранения заявки войдите в аккаунт.
                  <Link href="/account/login?next=%2Fcheckout">Войти или зарегистрироваться</Link>
                  <small>Корзина сохранится в этом браузере, пока вы входите.</small>
                </div>
              )}
              <form id="pt-checkout-form" onSubmit={submit}>
                {session?.user && addresses.length > 0 && (
                  <label className="pt-checkout__field">
                    <span>Сохранённые адреса</span>
                    <select value={selectedAddress} onChange={e => applyAddress(e.target.value)}>
                      <option value="">Указать другой адрес</option>
                      {addresses.map(address => (
                        <option key={address.id} value={address.id}>
                          {address.label} — {address.city}, {address.street}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="pt-checkout__form-grid">
                  <label className="pt-checkout__field">
                    <span>Имя получателя *</span>
                    <input type="text" autoComplete="name" minLength={2} maxLength={100} required
                      placeholder="Имя и фамилия" value={form.recipient}
                      onChange={e => setField("recipient", e.target.value)} />
                  </label>
                  <label className="pt-checkout__field">
                    <span>Телефон *</span>
                    <input type="tel" autoComplete="tel" minLength={10} maxLength={32} required
                      placeholder="+7 900 000-00-00" value={form.phone}
                      onChange={e => setField("phone", e.target.value)} />
                  </label>
                  <label className="pt-checkout__field">
                    <span>Населённый пункт *</span>
                    <input type="text" autoComplete="address-level2" maxLength={120} required
                      placeholder="Город или посёлок" value={form.city}
                      onChange={e => setField("city", e.target.value)} />
                  </label>
                  <label className="pt-checkout__field">
                    <span>Улица и дом *</span>
                    <input type="text" autoComplete="address-line1" maxLength={180} required
                      placeholder="Улица, дом, корпус" value={form.street}
                      onChange={e => setField("street", e.target.value)} />
                  </label>
                  <label className="pt-checkout__field">
                    <span>Квартира / офис</span>
                    <input type="text" autoComplete="address-line2" maxLength={50}
                      placeholder="Если есть" value={form.apartment}
                      onChange={e => setField("apartment", e.target.value)} />
                  </label>
                  <label className="pt-checkout__field">
                    <span>Почтовый индекс</span>
                    <input type="text" autoComplete="postal-code" maxLength={16}
                      placeholder="Необязательно" value={form.postalCode}
                      onChange={e => setField("postalCode", e.target.value)} />
                  </label>
                  <label className="pt-checkout__field pt-checkout__field--wide">
                    <span>Комментарий к заказу</span>
                    <textarea maxLength={500} rows={3} placeholder="Дополнительные пожелания"
                      value={form.note} onChange={e => setField("note", e.target.value)} />
                  </label>
                </div>
                {error && <p className="pt-checkout__error" role="alert">{error}</p>}
              </form>
            </section>
            <aside className="pt-checkout__summary" aria-label="Состав заказа">
              <span className="pt-checkout__kicker">ШАГ 02 / ПРОВЕРКА</span>
              <h2>Ваш заказ <span>{cartCount}</span></h2>
              <div className="pt-checkout__items">
                {products.map(({ id, quantity, product }) => product && (
                  <article className="pt-checkout__item" key={id}>
                    <div className="pt-checkout__item-image">
                      {product.image ? <Image src={product.image} unoptimized={product.image.startsWith("https://")} alt={product.title} fill
                        sizes="(max-width: 650px) 68px, 80px" /> : <span>Нет фото</span>}
                    </div>
                    <div className="pt-checkout__item-info">
                      <strong>{product.title}</strong>
                      <span>АРТ. {product.sku}</span>
                      <div className="pt-checkout__quantity">
                        <button type="button" onClick={() => updateQuantity(id, -1)}
                          disabled={pending} aria-label={"Уменьшить количество " + product.title}>−</button>
                        <span>{quantity}</span>
                        <button type="button" onClick={() => updateQuantity(id, 1)}
                          disabled={pending || quantity >= 20 || (!product.isDemo && quantity >= product.stockQuantity)} aria-label={"Увеличить количество " + product.title}>+</button>
                      </div>
                    </div>
                    <strong className="pt-checkout__item-price">{priceLabel((product.priceKopecks ?? 0) * quantity)}</strong>
                  </article>
                ))}
              </div>
              <div className="pt-checkout__total">
                <span>Стоимость товаров</span>
                <strong>{priceLabel(cartTotal)}</strong>
              </div>
              {session?.user ? (
                <GoldShimmerButton type="submit" className="pt-checkout__submit"
                  form="pt-checkout-form" disabled={pending || !cartHydrated}>
                  {pending ? "Сохранение…" : "Сохранить заявку"}
                </GoldShimmerButton>
              ) : (
                <Link href="/account/login?next=%2Fcheckout" className="pt-checkout__login-link">
                  Войти для сохранения заказа
                </Link>
              )}
              <p className="pt-checkout__disclaimer">Заявка сохранится в личном кабинете без оплаты и отправки продавцу.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
