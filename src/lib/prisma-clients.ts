import { PrismaClient } from '@prisma/client';

// Local PostgreSQL client
declare global {
  // eslint-disable-next-line no-var
  var localPrisma: PrismaClient | undefined;
}

// Local PostgreSQL client
export const db = global.localPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.localPrisma = db;
}
