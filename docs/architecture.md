# Архитектура Petrolero

Проект: **Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS**.

## Правило размещения

- `src/app/` — только маршруты, metadata, root layout и глобальные файлы маршрутизации. Здесь не размещаем бизнес-логику.
- `src/components/layout/` — повторно используемые части оболочки сайта (общая шапка, логотип, футер), без дублирования между страницами.
- `src/features/<domain>/` — функциональные модули. UI, данные и логика одного домена живут рядом.
- `src/hooks/` — переиспользуемые хуки без привязки к конкретному разделу.
- `public/` — публичные оптимизированные изображения, видео и статические файлы.

## Текущая структура

```text
src/
├── app/                         # Next.js routes: /, /catalog, /privacy, /terms ...
├── components/
│   └── layout/
│       ├── header/              # SiteHeader, BrandLogo, HeaderIcons, styles
│       └── footer/              # SiteFooter and styles
├── features/
│   ├── home/                    # Hero, история, технологии, контакты и секции главной
│   ├── catalog/
│   │   ├── components/          # Карточка, галерея, фильтры/категории, быстрый просмотр, сравнение
│   │   ├── data/                # Каталог и конфигурация фильтров
│   │   ├── hooks/               # Контроллер каталога и сохранение избранного/сравнения
│   │   ├── lib/                 # Форматирование цены, получение значений фильтра
│   │   ├── styles/              # base, dialogs, polish, responsive, gallery
│   │   ├── types.ts
│   │   └── CatalogPage.tsx      # Сборка страницы из компонентов
│   ├── cart/
│   │   ├── components/          # CatalogCartDrawer
│   │   ├── hooks/               # useDemoCart с сохранением выбора
│   │   └── types.ts
│   ├── menu/
│   └── molecules/
└── hooks/
    └── useReducedMotion.ts
```

## Границы модулей

1. Страница `/catalog` импортирует `CatalogPage` и хранит только metadata/роутинг.
2. `CatalogPage` использует `useCatalogController`, компоненты каталога, корзины и общий layout.
3. `useDemoCart` не зависит от JSX и принимает только `id` и `priceKopecks` товаров.
4. `useCatalogCollections` отвечает за избранное/сравнение и их локальное сохранение.
5. Идентификаторы ключей `localStorage` сохранены при рефакторинге, чтобы не сбрасывать текущие пользовательские выборы.
6. Стили разделены **без переименования CSS-классов и изменения порядка правил**.
7. Изображения в `public/catalog/icons/` (`car.webp`, `moto.webp`, `truck.webp`) подставляются в `CatalogOilCategories.tsx`.

## Работа над следующими возможностями

Новые функции (`auth`, `account`, `admin`, `checkout`) оформляем отдельными `features` **по мере появления настоящей реализации**, не создавая пустые модули заранее. Для каталога источником данных пока остаётся `features/catalog/data/catalogData.ts`; после появления API этот слой заменяется адаптером к серверу, UI не должен напрямую знать структуру хранения.

## Проверки

- `npm run dev` — локальная разработка.
- `npx next typegen && npx tsc --noEmit` — проверка TypeScript.
- `npm run build` — production-сборка.
- `npm run lint` — анализ ESLint; некоторые правила React Hooks для существующей сложной WebGL/анимационной логики уже выдавали замечания до переноса, их устранение ведём отдельно, без удаления анимаций.

Из-за рассинхронизации старого `package-lock.json` CI временно устанавливает зависимости через `npm install`, а не `npm ci`. При плановом обновлении зависимостей lockfile необходимо пересоздать и зафиксировать.
