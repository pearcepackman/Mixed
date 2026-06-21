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

export async function searchCocktails(userId: string, query: string): Promise<CanMakeResult[]> {
  const db = getPrisma()

  const ownedIds = await db.userIngredient.findMany({
    where: { userId },
    select: { ingredientId: true },
  })

  const owned = new Set(ownedIds.map((r) => r.ingredientId))

  const cocktails = await db.cocktail.findMany({
    where: { name: { contains: query, mode: 'insensitive' } },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      category: true,
      glass: true,
      alcoholic: true,
      instructions: true,
      ingredients: {
        where: { isOptional: false },
        select: {
          measure: true,
          ingredientId: true,
          ingredient: { select: { name: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
    take: 30,
  })

  return cocktails.map((cocktail) => {
    const total = cocktail.ingredients.length
    const missing = cocktail.ingredients
      .filter((ci) => !owned.has(ci.ingredientId))
      .map((ci) => ci.ingredient.name)

    return {
      cocktailId: cocktail.id,
      name: cocktail.name,
      imageUrl: cocktail.imageUrl,
      category: cocktail.category,
      glass: cocktail.glass,
      alcoholic: cocktail.alcoholic,
      instructions: cocktail.instructions,
      totalIngredients: total,
      ownedIngredients: total - missing.length,
      missingIngredients: missing,
      ingredients: cocktail.ingredients.map((ci) => ({
        name: ci.ingredient.name,
        measure: ci.measure,
        owned: owned.has(ci.ingredientId),
      })),
    }
  })
}

export async function removeIngredient(userId: string, userIngredientId: number) {
  const { count } = await getPrisma().userIngredient.deleteMany({
    where: { id: userIngredientId, userId },
  })
  return count > 0
}

export interface CanMakeIngredient {
  name: string
  measure: string | null
  owned: boolean
}

export interface CanMakeResult {
  cocktailId: number
  name: string
  imageUrl: string | null
  category: string | null
  glass: string | null
  alcoholic: boolean
  instructions: string
  totalIngredients: number
  ownedIngredients: number
  missingIngredients: string[]
  ingredients: CanMakeIngredient[]
}

export async function getCanMake(userId: string): Promise<CanMakeResult[]> {
  const db = getPrisma()

  const ownedIds = await db.userIngredient.findMany({
    where: { userId },
    select: { ingredientId: true },
  })

  if (ownedIds.length === 0) return []

  const owned = new Set(ownedIds.map((r) => r.ingredientId))

  const cocktails = await db.cocktail.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true,
      category: true,
      glass: true,
      alcoholic: true,
      instructions: true,
      ingredients: {
        where: { isOptional: false },
        select: {
          measure: true,
          ingredientId: true,
          ingredient: { select: { name: true } },
        },
      },
    },
  })

  const results: CanMakeResult[] = []

  for (const cocktail of cocktails) {
    const total = cocktail.ingredients.length
    if (total === 0) continue

    const missing = cocktail.ingredients
      .filter((ci) => !owned.has(ci.ingredientId))
      .map((ci) => ci.ingredient.name)

    const ownedCount = total - missing.length
    if (ownedCount === 0) continue

    results.push({
      cocktailId: cocktail.id,
      name: cocktail.name,
      imageUrl: cocktail.imageUrl,
      category: cocktail.category,
      glass: cocktail.glass,
      alcoholic: cocktail.alcoholic,
      instructions: cocktail.instructions,
      totalIngredients: total,
      ownedIngredients: ownedCount,
      missingIngredients: missing,
      ingredients: cocktail.ingredients.map((ci) => ({
        name: ci.ingredient.name,
        measure: ci.measure,
        owned: owned.has(ci.ingredientId),
      })),
    })
  }

  return results.sort((a, b) => {
    const aRatio = a.ownedIngredients / a.totalIngredients
    const bRatio = b.ownedIngredients / b.totalIngredients
    if (bRatio !== aRatio) return bRatio - aRatio
    return a.missingIngredients.length - b.missingIngredients.length
  })
}
