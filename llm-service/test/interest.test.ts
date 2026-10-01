import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { rewriteExample, INTEREST_TIMEOUT_MS } from '../src/interest.js'
import { buildInterestExamplePrompt } from '../src/prompts.js'
import { INTERESTS } from '../src/types.js'
import { createApp } from '../src/index.js'
import { loadEnv } from '../src/config.js'

const ENV = { GATEWAY_URL: 'http://gw.test/v1', GATEWAY_API_KEY: 'k', POOL_INTEREST: 'interest-pool' }
const SOURCE = 'Было: `Напиши пост`. Стало: пост на 3 абзаца для запуска курса.'
const INPUT = { source: SOURCE, interest: 'coach', language: 'ru' }
function reply(content: string) {
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) }
}

describe('buildInterestExamplePrompt', () => {
  it('несёт исходник, сферу описанием (не токеном) и язык инструкцией', () => {
    const p = buildInterestExamplePrompt(SOURCE, 'coach', 'ru')
    expect(p).toContain(SOURCE)
    expect(p).toContain('coaching, psychology')
    expect(p).toContain('in Russian')
    expect(p).toContain('STRICT JSON')
    expect(p).toMatch(/Do NOT invent facts/)
    expect(p).toMatch(/inline code span/)
  })
})

describe('rewriteExample — контракт', () => {
  it('возвращает {example} и берёт пул из POOL_INTEREST, температуру 0.4', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply(JSON.stringify({ example: 'Пример коуча.' })))
    await expect(rewriteExample(INPUT, ENV, fetchImpl as any)).resolves.toEqual({ example: 'Пример коуча.' })
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body)
    expect(body.model).toBe('interest-pool')
    expect(body.temperature).toBe(0.4)
  })

  it('свой короткий таймаут 20 с, а не общие 90 с', () => {
    expect(INTEREST_TIMEOUT_MS).toBe(20_000)
  })

  it('таймаут гейтвея → LlmError timeout с настоящим потолком', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(Object.assign(new Error('t'), { name: 'TimeoutError' }))
    await expect(rewriteExample(INPUT, ENV, fetchImpl as any))
      .rejects.toMatchObject({ code: 'timeout', message: expect.stringContaining('20000') })
  })

  it.each([
    ['неизвестный язык', { ...INPUT, language: 'mix' }],
    ['интерес вне закрытого списка', { ...INPUT, interest: 'yoga' }],
    ['интерес other', { ...INPUT, interest: 'other' }],
    ['пустой исходник', { ...INPUT, source: '  ' }],
    ['слишком длинный исходник', { ...INPUT, source: 'а'.repeat(2001) }],
  ])('%s — отказ вызывающему ДО гейтвея', async (_n, input) => {
    const fetchImpl = vi.fn()
    await expect(rewriteExample(input as any, ENV, fetchImpl as any)).rejects.toThrow()
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('пустой example = bad_shape', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply(JSON.stringify({ example: '' })))
    await expect(rewriteExample(INPUT, ENV, fetchImpl as any)).rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('ответ в разы длиннее исходника = bad_shape', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply(JSON.stringify({ example: 'х'.repeat(SOURCE.length * 4) })))
    await expect(rewriteExample(INPUT, ENV, fetchImpl as any)).rejects.toMatchObject({ code: 'bad_shape' })
  })
})

describe('HTTP /interest-example', () => {
  const RAW = { GATEWAY_URL: 'http://gw.test/v1', GATEWAY_API_KEY: 'gk', API_TOKEN: 'srv-token', PORT: '4310' }

  it('POOL_INTEREST по умолчанию — алиас draft-pool', () => {
    expect(loadEnv(RAW as any).POOL_INTEREST).toBe('draft-pool')
  })

  it('без токена 401, с токеном 200, неизвестный интерес 400', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply(JSON.stringify({ example: 'Коуч пишет клиенту.' })))
    const app = createApp({ ...loadEnv(RAW as any), fetchImpl: fetchImpl as any })
    const h = { 'Content-Type': 'application/json' }
    expect((await app.request('/interest-example', { method: 'POST', body: JSON.stringify(INPUT), headers: h })).status).toBe(401)
    const auth = { ...h, Authorization: 'Bearer srv-token' }
    const ok = await app.request('/interest-example', { method: 'POST', body: JSON.stringify(INPUT), headers: auth })
    expect(ok.status).toBe(200)
    expect(await ok.json()).toEqual({ example: 'Коуч пишет клиенту.' })
    const bad = await app.request('/interest-example', { method: 'POST', body: JSON.stringify({ ...INPUT, interest: 'yoga' }), headers: auth })
    expect(bad.status).toBe(400)
  })
})

describe('сверка с вебом', () => {
  it('INTERESTS совпадает с закрытым списком web lib/interest-example/interests.ts', () => {
    const src = readFileSync(new URL('../../LMS/tochka-sborki/web/lib/interest-example/interests.ts', import.meta.url), 'utf8')
    const m = src.match(/export const INTERESTS = \[([^\]]*)\]/)
    expect(m, 'в вебе нет export const INTERESTS = [...]').toBeTruthy()
    const web = [...m![1].matchAll(/'([^']+)'/g)].map(x => x[1])
    expect(web).toEqual([...INTERESTS])
  })
})
