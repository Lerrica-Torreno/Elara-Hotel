import { PrismaClient } from '@prisma/client';

// Share one Prisma client across route and service modules.
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});
