// Prisma client - temporarily mocked for build
// import { PrismaClient } from "@prisma/client";
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };
// export const prisma = globalForPrisma.prisma ?? new PrismaClient();
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const prisma = {
  player: {
    findUnique: async () => null,
    create: async () => null,
    update: async () => null,
  },
  inventoryItem: {},
  playerQuest: {},
  friendship: {},
  gameSession: {},
};
