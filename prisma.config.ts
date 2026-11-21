import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // Client generation in CI does not require a live database connection.
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/petrolero_build_only",
  },
});
