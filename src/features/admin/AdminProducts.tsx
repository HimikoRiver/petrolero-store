"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import GoldShimmerButton from "@/components/ui/GoldShimmerButton";
import type { ProductInput } from "@/lib/product-validation";
import "./admin.css";

type Product = ProductInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

const CATEGORIES: { value: ProductInput["category"]; title: string }[] = [
  { value: "passenger", title: "Легковые" },
  { value: "motorcycle", title: "Мото" },
  { value: "commercial", title: "Грузовые" },
  { value: "additives", title: "Присадки" },
];
const PACKAGING: { value: ProductInput["packaging"]; title: string }[] = [
  { value: "canister", title: "Канистра" },
  { value: "drum", title: "Бочка" },
  { value: "bottle", title: "Флакон" },
];

const empty: ProductInput = {
  title: "", slug: "", sku: "", category: "passenger",
  description: "", packaging: "canister", image: null, galleryImages: [],
  priceKopecks: null, stockQuantity: 0, published: false,
  viscosity: null, volumeLiters: null,
  acea: [], api: [], approvals: [], ilsac: [],
};

function slugify(value: string) {
  const rus = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
  const lat = ["a","b","v","g","d","e","e","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","h","ts","ch","sh","shch","","y","","e","yu","ya"];
  return value.trim().toLowerCase().split("").map(c => {
    const index = rus.indexOf(c);
    return index < 0 ? c : lat[index];
  }).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function rubles(value: number | null) {
  return value === null ? "Цена не указана" : new Intl.NumberFormat("ru-RU", {
    style: "currency", currency: "RUB", maximumFractionDigits: 2,
  }).format(value / 100);
}

function readableDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    cache: "no-store",
    credentials: "same-origin",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
  });
  let result: Record<string, unknown> = {};
  try { result = await response.json(); } catch { /* invalid response */ }
  if (!response.ok) throw new Error(typeof result.error === "string"
    ? result.error : "Ошибка соединения с сервером.");
  return result;
}

type ActiveEditor = { id: string | null; draft: ProductInput };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [editor, setEditor] = useState<ActiveEditor | null>(null);

  const reload = useCallback(async () => {
    setError("");
    try {
      const result = await api("/api/admin/products");
      setProducts(result.products as Product[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось получить товары.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  useEffect(() => {
    if (!editor) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) setEditor(null);
    };
    document.addEventListener("keydown", onEscape);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = previous;
    };
  }, [editor, pending]);

  const stats = useMemo(() => ({
    all: products.length,
    published: products.filter(p => p.published).length,
    draft: products.filter(p => !p.published).length,
    out: products.filter(p => p.stockQuantity === 0).length,
  }), [products]);

  const filtered = useMemo(() => products.filter(p => (
    (status === "all" || p.published === (status === "published")) &&
    [p.title, p.sku, p.slug].join(" ").toLowerCase().includes(search.trim().toLowerCase())
  )), [products, status, search]);

  const set = <K extends keyof ProductInput>(field: K, value: ProductInput[K]) =>
    setEditor(current => current && ({
      ...current, draft: { ...current.draft, [field]: value },
    }));

  const startNew = () => {
    setError(""); setNotice("");
    setEditor({ id: null, draft: { ...empty, galleryImages: [], acea: [], api: [], approvals: [], ilsac: [] } });
  };
  const startEdit = (product: Product) => {
    setError(""); setNotice("");
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, archivedAt: _archivedAt, ...draft } = product;
    void _id; void _createdAt; void _updatedAt; void _archivedAt;
    setEditor({ id: product.id, draft });
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor || pending) return;
    setPending(true); setError(""); setNotice("");
    try {
      const path = editor.id
        ? "/api/admin/products/" + encodeURIComponent(editor.id)
        : "/api/admin/products";
      const result = await api(path, {
        method: editor.id ? "PUT" : "POST",
        body: JSON.stringify(editor.draft),
      });
      setNotice("Карточка «" + (result.product as Product).title + "» сохранена.");
      setEditor(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить товар.");
    } finally {
      setPending(false);
    }
  };

  const archive = async (product: Product) => {
    if (pending || !window.confirm("Убрать «" + product.title + "» из каталога и архива? История заказов останется доступной.")) return;
    setPending(true); setError(""); setNotice("");
    try {
      await api("/api/admin/products/" + encodeURIComponent(product.id), { method: "DELETE" });
      setNotice("Товар перенесён в архив.");
      setEditor(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось архивировать товар.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="pt-admin">
      <div className="pt-admin__layout">
        <nav className="pt-admin__breadcrumbs">
          <Link href="/">Petrolero</Link><span>/</span><span>Администрирование</span>
        </nav>
        <header className="pt-admin__header">
          <div>
            <span className="pt-admin__kicker">PETROLERO / ПАНЕЛЬ УПРАВЛЕНИЯ</span>
            <h1>Управление товарами<span>.</span></h1>
            <p>Добавление и редактирование продукции, контроль остатков и публикация в каталоге.</p>
          </div>
          <GoldShimmerButton type="button" onClick={startNew}>+ Новый товар</GoldShimmerButton>
        </header>

        <div className="pt-admin__stats">
          <div><span>ВСЕ ТОВАРЫ</span><strong>{stats.all}</strong></div>
          <div><span>ОПУБЛИКОВАНО</span><strong>{stats.published}</strong></div>
          <div><span>ЧЕРНОВИКИ</span><strong>{stats.draft}</strong></div>
          <div><span>НЕТ В НАЛИЧИИ</span><strong>{stats.out}</strong></div>
        </div>

        <div className="pt-admin__toolbar">
          <label>
            <span className="pt-admin__sr-only">Поиск товара</span>
            <input type="search" value={search} onChange={event => setSearch(event.target.value)}
              placeholder="Поиск по названию, артикулу или адресу…" />
          </label>
          <div className="pt-admin__tabs" role="group" aria-label="Фильтр по статусу">
            {([["all","Все"],["published","Опубликованные"],["draft","Черновики"]] as const).map(([key,label]) => (
              <button type="button" key={key} aria-pressed={status === key}
                onClick={() => setStatus(key)}>{label}</button>
            ))}
          </div>
        </div>

        {notice && <div className="pt-admin__message" role="status">{notice}</div>}
        {error && <div className="pt-admin__message pt-admin__message--error" role="alert">{error}</div>}

        {loading ? (
          <p className="pt-admin__placeholder" role="status">Загрузка товаров…</p>
        ) : filtered.length ? (
          <div className="pt-admin__table" aria-label="Список товаров">
            <div className="pt-admin__table-head">
              <span>ПРОДУКЦИЯ</span><span>КАТЕГОРИЯ</span><span>ЦЕНА</span><span>ОСТАТОК</span><span>СТАТУС</span><span>ДЕЙСТВИЯ</span>
            </div>
            {filtered.map(product => (
              <article className="pt-admin__product" key={product.id}>
                <div className="pt-admin__product-main">
                  <div className="pt-admin__thumb">
                    {product.image ? <Image src={product.image} alt={product.title} unoptimized fill sizes="70px" /> : <span>Нет фото</span>}
                  </div>
                  <div><strong>{product.title}</strong><small>{product.sku}</small><small>Изменён: {readableDate(product.updatedAt)}</small></div>
                </div>
                <span className="pt-admin__category">{CATEGORIES.find(x => x.value === product.category)?.title ?? product.category}</span>
                <span className="pt-admin__price">{rubles(product.priceKopecks)}</span>
                <span className="pt-admin__stock">{product.stockQuantity} шт.</span>
                <span className={"pt-admin__status"+(product.published ? " is-live" : "")}>{product.published ? "На сайте" : "Черновик"}</span>
                <div className="pt-admin__actions">
                  <button type="button" onClick={() => startEdit(product)}>Изменить</button>
                  <button type="button" className="pt-admin__archive" onClick={() => void archive(product)} disabled={pending}>Архив</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="pt-admin__empty">
            <h2>{products.length ? "По запросу ничего не найдено" : "Здесь появятся ваши товары"}</h2>
            <p>{products.length ? "Попробуйте изменить фильтры." : "Создайте первый товар. Пока вы не опубликуете его, он не появится в магазине."}</p>
            {!products.length && <button type="button" onClick={startNew}>Создать карточку товара</button>}
          </div>
        )}

        <p className="pt-admin__footnote">
          Каталог получает опубликованные товары из PostgreSQL. Архивирование скрывает карточку, но сохраняет историю тестовых заказов.
        </p>
      </div>

      {editor && (
        <div className="pt-admin__overlay" onPointerDown={e => {
          if (e.target === e.currentTarget && !pending) setEditor(null);
        }}>
          <aside className="pt-admin__editor" role="dialog" aria-modal="true" aria-labelledby="pt-admin-editor-title">
            <header className="pt-admin__editor-head">
              <div>
                <span className="pt-admin__kicker">УПРАВЛЕНИЕ КАТАЛОГОМ</span>
                <h2 id="pt-admin-editor-title">{editor.id ? "Редактирование товара" : "Новый товар"}</h2>
              </div>
              <button type="button" aria-label="Закрыть" onClick={() => setEditor(null)} disabled={pending}>×</button>
            </header>
            <form className="pt-admin__form" onSubmit={e => void save(e)}>
              <fieldset disabled={pending}>
                <div className="pt-admin__form-section">
                  <h3>Основная информация</h3>
                  <div className="pt-admin__form-grid">
                    <label className="pt-admin__wide">
                      <span>Название товара *</span>
                      <input required minLength={3} maxLength={180} value={editor.draft.title}
                        placeholder="PETROLERO FUSION 5W-30" onChange={e => {
                          const title=e.target.value;
                          setEditor(current => current ? ({
                            ...current, draft: { ...current.draft, title,
                              slug: current.draft.slug === slugify(current.draft.title)
                                ? slugify(title) : current.draft.slug },
                          }) : current);
                        }}/>
                    </label>
                    <label><span>Артикул (SKU) *</span>
                      <input required maxLength={80} value={editor.draft.sku} placeholder="PT-530-4L"
                        onChange={e => set("sku", e.target.value.toUpperCase())}/>
                    </label>
                    <label><span>Ссылка / slug *</span>
                      <input required maxLength={120} value={editor.draft.slug} placeholder="petrolero-fusion-5w30"
                        onChange={e => set("slug", slugify(e.target.value))}/>
                    </label>
                    <label><span>Категория *</span>
                      <select value={editor.draft.category} onChange={e => set("category", e.target.value as ProductInput["category"])}>
                        {CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.title}</option>)}
                      </select>
                    </label>
                    <label><span>Тип упаковки *</span>
                      <select value={editor.draft.packaging} onChange={e => set("packaging", e.target.value as ProductInput["packaging"])}>
                        {PACKAGING.map(c=><option key={c.value} value={c.value}>{c.title}</option>)}
                      </select>
                    </label>
                    <label className="pt-admin__wide"><span>Описание *</span>
                      <textarea required minLength={10} maxLength={3000} rows={4}
                        value={editor.draft.description} onChange={e => set("description", e.target.value)}
                        placeholder="Описание масла, его назначение и особенности…"/>
                    </label>
                  </div>
                </div>

                <div className="pt-admin__form-section">
                  <h3>Стоимость и наличие</h3>
                  <div className="pt-admin__form-grid">
                    <label><span>Цена, ₽</span>
                      <input type="number" min={0} max={10000000} step=".01" inputMode="decimal"
                        value={editor.draft.priceKopecks === null ? "" : editor.draft.priceKopecks/100}
                        placeholder="Не указана"
                        onChange={e => set("priceKopecks", e.target.value === "" ? null : Math.round(Number(e.target.value)*100))}/>
                    </label>
                    <label><span>Остаток, шт. *</span>
                      <input type="number" min={0} max={1000000} step={1} required
                        value={editor.draft.stockQuantity}
                        onChange={e => set("stockQuantity", Number(e.target.value))}/>
                    </label>
                  </div>
                </div>

                <div className="pt-admin__form-section">
                  <h3>Изображения</h3>
                  <p className="pt-admin__help">Укажите HTTPS-ссылку на изображение или путь к файлу из папки public (например, /catalog/products/oils/canister.webp). Загрузка файлов с компьютера потребует подключения облачного хранилища.</p>
                  <div className="pt-admin__image-row">
                    <div className="pt-admin__preview">
                      {editor.draft.image ? <Image src={editor.draft.image} alt="Предпросмотр товара" fill unoptimized sizes="140px"/> : <span>ФОТО ТОВАРА</span>}
                    </div>
                    <label><span>Главное изображение *</span>
                      <input value={editor.draft.image ?? ""} placeholder="/catalog/products/..."
                        onChange={e => set("image", e.target.value || null)}/>
                    </label>
                  </div>
                  <label><span>Дополнительные изображения</span>
                    <textarea rows={3} value={editor.draft.galleryImages.join("\n")}
                      onChange={e => set("galleryImages",e.target.value.split(/\r?\n/).map(v=>v.trim()).filter(Boolean))}
                      placeholder="Одна ссылка в каждой строке, до 10 изображений"/>
                  </label>
                </div>

                <div className="pt-admin__form-section">
                  <h3>Характеристики</h3>
                  <div className="pt-admin__form-grid">
                    <label><span>Вязкость</span>
                      <input value={editor.draft.viscosity ?? ""} maxLength={50} placeholder="5W-30"
                        onChange={e => set("viscosity",e.target.value || null)}/>
                    </label>
                    <label><span>Объём, л</span>
                      <input type="number" min={0.01} max={100000} step="any" value={editor.draft.volumeLiters ?? ""}
                        placeholder="4" onChange={e => set("volumeLiters",e.target.value === "" ? null : Number(e.target.value))}/>
                    </label>
                    {(["acea","api","approvals","ilsac"] as const).map(key=>(
                      <label key={key}><span>{key === "approvals" ? "Допуски" : key.toUpperCase()} · через запятую</span>
                        <textarea rows={2} value={editor.draft[key].join(", ")}
                          onChange={e => set(key,e.target.value.split(",").map(x=>x.trim()).filter(Boolean))}/>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-admin__publication">
                  <label>
                    <input type="checkbox" checked={editor.draft.published}
                      onChange={e => set("published", e.target.checked)}/>
                    <span><strong>Опубликовать в каталоге</strong>
                      <small>Черновик не виден покупателям. Для публикации требуются цена и главное изображение.</small>
                    </span>
                  </label>
                </div>
              </fieldset>
              {error && <p className="pt-admin__form-error" role="alert">{error}</p>}
              <footer className="pt-admin__editor-footer">
                <button type="button" disabled={pending} onClick={() => setEditor(null)}>Отмена</button>
                <GoldShimmerButton type="submit" disabled={pending}>
                  {pending ? "Сохранение…" : editor.id ? "Сохранить товар" : "Создать товар"}
                </GoldShimmerButton>
              </footer>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}
