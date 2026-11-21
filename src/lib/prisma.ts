import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const prismaGlobal = globalThis as unknown as { petroleroPrisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  if (!prismaGlobal.petroleroPrisma) {
    const adapter = new PrismaPg({ connectionString, max: 5 });
    prismaGlobal.petroleroPrisma = new PrismaClient({ adapter });
  }
  return prismaGlobal.petroleroPrisma;
}
