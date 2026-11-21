// Promote a verified account to administrator. Run locally with database access.
// Usage: node --env-file=.env.local scripts/grant-admin.mjs admin@example.com
import pg from "pg";
const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Укажите почту существующего подтверждённого аккаунта.");
  process.exitCode = 1;
} else if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL не настроена.");
  process.exitCode = 1;
} else {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const result = await client.query(
      'UPDATE "user" SET "role" = $1 WHERE LOWER("email") = $2 AND "emailVerified" = TRUE RETURNING "email"',
      ["ADMIN", email],
    );
    if (result.rowCount !== 1) {
      console.error("Подтверждённый пользователь не найден. Сначала зарегистрируйтесь и подтвердите почту.");
      process.exitCode = 1;
    } else {
      console.log("Роль администратора назначена:", result.rows[0].email);
    }
  } catch (error) {
    console.error("Ошибка подключения к PostgreSQL:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}
