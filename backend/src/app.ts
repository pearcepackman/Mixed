import Fastify from 'fastify'
import cors from '@fastify/cors'
import { clerkPlugin } from '@clerk/fastify'
import { healthRoutes } from './routes/health.js'
import { userRoutes } from './routes/user.js'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  })

  // Public routes — no auth
  app.register(healthRoutes)

  // Protected routes — Clerk required
  app.register(async (api) => {
    api.register(clerkPlugin, {
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
    })
    api.register(userRoutes)
    // Register authenticated routes here as: api.register(cabinetRoutes) etc.
  })

  return app
}
