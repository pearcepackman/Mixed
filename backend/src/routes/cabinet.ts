import type { FastifyInstance } from 'fastify'
import { getAuth } from '@clerk/fastify'
import { z } from 'zod'
import { ensureUser, parseIngredients, addIngredients, getCabinet, removeIngredient } from '../services/cabinet.js'

const addSchema = z.object({ input: z.string().min(1) })

export async function cabinetRoutes(app: FastifyInstance) {
  app.get('/api/cabinet', async (request, reply) => {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' })

    const userId = await ensureUser(clerkId)
    const cabinet = await getCabinet(userId)
    return { cabinet }
  })

  app.post('/api/cabinet', async (request, reply) => {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' })

    const parsed = addSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: 'input is required' })

    const userId = await ensureUser(clerkId)
    const names = await parseIngredients(parsed.data.input)

    if (names.length === 0) {
      return reply.status(422).send({ error: 'No ingredients found in input' })
    }

    const cabinet = await addIngredients(userId, names)
    return { cabinet }
  })

  app.delete('/api/cabinet/:id', async (request, reply) => {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' })

    const { id } = request.params as { id: string }
    const numId = parseInt(id, 10)
    if (isNaN(numId) || numId <= 0) return reply.status(400).send({ error: 'Invalid id' })

    const userId = await ensureUser(clerkId)
    const deleted = await removeIngredient(userId, numId)
    if (!deleted) return reply.status(404).send({ error: 'Not found' })

    return { success: true }
  })
}
