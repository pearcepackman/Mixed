import Fastify from 'fastify'
import cors from '@fastify/cors'
import { healthRoutes } from './routes/health.js'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  })

  app.register(healthRoutes)

  return app
}
