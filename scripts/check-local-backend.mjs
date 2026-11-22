// Validate the local-only target before applying migrations, and health-check
// PostgreSQL + Mailpit after migrations. Never writes application data.
import pg from "pg";

const targetOnly = process.argv.includes("--target-only");
const value = process.env.DATABASE_URL;
const expectedPassword = process.env.PETROLERO_LOCAL_DB_PASSWORD;

function fail(message) {
  console.error("Ошибка локальной конфигурации: " + message);
  process.exit(1);
}

if (!value || !expectedPassword) {
  fail("сначала запусти npm run local:setup.");
}

let url;
try {
  url = new URL(value);
} catch {
  fail("DATABASE_URL имеет неверный формат.");
}

if (
  !["postgresql:", "postgres:"].includes(url.protocol) ||
  !["127.0.0.1", "localhost"].includes(url.hostname) ||
  url.port !== "55432" ||
  url.pathname !== "/petrolero_dev" ||
  url.username !== "petrolero_local" ||
  decodeURIComponent(url.password) !== expectedPassword
) {
  fail("DATABASE_URL указывает не на изолированную БД Petrolero на 127.0.0.1:55432. Миграции запрещены.");
}
if (process.env.CATALOG_SOURCE !== "demo") {
  fail("CATALOG_SOURCE должен оставаться demo на этапе локальной настройки.");
}
if (process.env.BETTER_AUTH_URL !== "http://localhost:3000" ||
    !process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  fail("проверь локальные BETTER_AUTH_URL и BETTER_AUTH_SECRET.");
}
if (
  process.env.SMTP_HOST !== "127.0.0.1" ||
  process.env.SMTP_PORT !== "1025" ||
  process.env.SMTP_SECURE !== "false" ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASSWORD ||
  !process.env.SMTP_FROM
) {
  fail("локальная SMTP-конфигурация Mailpit неполна.");
}

console.log("✓ Миграции разрешены только для локальной PostgreSQL petrolero_dev (порт 55432).");
if (targetOnly) process.exit(0);

const client = new pg.Client({ connectionString: value, connectionTimeoutMillis: 5000 });

try {
  await client.connect();
  const identity = await client.query("SELECT current_database() AS database, current_user AS username");
  if (identity.rows[0]?.database !== "petrolero_dev" ||
      identity.rows[0]?.username !== "petrolero_local") {
    fail("подключение привело в неожиданную базу или роль.");
  }

  const requiredTables = [
    "user", "session", "account", "verification",
    "twoFactor", "delivery_address", "favorite", "demo_order",
    "demo_order_item", "product", "_prisma_migrations",
  ];
  const result = await client.query(
    "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = ANY($1::text[])",
    [requiredTables],
  );
  const found = new Set(result.rows.map((row) => row.tablename));
  const missing = requiredTables.filter((name) => !found.has(name));
  if (missing.length) {
    fail("не хватает таблиц: " + missing.join(", ") +
      ". Запусти npm run local:db:deploy.");
  }
  console.log("✓ PostgreSQL подключена, " + requiredTables.length +
    " обязательных таблиц доступны.");
} catch (error) {
  fail("PostgreSQL недоступна или схема не готова: " + error.message);
} finally {
  await client.end().catch(() => {});
}

try {
  const response = await fetch("http://127.0.0.1:8025/api/v1/messages", {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) fail("Mailpit HTTP " + response.status);
  console.log("✓ Mailpit готов: http://127.0.0.1:8025");
} catch (error) {
  fail("Mailpit недоступен: " + error.message);
}

console.log("✓ Локальные сервисы готовы. Запусти npm run dev, затем открой /account/login.");
console.log("✓ Письма подтверждения и сброса пароля появятся только в интерфейсе Mailpit.");
