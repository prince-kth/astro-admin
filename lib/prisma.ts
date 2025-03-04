import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientConfig)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma