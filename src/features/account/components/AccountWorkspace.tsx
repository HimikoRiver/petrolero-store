import Link from "next/link";
import SignOutButton from "@/features/auth/components/SignOutButton";
import { ACCOUNT_NAVIGATION, accountSectionPath, type AccountSection } from "../data/accountNavigation";
import AccountIcon from "./AccountIcon";
import AccountGoldGears from "./AccountGoldGears";
import AccountOilImpulse from "./AccountOilImpulse";
import AccountFavorites from "./AccountFavorites";
import AccountProfile from "./AccountProfile";
import AccountAddresses from "./AccountAddresses";
import TwoFactorSettings from "./TwoFactorSettings";
import type { DeliveryAddress } from "../data/accountDetails";
import { CATALOG_PRODUCTS, type CatalogProduct } from "@/features/catalog/data/catalogData";
import type { DemoOrder } from "@/features/checkout/types";
import { DemoOrdersList, DemoOrderDetails } from "./DemoOrdersView";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import "../styles/workspace.css";
import "../styles/accountForms.css";
import "../styles/accountOrders.css";
import "../styles/gears.css";

type AccountWorkspaceProps = {
  section: AccountSection;
  preview?: boolean;
  name?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  isAdmin?: boolean;
  phone?: string | null;
  addresses?: DeliveryAddress[];
  catalogProducts?: readonly CatalogProduct[];
  orders?: DemoOrder[];
  order?: DemoOrder | null;
};

const PAGE_COPY: Record<AccountSection, { title: string; subtitle: string; number: string }> = {
  overview: { title: "Личный кабинет", subtitle: "Ваши покупки и сохранённые товары в одном месте.", number: "01" },
  orders: { title: "Мои заказы", subtitle: "Сохранённые заявки и история заказов.", number: "02" },
  "order-detail": { title: "Информация о заказе", subtitle: "Состав заявки и данные получателя.", number: "02" },
  favorites: { title: "Избранное", subtitle: "Товары, к которым хочется вернуться.", number: "03" },
  addresses: { title: "Адреса и получатели", subtitle: "Данные для оформления будущих заказов.", number: "04" },
  profile: { title: "Личные данные", subtitle: "Контактная информация вашего аккаунта.", number: "05" },
  settings: { title: "Уведомления", subtitle: "Сервисные сообщения и рассылки Petrolero.", number: "06" },
  security: { title: "Безопасность", subtitle: "Защита аккаунта и параметры входа.", number: "07" },
  support: { title: "Помощь", subtitle: "Всё необходимое для решения вопросов о заказах.", number: "08" },
  returns: { title: "Возвраты", subtitle: "Обращения по обмену и возврату товаров.", number: "09" },
};

function EmptyState({
  icon, title, description, href, action,
}: {
  icon: "orders" | "pin" | "return";
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="pa-empty">
      <div className="pa-empty__icon"><AccountIcon name={icon} size={34} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && action && (
        <Link className="pa-button pa-button--gold petrolero-store-button" href={href}>
          {action} <AccountIcon name="arrow" size={17} />
        </Link>
      )}
    </div>
  );
}

function Tile({
  id, title, caption, icon, preview,
}: {
  id: AccountSection;
  title: string;
  caption: string;
  icon: "orders" | "heart" | "pin" | "user";
  preview: boolean;
}) {
  return (
    <Link href={accountSectionPath(id, preview)} className="pa-tile">
      <span className="pa-tile__icon"><AccountIcon name={icon} size={27} /></span>
      <span className="pa-tile__body">
        <strong>{title}</strong>
        <span>{caption}</span>
      </span>
      <AccountIcon name="arrow" size={19} className="pa-tile__arrow" />
    </Link>
  );
}

function Field({ title, value, note }: { title: string; value?: string | null; note?: string }) {
  return (
    <div className="pa-field">
      <span className="pa-field__label">{title}</span>
      <span className={value ? "pa-field__value" : "pa-field__value pa-field__value--empty"}>
        {value || "Не указано"}
      </span>
      {note && <span className="pa-field__note">{note}</span>}
    </div>
  );
}

function LinkPanel({
  icon, title, description, href,
}: {
  icon: "help" | "orders" | "return" | "mail";
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="pa-link-panel">
      <span className="pa-link-panel__icon"><AccountIcon name={icon} size={23} /></span>
      <span><strong>{title}</strong><small>{description}</small></span>
      <AccountIcon name="chevron" size={17} />
    </Link>
  );
}

function AccountScreen({
  section, preview, name, email, emailVerified, twoFactorEnabled = false, phone, addresses = [], orders = [], order = null, catalogProducts = CATALOG_PRODUCTS,
}: AccountWorkspaceProps & { preview: boolean }) {
  switch (section) {
    case "overview":
      return (
        <>
          <div className="pa-welcome">
            <div className="pa-welcome__copy">
              <span className="pa-kicker">ВАШЕ ПРОСТРАНСТВО</span>
              <h2>{preview ? "Добро пожаловать в Petrolero" : name ? "Здравствуйте, " + name : "Добро пожаловать"}</h2>
              <p>Переходите к заказам, сохраняйте продукцию и управляйте данными для доставки.</p>
            </div>
            <AccountOilImpulse />
          </div>
          <div className="pa-tiles">
            <Tile id="orders" preview={preview} icon="orders" title="Мои заказы" caption="Покупки и статусы" />
            <Tile id="favorites" preview={preview} icon="heart" title="Избранное" caption="Сохранённые товары" />
            <Tile id="addresses" preview={preview} icon="pin" title="Адреса" caption="Данные для доставки" />
            <Tile id="profile" preview={preview} icon="user" title="Личные данные" caption="Настройки профиля" />
          </div>
          <div className="pa-content-split">
            <section className="pa-surface">
              <div className="pa-surface__heading">
                <div><span className="pa-kicker">ИСТОРИЯ ПОКУПОК</span><h3>Последние заказы</h3></div>
                <Link href={accountSectionPath("orders", preview)} className="pa-text-link">Все заказы <AccountIcon name="arrow" size={16} /></Link>
              </div>
              {orders.length ? (
                <DemoOrdersList orders={orders.slice(0, 3)} compact />
              ) : (
                <div className="pa-compact-empty">
                  <AccountIcon name="bag" size={30} />
                  <p>Заказов пока нет.</p>
                </div>
              )}
            </section>
            <section className="pa-surface pa-surface--guide">
              <span className="pa-kicker">ИНФОРМАЦИЯ</span>
              <h3>Нужна помощь?</h3>
              <p>Условия доставки, оплаты и возврата доступны без регистрации.</p>
              <Link href="/help/delivery-payment" className="pa-text-link">Доставка и оплата <AccountIcon name="arrow" size={16} /></Link>
              <Link href="/help/warranty-returns" className="pa-text-link">Гарантия и возврат <AccountIcon name="arrow" size={16} /></Link>
            </section>
          </div>
        </>
      );
    case "orders":
      return (
        <section className="pa-surface">
          <div className="pa-surface__heading">
            <div><span className="pa-kicker">ЗАКАЗЫ</span><h3>История заказов</h3></div>
            <span className="pa-tag">{orders.length ? orders.length + " записей" : "Нет заказов"}</span>
          </div>
          {orders.length ? (
            <DemoOrdersList orders={orders} />
          ) : (
            <EmptyState
              icon="orders" title="Заказов пока нет"
              description="Сохранённые заявки появятся здесь после заполнения формы."
              href="/catalog" action="Посмотреть каталог"
            />
          )}
        </section>
      );
    case "order-detail":
      return order ? (
        <DemoOrderDetails order={order} />
      ) : (
        <section className="pa-surface">
          <EmptyState
            icon="orders" title="Заказ не найден"
            description="Проверьте номер заказа или вернитесь к истории покупок."
            href={accountSectionPath("orders", preview)} action="К списку заказов"
          />
        </section>
      );
    case "favorites":
      return (
        <section className="pa-surface">
          <div className="pa-surface__heading">
            <div><span className="pa-kicker">ВАШ ВЫБОР</span><h3>Сохранённые товары</h3></div>
          </div>
          <AccountFavorites preview={preview} products={catalogProducts} />
        </section>
      );
    case "addresses":
      return (
        <section className="pa-surface">
          <div className="pa-surface__heading">
            <div><span className="pa-kicker">ДОСТАВКА</span><h3>Мои адреса</h3></div>
            <span className="pa-tag">До 10 адресов</span>
          </div>
          <AccountAddresses initialAddresses={addresses} preview={preview} />
        </section>
      );
    case "profile":
      return (
        <>
          <section className="pa-surface">
            <div className="pa-surface__heading">
              <div><span className="pa-kicker">ПРОФИЛЬ</span><h3>Контактная информация</h3></div>
            </div>
            <AccountProfile preview={preview} name={name ?? null} email={email ?? null} phone={phone ?? null} />
          </section>
          <section className="pa-surface pa-surface--short">
            <span className="pa-kicker">ЗАЩИТА ДАННЫХ</span>
            <h3>Доступ к аккаунту</h3>
            <p>Управление паролем и активными сеансами находится в отдельном разделе.</p>
            <Link href={accountSectionPath("security", preview)} className="pa-text-link">Безопасность <AccountIcon name="arrow" size={16}/></Link>
          </section>
        </>
      );
    case "settings":
      return (
        <section className="pa-surface">
          <div className="pa-surface__heading">
            <div><span className="pa-kicker">НАСТРОЙКИ</span><h3>Сообщения Petrolero</h3></div>
          </div>
          <div className="pa-settings-row">
            <span className="pa-link-panel__icon"><AccountIcon name="orders" size={23}/></span>
            <div><h4>Уведомления о заказах</h4><p>Информация о заказах и статусах ваших заявок.</p></div>
          </div>
          <div className="pa-settings-row">
            <span className="pa-link-panel__icon"><AccountIcon name="mail" size={23}/></span>
            <div><h4>Новости и предложения</h4><p>Новости ассортимента и специальные предложения Petrolero.</p></div>
          </div>
        </section>
      );
    case "security":
      return (
        <>
          <section className="pa-surface">
            <div className="pa-surface__heading">
              <div><span className="pa-kicker">ЗАЩИТА ПРОФИЛЯ</span><h3>Безопасность аккаунта</h3></div>
              <AccountIcon name="shield" size={26} />
            </div>
            <div className="pa-fields">
              <Field title="Адрес для входа" value={preview ? null : email} />
              <Field
                title="Подтверждение e-mail"
                value={preview ? null : emailVerified ? "Подтверждён" : "Не подтверждён"}
              />
            </div>
          </section>
          {!preview && <TwoFactorSettings enabled={twoFactorEnabled} />}
          <section className="pa-surface pa-surface--short">
            <span className="pa-kicker">ВОССТАНОВЛЕНИЕ</span>
            <h3>Забыли пароль?</h3>
            <p>Для восстановления доступа воспользуйтесь формой на странице входа.</p>
            <Link href="/account/login" className="pa-text-link">Страница входа <AccountIcon name="arrow" size={16}/></Link>
          </section>
        </>
      );
    case "support":
      return (
        <section className="pa-surface">
          <div className="pa-surface__heading">
            <div><span className="pa-kicker">ЦЕНТР ПОМОЩИ</span><h3>Чем можем помочь?</h3></div>
          </div>
          <div className="pa-panel-links">
            <LinkPanel icon="orders" href="/help/delivery-payment" title="Доставка и оплата" description="Информация о способах получения и оплаты заказа" />
            <LinkPanel icon="return" href="/help/warranty-returns" title="Гарантия и возврат" description="Порядок обращения по товарам" />
            <LinkPanel icon="help" href="/help/faq" title="Частые вопросы" description="Ответы на вопросы покупателей" />
          </div>
        </section>
      );
    case "returns":
      return (
        <section className="pa-surface">
          <div className="pa-surface__heading">
            <div><span className="pa-kicker">ОБРАЩЕНИЯ</span><h3>Возвраты и обмен</h3></div>
            <span className="pa-tag">Нет заявок</span>
          </div>
          <EmptyState
            icon="return" title="Заявок пока нет"
            description="Здесь будут отображаться ваши обращения по обмену и возврату."
            href="/help/warranty-returns" action="Порядок возврата"
          />
        </section>
      );
  }
}

export default function AccountWorkspace({
  section, preview = false, name = null, email = null, emailVerified = false, twoFactorEnabled = false, isAdmin = false, phone = null, addresses = [], orders = [], order = null, catalogProducts = CATALOG_PRODUCTS,
}: AccountWorkspaceProps) {
  const page = PAGE_COPY[section];
  const currentNav = section === "order-detail" ? "orders" : section;

  return (
    <StorefrontChrome>
      <main className="pa-workspace pa-workspace--gears">
      <div className="pa-body">
        <aside className="pa-sidebar">
          <div className="pa-sidebar__identity">
            <div className="pa-avatar" aria-hidden="true">{!preview && name ? name.trim().charAt(0).toLocaleUpperCase("ru") : "P"}</div>
            <div>
              <span className="pa-kicker">ЛИЧНЫЙ КАБИНЕТ</span>
              <strong>{preview ? "Покупатель Petrolero" : name || "Покупатель Petrolero"}</strong>
              {!preview && email && <small>{email}</small>}
            </div>
          </div>
          <div className="pa-sidebar__title">РАЗДЕЛЫ КАБИНЕТА</div>
          <nav className="pa-navigation" aria-label="Разделы личного кабинета">
            {!preview && isAdmin && (
              <Link href="/admin" className="pa-navlink pa-navlink--admin">
                <span className="pa-navlink__icon"><AccountIcon name="shield" size={19} /></span>
                <span className="pa-navlink__label">Админ-панель</span>
                <AccountIcon name="arrow" size={16} className="pa-navlink__admin-arrow" />
              </Link>
            )}
            {ACCOUNT_NAVIGATION.map((item, index) => (
              <Link
                key={item.id}
                href={accountSectionPath(item.id, preview)}
                className={"pa-navlink" + (currentNav === item.id ? " pa-navlink--active" : "")}
                aria-current={currentNav === item.id ? "page" : undefined}
              >
                <span className="pa-navlink__icon"><AccountIcon name={item.icon} size={19} /></span>
                <span className="pa-navlink__label">{item.title}</span>
                <span className="pa-navlink__number">{String(index + 1).padStart(2, "0")}</span>
              </Link>
            ))}
          </nav>
          <div className="pa-sidebar__bottom">
            {preview ? (
              <Link className="pa-sidebar__exit" href="/account/login">Войти в аккаунт <AccountIcon name="arrow" size={17}/></Link>
            ) : (
              <SignOutButton />
            )}
          </div>
        </aside>
        <div className="pa-main">
          <div className="pa-main__inner">
            <div className="pa-breadcrumb">
              <Link href={accountSectionPath("overview", preview)}>Личный кабинет</Link>
              <AccountIcon name="chevron" size={14} />
              <span>{page.title}</span>
            </div>
            <div className="pa-page-heading pa-page-heading--gears">
              <div className="pa-page-heading__copy">
                <span className="pa-kicker">PETROLERO / АККАУНТ / {page.number}</span>
                <h1>{page.title}</h1>
                <p>{page.subtitle}</p>
              </div>
              <AccountGoldGears />
              <span className="pa-page-heading__number" aria-hidden="true">{page.number}</span>
            </div>
            <div className="pa-screen">
              <AccountScreen section={section} preview={preview} name={name} email={email} emailVerified={emailVerified} twoFactorEnabled={twoFactorEnabled} phone={phone} addresses={addresses} orders={orders} order={order} catalogProducts={catalogProducts}/>
            </div>
          </div>
        </div>
      </div>
      </main>
    </StorefrontChrome>
  );
}
