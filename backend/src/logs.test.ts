import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from './app.js'

vi.mock('@clerk/fastify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@clerk/fastify')>()
  return { ...actual, getAuth: vi.fn() }
})

vi.mock('./services/cabinet.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./services/cabinet.js')>()
  return { ...actual, ensureUser: vi.fn().mockResolvedValue('internal-user-id') }
})

vi.mock('./services/logs.js', () => ({
  getLogs: vi.fn().mockResolvedValue({ logs: [], stats: { total: 0, averageRating: null, topCategory: null } }),
  createLog: vi.fn().mockResolvedValue({ id: 1, cocktailId: 1, cocktailName: 'Mojito', cocktailImageUrl: null, cocktailCategory: null, rating: 5, notes: null, loggedAt: new Date().toISOString() }),
  deleteLog: vi.fn().mockResolvedValue(true),
}))

import { getAuth } from '@clerk/fastify'
const mockGetAuth = vi.mocked(getAuth)

describe('log routes', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET /api/logs', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetAuth.mockReturnValue({ userId: null } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'GET', url: '/api/logs' })
      expect(res.statusCode).toBe(401)
      expect(res.json()).toEqual({ error: 'Unauthorized' })
    })

    it('returns logs and stats when authenticated', async () => {
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'GET', url: '/api/logs' })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveProperty('logs')
      expect(res.json()).toHaveProperty('stats')
    })
  })

  describe('POST /api/logs', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetAuth.mockReturnValue({ userId: null } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'POST', url: '/api/logs', payload: { cocktailId: 1, rating: 5 } })
      expect(res.statusCode).toBe(401)
      expect(res.json()).toEqual({ error: 'Unauthorized' })
    })

    it('returns 400 when cocktailId is missing', async () => {
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'POST', url: '/api/logs', payload: { rating: 4 } })
      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when cocktailId is not a positive integer', async () => {
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'POST', url: '/api/logs', payload: { cocktailId: -1 } })
      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when rating is out of range', async () => {
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'POST', url: '/api/logs', payload: { cocktailId: 1, rating: 6 } })
      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when rating is below minimum', async () => {
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'POST', url: '/api/logs', payload: { cocktailId: 1, rating: 0 } })
      expect(res.statusCode).toBe(400)
    })

    it('returns 201 with valid cocktailId and no rating', async () => {
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'POST', url: '/api/logs', payload: { cocktailId: 1 } })
      expect(res.statusCode).toBe(201)
      expect(res.json()).toHaveProperty('log')
    })

    it('returns 201 with cocktailId, rating, and notes', async () => {
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'POST', url: '/api/logs', payload: { cocktailId: 1, rating: 5, notes: 'Great!' } })
      expect(res.statusCode).toBe(201)
    })
  })

  describe('DELETE /api/logs/:id', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetAuth.mockReturnValue({ userId: null } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'DELETE', url: '/api/logs/1' })
      expect(res.statusCode).toBe(401)
      expect(res.json()).toEqual({ error: 'Unauthorized' })
    })

    it('returns 400 for non-numeric id', async () => {
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'DELETE', url: '/api/logs/abc' })
      expect(res.statusCode).toBe(400)
    })

    it('returns 400 for zero id', async () => {
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'DELETE', url: '/api/logs/0' })
      expect(res.statusCode).toBe(400)
    })

    it('returns 200 when log is found and deleted', async () => {
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'DELETE', url: '/api/logs/1' })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toEqual({ success: true })
    })

    it('returns 404 when log does not belong to user', async () => {
      const { deleteLog } = await import('./services/logs.js')
      vi.mocked(deleteLog).mockResolvedValueOnce(false)
      mockGetAuth.mockReturnValue({ userId: 'clerk_user_1' } as never)
      const app = buildApp()
      const res = await app.inject({ method: 'DELETE', url: '/api/logs/99' })
      expect(res.statusCode).toBe(404)
    })
  })
})
