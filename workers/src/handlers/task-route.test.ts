import { describe, it, expect, vi } from 'vitest'
import { handleTaskRoute, TASK_ROUTE_TIMEOUT_MS, TASK_ROUTE_RATE } from './task-route'
import type { LlmEnv } from '../lib/llm-client'
import { routesForRole } from '../../../LMS/tochka-sborki/web/lib/intake/task-route'

const LLM_ENV: LlmEnv = { LLM_SERVICE_URL: 'https://x', LLM_SERVICE_TOKEN: 't',
  LLM_CF_ACCESS_CLIENT_ID: 'i', LLM_CF_ACCESS_CLIENT_SECRET: 's' }

function ok(body: unknown) { return { ok: true, status: 200, json: async () => body } }

// Каталог — данные активного pack'а (packs/_active). У курса без русел — проверяем честное «недоступно».
const creator = routesForRole('creator')
const hasCatalog = creator.length > 0
const itCat = it.runIf(hasCatalog)

describe('handleTaskRoute', () => {
  it('пустой текст — 400, сервис не зовём', async () => {
    const f = vi.fn()
    const res = await handleTaskRoute({ text: ' ' }, LLM_ENV, f as any)
    expect(res.status).toBe(400)
    expect(f).not.toHaveBeenCalled()
  })

  itCat('шлёт в сервис только каталог роли (key + hint) и короткий потолок', async () => {
    const f = vi.fn().mockResolvedValue(ok({ route: creator[0].key, confidence: 'high', candidates: [] }))
    const res = await handleTaskRoute({ text: 'контент для ипотечного бизнеса', role: 'creator' }, LLM_ENV, f as any)
    expect(await res.json()).toEqual({ status: 'matched', route: creator[0].key })
    const [url, init] = f.mock.calls[0]
    expect(url).toBe('https://x/task-route/classify')
    const sent = JSON.parse(init.body)
    expect(sent.text).toBe('контент для ипотечного бизнеса')
    expect(sent.catalog.map((c: any) => c.key)).toEqual(creator.map(r => r.key))
    expect(sent.catalog.every((c: any) => typeof c.hint === 'string' && c.hint.length > 0)).toBe(true)
    expect(TASK_ROUTE_TIMEOUT_MS).toBeLessThanOrEqual(20_000)
  })

  itCat('ключ вне каталога роли — не русло, а уточнение (второй заслон)', async () => {
    const f = vi.fn().mockResolvedValue(ok({ route: 'invented-route', confidence: 'high', candidates: ['invented-route'] }))
    const res = await handleTaskRoute({ text: 'что-то своё', role: 'creator' }, LLM_ENV, f as any)
    expect(await res.json()).toEqual({ status: 'unsure', candidates: [] })
  })

  itCat('низкая уверенность — уточнение с кандидатами из каталога', async () => {
    const f = vi.fn().mockResolvedValue(ok({ route: null, confidence: 'low', candidates: [creator[1].key] }))
    const res = await handleTaskRoute({ text: 'не знаю, что это', role: 'creator' }, LLM_ENV, f as any)
    expect(await res.json()).toEqual({ status: 'unsure', candidates: [creator[1].key] })
  })

  itCat('сервис отказал (502) — unavailable, 200: клиент уходит в ручной выбор', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const f = vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({ error: { code: 'bad_shape' } }) })
    const res = await handleTaskRoute({ text: 'контент', role: 'creator' }, LLM_ENV, f as any)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'unavailable' })
    expect(err).toHaveBeenCalled()
    err.mockRestore()
  })

  itCat('сеть упала — unavailable', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const f = vi.fn().mockRejectedValue(new Error('timeout'))
    const res = await handleTaskRoute({ text: 'контент', role: 'entrepreneur' }, LLM_ENV, f as any)
    expect(await res.json()).toEqual({ status: 'unavailable' })
    err.mockRestore()
  })

  it.runIf(!hasCatalog)('курс без каталога — unavailable без вызова сервиса', async () => {
    const f = vi.fn()
    const res = await handleTaskRoute({ text: 'контент', role: 'creator' }, LLM_ENV, f as any)
    expect(await res.json()).toEqual({ status: 'unavailable' })
    expect(f).not.toHaveBeenCalled()
  })
})

describe('handleTaskRoute — лимит частоты (волна 19)', () => {
  function fakeCache() {
    const store = new Map<string, string>()
    return {
      match: vi.fn(async (k: string) => (store.has(k) ? new Response(store.get(k)) : undefined)),
      put: vi.fn(async (k: string, r: Response) => { store.set(k, await r.text()) }),
    }
  }
  const NOW = 1_800_000_000_000

  itCat('после TASK_ROUTE_RATE.limit вызовов — 429 с Retry-After, модель не зовём', async () => {
    const cache = fakeCache()
    const f = vi.fn().mockResolvedValue(ok({ route: creator[0].key, confidence: 'high', candidates: [] }))
    const lim = { cache, userId: 'u1', now: NOW }
    for (let i = 0; i < TASK_ROUTE_RATE.limit; i++) {
      const r = await handleTaskRoute({ text: 'контент для бизнеса', role: 'creator' }, LLM_ENV, f as any, lim)
      expect(r.status).toBe(200)
    }
    expect(f).toHaveBeenCalledTimes(TASK_ROUTE_RATE.limit)
    const res = await handleTaskRoute({ text: 'контент для бизнеса', role: 'creator' }, LLM_ENV, f as any, lim)
    expect(res.status).toBe(429)
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0)
    expect(await res.json()).toMatchObject({ error: 'rate_limited' })
    expect(f).toHaveBeenCalledTimes(TASK_ROUTE_RATE.limit)
    // Сосед не страдает.
    const other = await handleTaskRoute({ text: 'контент для бизнеса', role: 'creator' }, LLM_ENV, f as any, { ...lim, userId: 'u2' })
    expect(other.status).toBe(200)
  })

  it('пустой текст (400) лимит не тратит', async () => {
    const cache = fakeCache()
    await handleTaskRoute({ text: ' ' }, LLM_ENV, vi.fn() as any, { cache, userId: 'u1', now: NOW })
    expect(cache.put).not.toHaveBeenCalled()
  })

  it('лимит — мягкий потолок разумного размера: не меньше 5 и не больше 30 в час', () => {
    expect(TASK_ROUTE_RATE.windowSec).toBe(3600)
    expect(TASK_ROUTE_RATE.limit).toBeGreaterThanOrEqual(5)
    expect(TASK_ROUTE_RATE.limit).toBeLessThanOrEqual(30)
  })
})
