import Link from "next/link";
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
        answer: "Характеристики, объём упаковки, вязкость и допуски должны указываться в карточке товара. Сейчас каталог находится в демонстрационном режиме: перед покупкой данные будут сверены с реальным ассортиментом.",
      },
    ],
  },
  {
    group: "ПОКУПКА И ДОСТАВКА",
    items: [
      {
        question: "Какая служба доставляет заказы?",
        answer: "На действующем сайте Petrolero указана доставка через СДЭК по России. Для нового магазина эта интеграция ещё не подключена. Доступные способы будут подтверждены перед запуском продаж.",
      },
      {
        question: "Как рассчитывается стоимость доставки?",
        answer: "После подключения службы доставки стоимость будет зависеть от состава заказа, региона и способа получения. Итоговая сумма должна отображаться до подтверждения покупки.",
      },
      {
        question: "Можно ли оплатить заказ онлайн?",
        answer: "Для нового магазина планируется приём оплаты через ЮKassa. До подключения и тестирования платёжного сервиса онлайн-оплата недоступна.",
      },
    ],
  },
  {
    group: "ЛИЧНЫЙ КАБИНЕТ",
    items: [
      {
        question: "Зачем нужен личный кабинет?",
        answer: "В кабинете будут храниться история заказов, адреса получения, избранное и настройки уведомлений. Пока эти страницы доступны в режиме предпросмотра.",
      },
      {
        question: "Где посмотреть статус заказа?",
        answer: "После подключения оформления заказов статус покупки появится в разделе «Мои заказы». Сейчас реальные заказы через новый сайт ещё не оформляются.",
      },
      {
        question: "Как обратиться по поводу возврата?",
        answer: "Порядок возврата и контакты ответственного продавца должны быть согласованы до запуска магазина. Общая структура обращения уже представлена в разделе «Гарантия и возврат».",
      },
    ],
  },
] as const;

function ProgressNote() {
  return (
    <div className="ph-notice">
      <strong>Страница готовится к запуску</strong>
      <p>
        Оформление и структура уже созданы. Условия продажи, доставки и возврата
        будут опубликованы в окончательной редакции после согласования с продавцом.
      </p>
    </div>
  );
}

function DeliveryContent() {
  return (
    <div className="ph-content">
      <ProgressNote />
      <section className="ph-article-section">
        <div className="ph-section-number">01 / ДОСТАВКА</div>
        <h2>Получение заказа</h2>
        <p>
          В действующем магазине Petrolero основной способ доставки — СДЭК.
          Для нашего нового сайта подготовлена архитектура расчёта доставки,
          но реальные тарифы и оформление отправлений пока не подключены.
        </p>
        <div className="ph-steps">
          <div><span>01</span><h3>Выберите продукцию</h3><p>Добавьте нужные товары в корзину каталога.</p></div>
          <div><span>02</span><h3>Укажите получателя</h3><p>При оформлении заказа будет доступен ввод адреса и выбор пункта выдачи.</p></div>
          <div><span>03</span><h3>Узнайте стоимость</h3><p>Расчёт доставки появится до подтверждения покупки после подключения СДЭК.</p></div>
        </div>
      </section>
      <section className="ph-article-section">
        <div className="ph-section-number">02 / ОПЛАТА</div>
        <h2>Оплата покупки</h2>
        <p>
          Планируется онлайн-оплата через ЮKassa. На исходном сайте Petrolero
          указана отправка после полной предоплаты. Для нашего магазина порядок
          оплаты и возврата средств будет дополнительно подтверждён заказчиком.
        </p>
        <div className="ph-highlight"><span>БЕЗОПАСНОСТЬ</span><p>Реквизиты банковских карт не будут храниться на сервере магазина. Платёжные данные обрабатывает платёжный провайдер.</p></div>
      </section>
      <section className="ph-article-section">
        <div className="ph-section-number">03 / ОТСЛЕЖИВАНИЕ</div>
        <h2>История заказов</h2>
        <p>
          После оформления и отправки заказа трек-номер, состав покупки и статус
          доставки будут доступны в личном кабинете.
        </p>
        <Link className="ph-action-link" href="/account/preview?section=orders">Посмотреть страницу заказов <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}

function WarrantyContent() {
  return (
    <div className="ph-content">
      <ProgressNote />
      <section className="ph-article-section">
        <div className="ph-section-number">01 / ГАРАНТИЯ</div>
        <h2>Вопросы к качеству товара</h2>
        <p>
          Если обнаружена проблема с продукцией, потребуется описание недостатка
          и информация о покупке. Порядок проверки качества и доступные способы
          урегулирования зависят от характера обращения и применимого законодательства.
        </p>
      </section>
      <section className="ph-article-section">
        <div className="ph-section-number">02 / ОБРАЩЕНИЕ</div>
        <h2>Как подготовить заявку</h2>
        <div className="ph-steps">
          <div><span>01</span><h3>Найдите покупку</h3><p>Сохраните номер заказа или документ, подтверждающий приобретение.</p></div>
          <div><span>02</span><h3>Опишите ситуацию</h3><p>Укажите наименование товара, причину обращения и при необходимости приложите фотографии.</p></div>
          <div><span>03</span><h3>Свяжитесь с продавцом</h3><p>После запуска покупатель сможет отправить обращение из конкретного заказа.</p></div>
        </div>
      </section>
      <section className="ph-article-section">
        <div className="ph-section-number">03 / СРОКИ</div>
        <h2>Обмен и возврат средств</h2>
        <p>
          На действующем сайте встречаются различные формулировки сроков обмена
          и возврата. Перед запуском магазина они будут юридически проверены
          и согласованы с продавцом с учётом категории продукции и способа покупки.
          Пока мы не публикуем неподтверждённые сроки или гарантии возврата денег.
        </p>
        <Link className="ph-action-link" href="/account/preview?section=returns">Посмотреть раздел возвратов <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}

function FaqContent() {
  return (
    <div className="ph-content">
      <div className="ph-notice">
        <strong>Ответы для ознакомления</strong>
        <p>Вопросы о составе и применении продукции сверяются с материалами производителя. Условия нового магазина ещё готовятся к запуску.</p>
      </div>
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
    <main className="ph-page">
      <header className="ph-header">
        <Link href="/" className="ph-brand" aria-label="Petrolero — на главную">PETROLERO<span>.</span></Link>
        <nav className="ph-header__links" aria-label="Навигация магазина">
          <Link href="/catalog">Каталог</Link>
          <Link href="/account/preview">Личный кабинет</Link>
        </nav>
      </header>
      <section className="ph-intro">
        <div className="ph-intro__inner">
          <div className="ph-crumbs"><Link href="/">Главная</Link><span>/</span><span>Информация</span><span>/</span>{page.title}</div>
          <span className="ph-kicker">PETROLERO / ИНФОРМАЦИЯ / {page.number}</span>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
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
      <footer className="ph-footer">
        <Link href="/">PETROLERO</Link>
        <div><Link href="/catalog">Каталог</Link><Link href="/privacy">Конфиденциальность</Link><Link href="/terms">Условия</Link></div>
      </footer>
    </main>
  );
}
