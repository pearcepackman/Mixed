import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function cocktailRoutes(app: FastifyInstance) {
  app.get('/api/cocktails', async (request, reply) => {
    const { search } = request.query as { search?: unknown }
    const searchString = typeof search === 'string' ? search.trim() : undefined

    const cocktails = await prisma.cocktail.findMany({
      where: searchString
        ? { name: { contains: searchString, mode: 'insensitive' } }
        : undefined,
      select: {
        id: true,
        name: true,
        category: true,
        alcoholic: true,
        glass: true,
        imageUrl: true,
      },
      orderBy: { name: 'asc' },
      take: 20,
    })

    return { cocktails }
  })
}
