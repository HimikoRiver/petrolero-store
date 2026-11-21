import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI does not automatically read Next.js .env.local files.
// Explicit process environment variables still take precedence in CI/hosting.
loadEnv({ path: [".env.local", ".env"] });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // Client generation in CI does not require a live database connection.
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/petrolero_build_only",
  },
});
