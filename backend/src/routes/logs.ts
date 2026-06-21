import type { FastifyInstance } from 'fastify'
import { getAuth } from '@clerk/fastify'
import { z } from 'zod'
import { ensureUser } from '../services/cabinet.js'
import { createLog, getLogs, deleteLog } from '../services/logs.js'

const createLogSchema = z.object({
  cocktailId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

export async function logsRoutes(app: FastifyInstance) {
  app.get('/api/logs', async (request, reply) => {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' })

    const userId = await ensureUser(clerkId)
    return getLogs(userId)
  })

  app.post('/api/logs', async (request, reply) => {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' })

    const parsed = createLogSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid request', detail: parsed.error.flatten() })

    const userId = await ensureUser(clerkId)
    const { cocktailId, rating = null, notes = null } = parsed.data
    const entry = await createLog(userId, cocktailId, rating ?? null, notes ?? null)
    return reply.status(201).send({ log: entry })
  })

  app.delete('/api/logs/:id', async (request, reply) => {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' })

    const { id } = request.params as { id: string }
    const numId = parseInt(id, 10)
    if (isNaN(numId) || numId <= 0) return reply.status(400).send({ error: 'Invalid id' })

    const userId = await ensureUser(clerkId)
    const deleted = await deleteLog(userId, numId)
    if (!deleted) return reply.status(404).send({ error: 'Not found' })

    return { success: true }
  })
}
