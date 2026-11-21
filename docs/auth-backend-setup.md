# Petrolero — серверная авторизация, этап 1

Ветка: `feature/storefront-catalog`. API создан на Better Auth + Prisma ORM 7 + PostgreSQL.

## Уже есть
- Prisma-модели `User`, `Session`, `Account`, `Verification`, SQL-миграция.
- API `/api/auth/[...all]` для входа, регистрации, выхода, email-подтверждения, сброса пароля.
- Сессии через secure cookies; серверная проверка доступа к `/account`.
- Пароли не хранятся в `localStorage`. Регистрация требует подтверждения почты.
- Отдельная страница `/account/reset-password`. SMTP служит для подтверждения и восстановления.
- Без реальной БД/SMTP/секрета API возвращает 503, а не изображает рабочую регистрацию.

## Переменные
Создай `.env.local` по шаблону `.env.example` и заполни реальными значениями (не присылай секреты в чат).
`DATABASE_URL`: только принадлежащая проекту PostgreSQL БД.
`BETTER_AUTH_SECRET`: случайные минимум 32 символа, разные для development и production.
`BETTER_AUTH_URL`: `http://localhost:3000` локально, HTTPS-домен в production.
`SMTP_*`: рабочий SMTP, включая подтверждённый адрес отправителя.

Для Vercel добавь переменные через настройки проекта (Environment Variables).
При переносе существующих пользователей Bitrix потребуется согласованный план миграции; данные оригинального кабинета не находятся в нашей БД.

## CMD (после git pull)
```cmd
npm ci
npm run db:deploy
npm run dev
```
Не запускать `db:deploy` без проверки `DATABASE_URL`: команда применяет миграцию к указанной БД.

## Подключение актуальной локальной видеоформы
```ts
import { authClient } from "@/lib/auth-client";

const signedUp = await authClient.signUp.email({name, email, password});
const signedIn = await authClient.signIn.email({email, password, rememberMe:true});
const resetRequested = await authClient.requestPasswordReset({
  email, redirectTo:"/account/reset-password"
});
const signedOut = await authClient.signOut();
```
Проверяй результат `error`; не показывай успешный вход, если сервер не подтвердил.
После входа переходи на `/account`.

**Важно:** `src/features/account/components/AccountEntryPage.tsx` пока не изменялся, потому что локальная версия пользователя с видео и фоном новее GitHub-версии. Обновлённую страницу входа сначала следует сохранить в ветке. Затем подключить формы к новому auth-client без изменения анимаций.

## Что пока не проверено
Нет реальных PostgreSQL и SMTP, поэтому полный цикл регистрации/получения email/входа не может быть протестирован. Требуются тестовые ресурсы и переменные окружения. Продакшен должен учитывать права доступа, защиту от перебора, локализацию персональных данных в РФ и резервное копирование.
