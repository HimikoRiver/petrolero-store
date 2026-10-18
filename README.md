# Petrolero Store

Интернет-магазин моторных масел Petrolero. Next.js 16 (App Router), React 19, TypeScript и Tailwind CSS 4.

## Запуск

```cmd
npm ci
npm run dev
```

Главная: http://localhost:3000/

Сохранённые самостоятельные экраны:
- http://localhost:3000/menu-demo — карточки меню.
- http://localhost:3000/molecules-demo — молекулы и бутылочки.

## Архитектура

- `src/app/` — исключительно роуты и корневой layout.
- `src/features/home/` — композиция главной страницы.
- `src/features/home/hero/` — первый экран, видео и WebGL-волны.
- `src/features/home/header/` — закреплённая шапка, логотип и поиск.
- `src/features/home/story/` — скролл-текст и фон двигателя.
- `src/features/home/advantages/` — будущий блок преимуществ.
- `src/features/menu/` — независимый экран меню, карточки и стили.
- `src/features/molecules/` — независимый экран молекул, canvas и бутылочки.
- `public/menu/images/` — карточки меню.
- `public/molecules/images/` — бутылочки.
- `public/home/advantages/icons/` — место для будущих WebP-иконок.

## Локальные медиа

Два файла использует главная страница, но в GitHub **они не закоммичены**. Не перемещайте их после `git pull`:

- `public/home/video/oil.webm` — интерактивный фон первого экрана.
- `public/home/images/fon2.webp` — фон второго экрана.

В новых блоках размещайте медиа в тематических папках и обновляйте публичный URL в компонентах.

## Проверки

```cmd
npm run lint
npm run build
```

Рефакторинг выполнен в `feature/liquid-intro-prototype`. До него создана резервная ветка `backup/pre-refactor-2026-10-18`.
