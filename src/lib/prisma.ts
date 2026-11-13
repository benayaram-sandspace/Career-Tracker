import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

// Reuse Prisma instance across warm serverless functions on Vercel
globalForPrisma.prisma = prisma;

export default prisma;
