import Fastify from 'fastify'
import { healthRoutes } from './routes/health.ts'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(healthRoutes)

  return app
}
