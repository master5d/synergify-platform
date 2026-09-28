import { describe, it, expect, vi } from 'vitest'
import { handleTaskRoute, TASK_ROUTE_TIMEOUT_MS } from './task-route'
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
