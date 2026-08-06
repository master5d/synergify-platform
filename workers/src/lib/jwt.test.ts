import { describe, it, expect } from 'vitest'
import { signJWT, verifyJWT } from './jwt'

describe('signJWT', () => {
  it('returns a three-part dot-separated token', async () => {
    const token = await signJWT({ sub: 'u1', email: 'a@b.com', iat: 1000, exp: 2000 }, 'secret')
    expect(token.split('.')).toHaveLength(3)
  })
})

describe('verifyJWT', () => {
  it('returns payload for valid token', async () => {
    const payload = { sub: 'u1', email: 'a@b.com', iat: 1000, exp: 9999999999 }
    const token = await signJWT(payload, 'secret')
    const result = await verifyJWT(token, 'secret')
    expect(result).not.toBeNull()
    expect(result!.sub).toBe('u1')
    expect(result!.email).toBe('a@b.com')
  })

  it('returns null for wrong secret', async () => {
    const token = await signJWT({ sub: 'u1', email: 'a@b.com', iat: 1000, exp: 9999999999 }, 'secret')
    const result = await verifyJWT(token, 'wrong-secret')
    expect(result).toBeNull()
  })

  it('returns null for expired token', async () => {
    const token = await signJWT({ sub: 'u1', email: 'a@b.com', iat: 1000, exp: 1001 }, 'secret')
    const result = await verifyJWT(token, 'secret')
    expect(result).toBeNull()
  })

  it('returns null for malformed token', async () => {
    const result = await verifyJWT('not.a.token', 'secret')
    expect(result).toBeNull()
  })
})
