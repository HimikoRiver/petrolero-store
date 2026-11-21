import Link from "next/link";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import AccountGoldGears from "@/features/account/components/AccountGoldGears";
import "./help.css";

type HelpTopic = "delivery-payment" | "warranty-returns" | "faq";

const HELP_NAV = [
  { id: "delivery-payment", href: "/help/delivery-payment", title: "Доставка и оплата", number: "01" },
  { id: "warranty-returns", href: "/help/warranty-returns", title: "Гарантия и возврат", number: "02" },
  { id: "faq", href: "/help/faq", title: "Частые вопросы", number: "03" },
] as const;

const HELP_HEADINGS: Record<HelpTopic, { title: string; subtitle: string; number: string }> = {
  "delivery-payment": {
    title: "Доставка и оплата",
    subtitle: "Как покупатель получает заказ, оплачивает покупку и отслеживает отправление.",
    number: "01",
  },
  "warranty-returns": {
    title: "Гарантия и возврат",
    subtitle: "Порядок обращения, если товар не подошёл или возник вопрос к качеству.",
    number: "02",
  },
  faq: {
    title: "Частые вопросы",
    subtitle: "Ответы о продукции Petrolero, заказах и работе магазина.",
    number: "03",
  },
};

const FAQ_CONTENT = [
  {
    group: "ПРОДУКЦИЯ",
    items: [
      {
        question: "Можно ли смешивать разные присадки Petrolero?",
        answer: "Производитель не рекомендует смешивать разные присадки между собой: изменение пропорций может нарушить баланс компонентов. Используйте продукт в соответствии с инструкцией на его упаковке.",
      },
      {
        question: "Как понять, какая присадка подходит двигателю?",
        answer: "Проверьте вязкость используемого моторного масла, его допуски и рекомендации производителя автомобиля. Затем сопоставьте их с назначением и инструкцией конкретного продукта Petrolero.",
      },
      {
        question: "Где посмотреть характеристики масла?",
        answer: "В карточке товара указаны характеристики, объём упаковки, вязкость и допуски. Сверяйте их с требованиями производителя автомобиля.",
      },
    ],
  },
  {
    group: "ПОКУПКА И ДОСТАВКА",
    items: [
      {
        question: "Какая служба доставляет заказы?",
        answer: "Способ получения зависит от региона и состава заказа. При оформлении выбирайте доступный вариант доставки.",
      },
      {
        question: "Как рассчитывается стоимость доставки?",
        answer: "Стоимость доставки зависит от состава заказа, региона и способа получения. Уточните итоговую сумму до оплаты.",
      },
      {
        question: "Можно ли оплатить заказ онлайн?",
        answer: "Способы оплаты и итоговая сумма заказа указываются при оформлении покупки.",
      },
    ],
  },
  {
    group: "ЛИЧНЫЙ КАБИНЕТ",
    items: [
      {
        question: "Зачем нужен личный кабинет?",
        answer: "В личном кабинете удобно просматривать заказы, сохранять адреса, возвращаться к избранным товарам и управлять контактными данными.",
      },
      {
        question: "Где посмотреть статус заказа?",
        answer: "Информация о покупке находится в разделе «Мои заказы».",
      },
      {
        question: "Как обратиться по поводу возврата?",
        answer: "Информация о порядке обращения находится в разделе «Гарантия и возврат».",
      },
    ],
  },
] as const;

function DeliveryContent() {
  return (
    <div className="ph-content">
      <section className="ph-article-section">
        <div className="ph-section-number">01 / ДОСТАВКА</div>
        <h2>Получение заказа</h2>
        <p>
          Доставка заказов осуществляется по России. Стоимость и срок зависят от
          города получения, состава заказа и выбранного способа доставки.
          При оформлении выберите удобный способ получения.
        </p>
        <div className="ph-steps">
          <div><span>01</span><h3>Выберите продукцию</h3><p>Добавьте нужные товары в корзину каталога.</p></div>
          <div><span>02</span><h3>Укажите получателя</h3><p>Укажите адрес доставки или удобный пункт выдачи.</p></div>
          <div><span>03</span><h3>Узнайте стоимость</h3><p>Проверьте стоимость и срок получения перед оплатой.</p></div>
        </div>
      </section>
      <section className="ph-article-section">
        <div className="ph-section-number">02 / ОПЛАТА</div>
        <h2>Оплата покупки</h2>
        <p>
          Оплата заказа производится при его оформлении. После подтверждения
          оплаты покупателю предоставляется информация о заказе и его статусе.
        </p>
        <div className="ph-highlight"><span>БЕЗОПАСНОСТЬ</span><p>Реквизиты банковских карт не будут храниться на сервере магазина. Платёжные данные обрабатывает платёжный провайдер.</p></div>
      </section>
      <section className="ph-article-section">
        <div className="ph-section-number">03 / ОТСЛЕЖИВАНИЕ</div>
        <h2>История заказов</h2>
        <p>
          В разделе «Мои заказы» можно проверить состав покупки,
          статус обработки и данные доставки.
        </p>
        <Link className="ph-action-link petrolero-store-button" href="/account/preview?section=orders">Мои заказы <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}

function WarrantyContent() {
  return (
    <div className="ph-content">
      <section className="ph-article-section">
        <div className="ph-section-number">01 / ГАРАНТИЯ</div>
        <h2>Вопросы к качеству товара</h2>
        <p>
          Если вы обнаружили недостаток товара, подготовьте сведения о покупке
          и описание проблемы. Это поможет продавцу рассмотреть обращение
          и предложить решение в соответствии с законодательством.
        </p>
      </section>
      <section className="ph-article-section">
        <div className="ph-section-number">02 / ОБРАЩЕНИЕ</div>
        <h2>Как подготовить заявку</h2>
        <div className="ph-steps">
          <div><span>01</span><h3>Найдите покупку</h3><p>Сохраните номер заказа или документ, подтверждающий приобретение.</p></div>
          <div><span>02</span><h3>Опишите ситуацию</h3><p>Укажите наименование товара, причину обращения и при необходимости приложите фотографии.</p></div>
          <div><span>03</span><h3>Свяжитесь с продавцом</h3><p>Укажите номер заказа и контактные данные для ответа.</p></div>
        </div>
      </section>
      <section className="ph-article-section">
        <div className="ph-section-number">03 / СРОКИ</div>
        <h2>Обмен и возврат средств</h2>
        <p>
          Условия обмена и возврата зависят от состояния товара, причины обращения
          и обстоятельств покупки. Каждый запрос рассматривается с учётом требований
          законодательства о защите прав потребителей.
        </p>
        <Link className="ph-action-link petrolero-store-button" href="/account/preview?section=returns">Мои обращения <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}

function FaqContent() {
  return (
    <div className="ph-content">
      {FAQ_CONTENT.map((group, groupIndex) => (
        <section className="ph-article-section" key={group.group}>
          <div className="ph-section-number">{String(groupIndex + 1).padStart(2, "0")} / {group.group}</div>
          <div className="ph-faq-list">
            {group.items.map((item, index) => (
              <details key={item.question} className="ph-faq-item">
                <summary>
                  <span className="ph-faq-item__index">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item.question}</span>
                  <span className="ph-faq-item__plus" aria-hidden="true">+</span>
                </summary>
                <div className="ph-faq-item__answer"><p>{item.answer}</p></div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function HelpCenterPage({ topic }: { topic: HelpTopic }) {
  const page = HELP_HEADINGS[topic];

  return (
    <StorefrontChrome>
      <main className="ph-page">
      <section className="ph-intro">
        <div className="ph-intro__inner">
          <div className="ph-crumbs"><Link href="/">Главная</Link><span>/</span><span>Информация</span><span>/</span>{page.title}</div>
          <div className="ph-intro__heading">
            <div className="ph-intro__copy">
              <span className="ph-kicker">PETROLERO / ИНФОРМАЦИЯ / {page.number}</span>
              <h1>{page.title}</h1>
              <p>{page.subtitle}</p>
            </div>
            <AccountGoldGears />
          </div>
          <span className="ph-intro__watermark" aria-hidden="true">{page.number}</span>
        </div>
      </section>
      <div className="ph-layout">
        <aside className="ph-aside">
          <div className="ph-aside__caption">РАЗДЕЛЫ</div>
          <nav aria-label="Справка">
            {HELP_NAV.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                aria-current={item.id === topic ? "page" : undefined}
                className={"ph-aside__link" + (item.id === topic ? " ph-aside__link--active" : "")}
              >
                <span>{item.number}</span><strong>{item.title}</strong><span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
          <div className="ph-aside__contact">
            <span className="ph-kicker">ЕСТЬ ВОПРОС?</span>
            <p>В личном кабинете предусмотрен раздел обращений по покупкам.</p>
            <Link href="/account/preview?section=support">Центр помощи ↗</Link>
          </div>
        </aside>
        {topic === "delivery-payment" && <DeliveryContent />}
        {topic === "warranty-returns" && <WarrantyContent />}
        {topic === "faq" && <FaqContent />}
      </div>
      </main>
    </StorefrontChrome>
  );
}
