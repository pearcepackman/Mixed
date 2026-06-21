import Fastify from 'fastify'
import cors from '@fastify/cors'
import { clerkPlugin } from '@clerk/fastify'
import { healthRoutes } from './routes/health.js'
import { userRoutes } from './routes/user.js'
import { cocktailRoutes } from './routes/cocktails.js'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

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
      publishableKey: requireEnv('CLERK_PUBLISHABLE_KEY'),
      secretKey: requireEnv('CLERK_SECRET_KEY'),
    })
    api.register(userRoutes)
    api.register(cocktailRoutes)
    // Register authenticated routes here as: api.register(cabinetRoutes) etc.
  })

  return app
}
