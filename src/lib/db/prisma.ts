import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildUrl() {
  const base = process.env.DATABASE_URL ?? "";
  // Ensure connection pool settings for Neon free tier
  if (base && !base.includes("connection_limit")) {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}connection_limit=3&pool_timeout=30`;
  }
  return base;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
