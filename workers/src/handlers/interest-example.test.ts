import { describe, it, expect, vi } from 'vitest'
import { handleInterestExample, ALL_EXAMPLES, INTEREST_LLM_TIMEOUT_MS } from './interest-example'
import type { LlmEnv } from '../lib/llm-client'

const LLM: LlmEnv = { LLM_SERVICE_URL: 'https://llm.test', LLM_SERVICE_TOKEN: 't',
  LLM_CF_ACCESS_CLIENT_ID: 'i', LLM_CF_ACCESS_CLIENT_SECRET: 's' }

// Пилотный пример ТС — реальная запись pack'а, а не выдуманная фикстура.
const ITEM = ALL_EXAMPLES.find(x => x.module === '01-introduction' && x.id === 'delegation')!
const REQ = { module: ITEM.module, unit: ITEM.unit, id: ITEM.id, locale: 'ru' }
// Годный пересказ: то же число абзацев, та же длина, без новых цифр.
const GOOD = ITEM.text.ru.replace('небольшую студию', 'коучинговую практику').replace('для подписчиков', 'для клиентов')

function fakeDb(niche: string | null) {
  return { prepare: () => ({ bind: () => ({ first: async () => (niche === undefined ? null : { niche }) }) }) } as any
}
function fakeCache() {
  const store = new Map<string, string>()
  return {
    store,
    match: vi.fn(async (k: string) => (store.has(k) ? new Response(store.get(k)) : undefined)),
    put: vi.fn(async (k: string, r: Response) => { store.set(k, await r.text()) }),
  }
}
const llmOk = (example: string) => vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ example }) })
function deps(cache: ReturnType<typeof fakeCache>, fetchImpl: any, raceMs = 1000) {
  const pending: Promise<unknown>[] = []
  return { d: { cache, fetchImpl, raceMs, waitUntil: (p: Promise<unknown>) => { pending.push(p) } }, pending }
}

describe('POST /api/interest-example', () => {
  it('годный пересказ → source=interest и запись в кэш; второй заход — из кэша без вызова сервиса', async () => {
    const cache = fakeCache()
    const fetchImpl = llmOk(GOOD)
    const { d } = deps(cache, fetchImpl)
    const res = await handleInterestExample(fakeDb('coach'), 'u1', REQ, LLM, d)
    expect(await res.json()).toEqual({ source: 'interest', interest: 'coach', text: GOOD })
    const sent = JSON.parse(fetchImpl.mock.calls[0][1].body)
    expect(fetchImpl.mock.calls[0][0]).toBe('https://llm.test/interest-example')
    expect(sent).toEqual({ source: ITEM.text.ru, interest: 'coach', language: 'ru' }) // исходник — из pack'а
    expect(cache.put).toHaveBeenCalledTimes(1)
    const again = await handleInterestExample(fakeDb('coach'), 'u1', REQ, LLM, d)
    expect(await again.json()).toEqual({ source: 'interest', interest: 'coach', text: GOOD })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('нет интереса (other / пусто / вне списка) → общий пример без вызова сервиса', async () => {
    for (const niche of ['other', null, 'йога']) {
      const fetchImpl = vi.fn()
      const { d } = deps(fakeCache(), fetchImpl)
      const res = await handleInterestExample(fakeDb(niche), 'u1', REQ, LLM, d)
      expect(await res.json()).toEqual({ source: 'template', reason: 'no_interest' })
      expect(fetchImpl).not.toHaveBeenCalled()
    }
  })

  it('отказ манифеста → общий пример и отрицательная запись в кэш; повтор не зовёт сервис', async () => {
    const cache = fakeCache()
    const bad = GOOD.replace('Во втором', 'Успей, осталось мест мало! Во втором')
    const fetchImpl = llmOk(bad)
    const { d } = deps(cache, fetchImpl)
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await handleInterestExample(fakeDb('coach'), 'u1', REQ, LLM, d)
    expect(await res.json()).toEqual({ source: 'template', reason: 'rejected' })
    expect(err).toHaveBeenCalled() // улика в логе, как у prose_source='template'
    const again = await handleInterestExample(fakeDb('coach'), 'u1', REQ, LLM, d)
    expect(await again.json()).toEqual({ source: 'template', reason: 'rejected' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    err.mockRestore()
  })

  it('выдуманная цифра → общий пример', async () => {
    const fetchImpl = llmOk(GOOD.replace('три коротких абзаца', 'три коротких абзаца и 40 хэштегов'))
    const { d } = deps(fakeCache(), fetchImpl)
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await handleInterestExample(fakeDb('coach'), 'u1', REQ, LLM, d)
    expect(await res.json()).toEqual({ source: 'template', reason: 'rejected' })
    err.mockRestore()
  })

  it('сбой сервиса (502) → общий пример, в кэш ничего', async () => {
    const cache = fakeCache()
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({ error: { code: 'timeout' } }) })
    const { d } = deps(cache, fetchImpl)
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await handleInterestExample(fakeDb('tech'), 'u1', REQ, LLM, d)
    expect(await res.json()).toEqual({ source: 'template', reason: 'unavailable' })
    expect(cache.put).not.toHaveBeenCalled()
    err.mockRestore()
  })

  it('таймаут: сервис не успел за RACE → общий пример + pending, генерация доживает и кладёт в кэш', async () => {
    const cache = fakeCache()
    let release!: () => void
    const gate = new Promise<void>(r => { release = r })
    const fetchImpl = vi.fn(async () => { await gate; return { ok: true, status: 200, json: async () => ({ example: GOOD }) } })
    const { d, pending } = deps(cache, fetchImpl, 5)
    const res = await handleInterestExample(fakeDb('coach'), 'u1', REQ, LLM, d)
    expect(await res.json()).toEqual({ source: 'template', reason: 'pending' })
    expect(pending).toHaveLength(1)
    release()
    await Promise.all(pending)
    expect(cache.put).toHaveBeenCalledTimes(1)
    const again = await handleInterestExample(fakeDb('coach'), 'u1', REQ, LLM, d)
    expect((await again.json() as any).source).toBe('interest')
  })

  it('вызов сервиса идёт с коротким потолком 25 с (AbortSignal)', async () => {
    expect(INTEREST_LLM_TIMEOUT_MS).toBe(25_000)
    const fetchImpl = llmOk(GOOD)
    const { d } = deps(fakeCache(), fetchImpl)
    await handleInterestExample(fakeDb('coach'), 'u1', REQ, LLM, d)
    expect(fetchImpl.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })

  it('неизвестный пример → 404, кривое тело → 400; текст клиента не принимается вовсе', async () => {
    const fetchImpl = vi.fn()
    const { d } = deps(fakeCache(), fetchImpl)
    expect((await handleInterestExample(fakeDb('coach'), 'u1', { ...REQ, id: 'nope' }, LLM, d)).status).toBe(404)
    expect((await handleInterestExample(fakeDb('coach'), 'u1', { ...REQ, locale: 'de' }, LLM, d)).status).toBe(400)
    expect((await handleInterestExample(fakeDb('coach'), 'u1', null, LLM, d)).status).toBe(400)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('ключи module/unit/id не пересекаются между pack\'ами', () => {
    const keys = ALL_EXAMPLES.map(x => `${x.module}/${x.unit}/${x.id}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
