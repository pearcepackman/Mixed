import { getPrisma } from '../lib/prisma.js'

export interface LogEntry {
  id: number
  cocktailId: number
  cocktailName: string
  cocktailImageUrl: string | null
  cocktailCategory: string | null
  rating: number | null
  notes: string | null
  loggedAt: string
}

export interface LogStats {
  total: number
  averageRating: number | null
  topCategory: string | null
}

const logSelect = {
  id: true,
  rating: true,
  notes: true,
  loggedAt: true,
  cocktail: {
    select: { id: true, name: true, imageUrl: true, category: true },
  },
} as const

function formatEntry(l: {
  id: number
  rating: number | null
  notes: string | null
  loggedAt: Date
  cocktail: { id: number; name: string; imageUrl: string | null; category: string | null }
}): LogEntry {
  return {
    id: l.id,
    cocktailId: l.cocktail.id,
    cocktailName: l.cocktail.name,
    cocktailImageUrl: l.cocktail.imageUrl,
    cocktailCategory: l.cocktail.category,
    rating: l.rating,
    notes: l.notes,
    loggedAt: l.loggedAt.toISOString(),
  }
}

export async function createLog(
  userId: string,
  cocktailId: number,
  rating: number | null,
  notes: string | null,
): Promise<LogEntry> {
  const entry = await getPrisma().drinkLog.create({
    data: { userId, cocktailId, rating, notes },
    select: logSelect,
  })
  return formatEntry(entry)
}

export async function getLogs(userId: string): Promise<{ logs: LogEntry[]; stats: LogStats }> {
  const rows = await getPrisma().drinkLog.findMany({
    where: { userId },
    orderBy: { loggedAt: 'desc' },
    take: 100,
    select: logSelect,
  })

  const logs = rows.map(formatEntry)

  const total = logs.length
  const rated = logs.filter((l) => l.rating != null)
  const averageRating =
    rated.length > 0 ? rated.reduce((sum, l) => sum + l.rating!, 0) / rated.length : null

  const categoryCount = new Map<string, number>()
  for (const log of logs) {
    if (log.cocktailCategory) {
      categoryCount.set(log.cocktailCategory, (categoryCount.get(log.cocktailCategory) ?? 0) + 1)
    }
  }
  const topCategory =
    categoryCount.size > 0
      ? [...categoryCount.entries()].sort((a, b) => b[1] - a[1])[0][0]
      : null

  return { logs, stats: { total, averageRating, topCategory } }
}

export async function deleteLog(userId: string, logId: number): Promise<boolean> {
  const { count } = await getPrisma().drinkLog.deleteMany({
    where: { id: logId, userId },
  })
  return count > 0
}
