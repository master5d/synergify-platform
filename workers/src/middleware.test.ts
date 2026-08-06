import { describe, it, expect, vi } from 'vitest'
import { requireOwner } from './middleware'

vi.mock('./lib/jwt', () => ({
  verifyJWT: async (token: string) => token === 'owner'
    ? { sub: 'u1', email: 'owner@x.com', iat: 0, exp: 0 }
    : token === 'other' ? { sub: 'u2', email: 'someone@x.com', iat: 0, exp: 0 } : null,
}))

function req(cookie: string) {
  return new Request('https://x/api/admin/x', { headers: { Cookie: cookie } })
}
const env = { WORKER_JWT_SECRET: 's', OWNER_EMAIL: 'owner@x.com' } as any

describe('requireOwner', () => {
  it('401 without session', async () => {
    const r = await requireOwner(req(''), env)
    expect((r as Response).status).toBe(401)
  })
  it('403 for a non-owner', async () => {
    const r = await requireOwner(req('session=other'), env)
    expect((r as Response).status).toBe(403)
  })
  it('returns payload for the owner', async () => {
    const r = await requireOwner(req('session=owner'), env)
    expect((r as any).email).toBe('owner@x.com')
  })
})
