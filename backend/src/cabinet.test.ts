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

describe('cabinet routes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /api/cabinet returns 401 when not authenticated', async () => {
    mockGetAuth.mockReturnValue({ userId: null } as never)
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/cabinet' })
    expect(res.statusCode).toBe(401)
    expect(res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('POST /api/cabinet returns 401 when not authenticated', async () => {
    mockGetAuth.mockReturnValue({ userId: null } as never)
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/api/cabinet',
      payload: { input: 'vodka' },
    })
    expect(res.statusCode).toBe(401)
    expect(res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('DELETE /api/cabinet/:id returns 401 when not authenticated', async () => {
    mockGetAuth.mockReturnValue({ userId: null } as never)
    const app = buildApp()
    const res = await app.inject({ method: 'DELETE', url: '/api/cabinet/1' })
    expect(res.statusCode).toBe(401)
    expect(res.json()).toEqual({ error: 'Unauthorized' })
  })
})
