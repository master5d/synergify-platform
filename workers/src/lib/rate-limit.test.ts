import { describe, it, expect, vi } from 'vitest'
import { hitRateLimit, rateLimitKey } from './rate-limit'

function fakeCache() {
  const store = new Map<string, string>()
  return {
    store,
    match: vi.fn(async (k: string) => (store.has(k) ? new Response(store.get(k)) : undefined)),
    put: vi.fn(async (k: string, r: Response) => { store.set(k, await r.text()) }),
  }
}

const RULE = { limit: 3, windowSec: 3600 }
const T0 = 1_800_000_000_000 // кратно часу не обязательно — окно считается от эпохи

describe('hitRateLimit', () => {
  it('пропускает limit вызовов, следующий — отказ с Retry-After до конца окна', async () => {
    const c = fakeCache()
    const r1 = await hitRateLimit(c, 's', 'u1', RULE, T0)
    const r2 = await hitRateLimit(c, 's', 'u1', RULE, T0)
    const r3 = await hitRateLimit(c, 's', 'u1', RULE, T0)
    expect([r1, r2, r3].map(r => r.allowed)).toEqual([true, true, true])
    expect(r3).toEqual({ allowed: true, remaining: 0 })
    const r4 = await hitRateLimit(c, 's', 'u1', RULE, T0)
    expect(r4.allowed).toBe(false)
    const nowSec = T0 / 1000
    const end = nowSec - (nowSec % 3600) + 3600
    expect(r4).toEqual({ allowed: false, retryAfterSec: end - nowSec })
  })

  it('отказ не увеличивает счётчик; другой пользователь и другой scope — свои счётчики', async () => {
    const c = fakeCache()
    for (let i = 0; i < 5; i++) await hitRateLimit(c, 's', 'u1', RULE, T0)
    expect(c.put).toHaveBeenCalledTimes(3)
    expect((await hitRateLimit(c, 's', 'u2', RULE, T0)).allowed).toBe(true)
    expect((await hitRateLimit(c, 'other', 'u1', RULE, T0)).allowed).toBe(true)
  })

  it('новое окно — счётчик с нуля', async () => {
    const c = fakeCache()
    for (let i = 0; i < 3; i++) await hitRateLimit(c, 's', 'u1', RULE, T0)
    expect((await hitRateLimit(c, 's', 'u1', RULE, T0)).allowed).toBe(false)
    expect((await hitRateLimit(c, 's', 'u1', RULE, T0 + 3600_000)).allowed).toBe(true)
  })

  it('запись несёт max-age до конца окна (кэш сам её выбросит)', async () => {
    const put = vi.fn(async () => {})
    await hitRateLimit({ match: async () => undefined, put }, 's', 'u1', RULE, T0)
    const [key, res] = put.mock.calls[0] as unknown as [string, Response]
    const nowSec = T0 / 1000
    const start = nowSec - (nowSec % 3600)
    expect(key).toBe(rateLimitKey('s', 'u1', start))
    expect(res.headers.get('Cache-Control')).toBe(`public, max-age=${start + 3600 - nowSec}`)
  })

  it('кэш недоступен — пропуск, но громко (советующий заслон, правило 9)', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const r = await hitRateLimit({ match: async () => { throw new Error('boom') }, put: async () => {} }, 's', 'u1', RULE, T0)
    expect(r).toEqual({ allowed: true, skipped: true })
    expect(String(err.mock.calls[0][0])).toContain('RATE LIMIT SKIPPED')
    err.mockRestore()
  })

  it('мусор в записи кэша считается нулём, а не NaN-пропуском навсегда', async () => {
    const c = fakeCache()
    const nowSec = T0 / 1000
    c.store.set(rateLimitKey('s', 'u1', nowSec - (nowSec % 3600)), 'garbage')
    expect(await hitRateLimit(c, 's', 'u1', RULE, T0)).toEqual({ allowed: true, remaining: 2 })
  })
})
