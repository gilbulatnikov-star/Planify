import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaVersion: string | undefined;
};

const SCHEMA_VERSION = "v4"; // Bump when schema changes to force new client

function buildUrl() {
  const base = process.env.DATABASE_URL ?? "";
  if (!base) return base;
  // Always enforce our pool settings — strip any existing values first
  const url = new URL(base);
  url.searchParams.set("connection_limit", "10");
  url.searchParams.set("pool_timeout", "60");
  return url.toString();
}

// If schema version changed, discard old cached client
if (globalForPrisma.prismaVersion !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaVersion = SCHEMA_VERSION;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
