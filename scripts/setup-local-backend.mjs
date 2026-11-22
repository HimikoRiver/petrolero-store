// Set up isolated development services without committing credentials.
// Existing .env.local files are backed up before changing managed variables.
import { randomBytes } from "node:crypto";
import { copyFile, readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";

const envPath = resolve(".env.local");
const switchExisting = process.argv.includes("--switch");
const randomSecret = () => randomBytes(32).toString("hex");

let existing = "";
let hasExisting = false;
try {
  existing = await readFile(envPath, "utf8");
  hasExisting = true;
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const current = parse(existing);
const previousDatabase = current.DATABASE_URL;

if (previousDatabase) {
  let url;
  try {
    url = new URL(previousDatabase);
  } catch {
    console.error("Некорректная DATABASE_URL в .env.local; файл не изменён.");
    process.exit(1);
  }

  const isProjectLocal =
    ["127.0.0.1", "localhost"].includes(url.hostname) &&
    url.port === "55432" &&
    url.pathname === "/petrolero_dev" &&
    url.username === "petrolero_local";

  if (!isProjectLocal && !switchExisting) {
    console.error("В .env.local уже указана другая БД. Чтобы не затронуть её, настройки не изменены.");
    console.error("Для сознательного перехода на изолированную локальную БД: npm run local:setup -- --switch");
    process.exit(1);
  }
}

const databasePassword = current.PETROLERO_LOCAL_DB_PASSWORD || randomSecret();
const authSecret = current.BETTER_AUTH_SECRET?.length >= 32 && !switchExisting
  ? current.BETTER_AUTH_SECRET
  : randomSecret();
const smtpPassword = current.SMTP_PASSWORD && !switchExisting
  ? current.SMTP_PASSWORD
  : randomSecret();

const managed = {
  PETROLERO_LOCAL_DB_PASSWORD: databasePassword,
  DATABASE_URL: "postgresql://petrolero_local:" + databasePassword +
    "@127.0.0.1:55432/petrolero_dev?schema=public",
  CATALOG_SOURCE: "demo",
  BETTER_AUTH_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: authSecret,
  SMTP_HOST: "127.0.0.1",
  SMTP_PORT: "1025",
  SMTP_SECURE: "false",
  SMTP_USER: "petrolero_local",
  SMTP_PASSWORD: smtpPassword,
  SMTP_FROM: "Petrolero Local <noreply@petrolero.test>",
  MAILPIT_URL: "http://127.0.0.1:8025",
};

const managedNames = new Set(Object.keys(managed));
const retained = existing
  .split(/\r?\n/)
  .filter((line) => {
    const key = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=/)?.[1];
    return !key || !managedNames.has(key);
  })
  .join("\n")
  .trimEnd();

const managedLines = Object.entries(managed).map(
  ([key, value]) => key + "=" + JSON.stringify(value),
);
const generated = [
  retained,
  "# Local Petrolero backend (generated; development only, never commit)",
  ...managedLines,
  "",
].filter((line, index) => line !== "" || index !== 0).join("\n");

if (hasExisting) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = envPath + ".backup-" + timestamp;
  await copyFile(envPath, backup);
  console.log("Предыдущий .env.local сохранён в резервную копию (локально).");
}

const temporary = envPath + ".tmp";
try {
  await writeFile(temporary, generated, { encoding: "utf8", mode: 0o600, flag: "wx" });
  await rename(temporary, envPath);
} catch (error) {
  console.error("Не удалось обновить .env.local:", error.message);
  process.exit(1);
}

console.log("Локальная конфигурация готова: PostgreSQL 127.0.0.1:55432, Mailpit 127.0.0.1:8025.");
console.log("CATALOG_SOURCE=demo: витрина останется демонстрационной.");
console.log("Секреты и пароли остаются только в .env.local (игнорируется Git).");
console.log("Далее: npm run local:up && npm run local:db:deploy && npm run local:check");
