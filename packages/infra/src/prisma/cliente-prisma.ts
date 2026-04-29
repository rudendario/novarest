import { PrismaClient } from "@prisma/client";

const globalConPrisma = globalThis as typeof globalThis & {
  clientePrisma?: PrismaClient;
};

export const clientePrisma =
  globalConPrisma.clientePrisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalConPrisma.clientePrisma = clientePrisma;
}
