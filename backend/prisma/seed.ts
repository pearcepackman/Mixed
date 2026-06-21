import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

interface CocktailDBDrink {
  idDrink: string
  strDrink: string
  strCategory: string | null
  strAlcoholic: string | null
  strGlass: string | null
  strInstructions: string | null
  strDrinkThumb: string | null
  strIngredient1: string | null
  strIngredient2: string | null
  strIngredient3: string | null
  strIngredient4: string | null
  strIngredient5: string | null
  strIngredient6: string | null
  strIngredient7: string | null
  strIngredient8: string | null
  strIngredient9: string | null
  strIngredient10: string | null
  strIngredient11: string | null
  strIngredient12: string | null
  strIngredient13: string | null
  strIngredient14: string | null
  strIngredient15: string | null
  strMeasure1: string | null
  strMeasure2: string | null
  strMeasure3: string | null
  strMeasure4: string | null
  strMeasure5: string | null
  strMeasure6: string | null
  strMeasure7: string | null
  strMeasure8: string | null
  strMeasure9: string | null
  strMeasure10: string | null
  strMeasure11: string | null
  strMeasure12: string | null
  strMeasure13: string | null
  strMeasure14: string | null
  strMeasure15: string | null
}

async function fetchByLetter(letter: string): Promise<CocktailDBDrink[]> {
  const res = await fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`,
  )
  const data = (await res.json()) as { drinks: CocktailDBDrink[] | null }
  return data.drinks ?? []
}

function extractIngredients(
  drink: CocktailDBDrink,
): { name: string; measure: string | null }[] {
  const pairs: { name: string; measure: string | null }[] = []
  for (let i = 1; i <= 15; i++) {
    const name =
      drink[`strIngredient${i}` as keyof CocktailDBDrink]?.trim() ?? ''
    if (!name) break
    const measure =
      drink[`strMeasure${i}` as keyof CocktailDBDrink]?.trim() || null
    pairs.push({ name, measure })
  }
  return pairs
}

async function main() {
  console.log('Seeding from TheCocktailDB...')

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const allDrinks: CocktailDBDrink[] = []

  for (const letter of letters) {
    const drinks = await fetchByLetter(letter)
    allDrinks.push(...drinks)
    process.stdout.write(`${letter}(${drinks.length}) `)
  }
  console.log(`\nFetched ${allDrinks.length} cocktails`)

  // Collect all unique ingredient names first
  const ingredientNames = new Set<string>()
  for (const drink of allDrinks) {
    for (const { name } of extractIngredients(drink)) {
      ingredientNames.add(name.toLowerCase())
    }
  }

  // Upsert all ingredients
  console.log(`Upserting ${ingredientNames.size} ingredients...`)
  for (const name of ingredientNames) {
    await prisma.ingredient.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // Build ingredient name → id map
  const ingredients = await prisma.ingredient.findMany()
  const ingredientMap = new Map(ingredients.map((i) => [i.name, i.id]))

  // Upsert cocktails + their ingredients
  console.log('Upserting cocktails...')
  let count = 0
  for (const drink of allDrinks) {
    if (!drink.strInstructions) continue

    const cocktailId = parseInt(drink.idDrink, 10)
    const pairs = extractIngredients(drink)

    await prisma.cocktail.upsert({
      where: { id: cocktailId },
      update: {
        name: drink.strDrink,
        category: drink.strCategory,
        alcoholic: drink.strAlcoholic !== 'Non alcoholic',
        glass: drink.strGlass,
        instructions: drink.strInstructions,
        imageUrl: drink.strDrinkThumb,
      },
      create: {
        id: cocktailId,
        name: drink.strDrink,
        category: drink.strCategory,
        alcoholic: drink.strAlcoholic !== 'Non alcoholic',
        glass: drink.strGlass,
        instructions: drink.strInstructions,
        imageUrl: drink.strDrinkThumb,
      },
    })

    for (const { name, measure } of pairs) {
      const ingredientId = ingredientMap.get(name.toLowerCase())
      if (!ingredientId) continue
      await prisma.cocktailIngredient.upsert({
        where: { cocktailId_ingredientId: { cocktailId, ingredientId } },
        update: { measure },
        create: { cocktailId, ingredientId, measure },
      })
    }

    count++
  }

  console.log(`Done. Seeded ${count} cocktails.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
