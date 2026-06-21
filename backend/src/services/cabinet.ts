import { getPrisma } from '../lib/prisma.js'
import { getClaude } from '../lib/claude.js'
import { getRedis } from '../lib/redis.js'

export async function ensureUser(clerkId: string): Promise<string> {
  const user = await getPrisma().user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId },
    select: { id: true },
  })
  return user.id
}

export async function parseIngredients(rawInput: string): Promise<string[]> {
  const cacheKey = `parse:${rawInput.toLowerCase().trim()}`

  const cached = await getRedis().get<string[]>(cacheKey)
  if (cached) return cached

  const message = await getClaude().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Extract all ingredient, spirit, and mixer names from this cocktail cabinet input. Return ONLY a JSON array of lowercase strings, no explanation, no markdown.\n\nInput: ${rawInput}`,
      },
    ],
  })

  const textBlock = message.content.find((block) => block.type === 'text')
  const raw = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : '[]'
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  let ingredients: string[] = []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      ingredients = parsed.filter((x): x is string => typeof x === 'string').map((s) => s.toLowerCase().trim()).filter(Boolean)
    }
  } catch {
    ingredients = []
  }

  if (ingredients.length > 0) {
    await getRedis().set(cacheKey, ingredients, { ex: 86400 })
  }

  return ingredients
}

export async function addIngredients(userId: string, names: string[]) {
  if (names.length === 0) return []

  await getPrisma().ingredient.createMany({
    data: names.map((name) => ({ name })),
    skipDuplicates: true,
  })

  const ingredients = await getPrisma().ingredient.findMany({
    where: { name: { in: names } },
    select: { id: true, name: true },
  })

  await getPrisma().userIngredient.createMany({
    data: ingredients.map((i) => ({ userId, ingredientId: i.id })),
    skipDuplicates: true,
  })

  return getCabinet(userId)
}

export async function getCabinet(userId: string) {
  const entries = await getPrisma().userIngredient.findMany({
    where: { userId },
    include: { ingredient: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return entries.map((e) => ({
    id: e.id,
    name: e.ingredient.name,
    addedAt: e.createdAt,
  }))
}

export async function removeIngredient(userId: string, userIngredientId: number) {
  const { count } = await getPrisma().userIngredient.deleteMany({
    where: { id: userIngredientId, userId },
  })
  return count > 0
}
