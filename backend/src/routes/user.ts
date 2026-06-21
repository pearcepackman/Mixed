import type { FastifyInstance } from 'fastify'
import { getAuth } from '@clerk/fastify'

export async function userRoutes(app: FastifyInstance) {
  app.get('/api/user', async (request, reply) => {
    const { userId } = getAuth(request)

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    return { userId }
  })
}
