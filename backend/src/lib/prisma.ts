import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

let _prisma: PrismaClient | null = null

export function getPrisma(): PrismaClient {
  if (_prisma) return _prisma
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('Missing required environment variable: DATABASE_URL')
  const adapter = new PrismaPg({ connectionString })
  _prisma = new PrismaClient({ adapter })
  return _prisma
}
