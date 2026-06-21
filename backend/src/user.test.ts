import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from './app.js'

vi.mock('@clerk/fastify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@clerk/fastify')>()
  return {
    ...actual,
    getAuth: vi.fn(),
  }
})

import { getAuth } from '@clerk/fastify'
const mockGetAuth = vi.mocked(getAuth)

describe('GET /api/user', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetAuth.mockReturnValue({ userId: null } as never)
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/user' })
    expect(res.statusCode).toBe(401)
    expect(res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns userId when authenticated', async () => {
    mockGetAuth.mockReturnValue({ userId: 'user_test123' } as never)
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/user' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ userId: 'user_test123' })
  })
})
