import { describe, it, expect, vi } from 'vitest'
import { classifyTaskRoute, parseTaskRouteBody, buildTaskRoutePrompt } from '../src/task-route.js'
import { createApp } from '../src/index.js'
import { loadEnv } from '../src/config.js'

const ENV = { GATEWAY_URL: 'http://gw.test/v1', GATEWAY_API_KEY: 'k', POOL_TASK_ROUTE: 'route-pool' }
const CATALOG = [
  { key: 'content-pipeline', hint: 'recurring content' },
  { key: 'multi-agent-orchestration', hint: 'dynamic multi-agent work' },
]
function reply(content: string) {
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) }
}

describe('classifyTaskRoute — только закрытый каталог', () => {
  it('ключ каталога проходит', async () => {
    const f = vi.fn().mockResolvedValue(reply('{"route":"content-pipeline","confidence":"high","candidates":["content-pipeline"]}'))
    await expect(classifyTaskRoute('контент для ипотеки', CATALOG, ENV, f as any))
      .resolves.toEqual({ route: 'content-pipeline', confidence: 'high', candidates: ['content-pipeline'] })
  })

  it('русло вне каталога = bad_shape, а не выдуманное русло у ученика', async () => {
    const f = vi.fn().mockResolvedValue(reply('{"route":"crypto-bot","confidence":"high","candidates":[]}'))
    await expect(classifyTaskRoute('x', CATALOG, ENV, f as any)).rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('кандидат вне каталога = bad_shape', async () => {
    const f = vi.fn().mockResolvedValue(reply('{"route":null,"confidence":"low","candidates":["content-pipeline","other"]}'))
    await expect(classifyTaskRoute('x', CATALOG, ENV, f as any)).rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('уверенность не из перечня = bad_shape', async () => {
    const f = vi.fn().mockResolvedValue(reply('{"route":"content-pipeline","confidence":"sure","candidates":[]}'))
    await expect(classifyTaskRoute('x', CATALOG, ENV, f as any)).rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('null + high понижается до low; кандидатов не больше трёх, без повторов', async () => {
    const f = vi.fn().mockResolvedValue(reply('{"route":null,"confidence":"high","candidates":["content-pipeline","content-pipeline"]}'))
    await expect(classifyTaskRoute('x', CATALOG, ENV, f as any))
      .resolves.toEqual({ route: null, confidence: 'low', candidates: ['content-pipeline'] })
  })

  it('берёт пул из POOL_TASK_ROUTE; промпт несёт каталог и текст', async () => {
    const f = vi.fn().mockResolvedValue(reply('{"route":null,"confidence":"low","candidates":[]}'))
    await classifyTaskRoute('контент для ипотеки', CATALOG, ENV, f as any)
    const body = JSON.parse(f.mock.calls[0][1].body)
    expect(body.model).toBe('route-pool')
    const prompt = JSON.stringify(body.messages)
    expect(prompt).toContain('content-pipeline')
    expect(prompt).toContain('контент для ипотеки')
  })

  it('промпт требует только ключи списка', () => {
    expect(buildTaskRoutePrompt('t', CATALOG)).toMatch(/ONLY keys from the list/)
  })
})

describe('parseTaskRouteBody — ошибка вызывающего', () => {
  it('пустой текст / нет каталога / кривой элемент → BadRequest', () => {
    expect(() => parseTaskRouteBody({ text: '  ', catalog: CATALOG })).toThrow(/text/)
    expect(() => parseTaskRouteBody({ text: 'x', catalog: [] })).toThrow(/catalog/)
    expect(() => parseTaskRouteBody({ text: 'x', catalog: [{ key: 1 }] })).toThrow(/catalog\[0\]/)
  })
  it('длинный текст режется до 600', () => {
    expect(parseTaskRouteBody({ text: 'a'.repeat(900), catalog: CATALOG }).text).toHaveLength(600)
  })
})

describe('HTTP /task-route/classify', () => {
  const RAW = { GATEWAY_URL: 'http://gw.test/v1', GATEWAY_API_KEY: 'gk', API_TOKEN: 'srv-token', PORT: '4310' }
  const auth = { 'Content-Type': 'application/json', Authorization: 'Bearer srv-token' }

  it('без токена — 401', async () => {
    const app = createApp(loadEnv(RAW as any))
    const res = await app.request('/task-route/classify', { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } })
    expect(res.status).toBe(401)
  })
  it('кривое тело — 400, не 502', async () => {
    const app = createApp(loadEnv(RAW as any))
    const res = await app.request('/task-route/classify', { method: 'POST', body: JSON.stringify({ text: 'x' }), headers: auth })
    expect(res.status).toBe(400)
  })
  it('ответ модели вне каталога — 502 bad_shape', async () => {
    const env = { ...loadEnv(RAW as any), fetchImpl: vi.fn().mockResolvedValue(reply('{"route":"nope","confidence":"high","candidates":[]}')) as any }
    const res = await createApp(env).request('/task-route/classify', { method: 'POST', body: JSON.stringify({ text: 'x', catalog: CATALOG }), headers: auth })
    expect(res.status).toBe(502)
    expect((await res.json() as any).error.code).toBe('bad_shape')
  })
  it('успех — 200 с руслом', async () => {
    const env = { ...loadEnv(RAW as any), fetchImpl: vi.fn().mockResolvedValue(reply('{"route":"content-pipeline","confidence":"high","candidates":[]}')) as any }
    const res = await createApp(env).request('/task-route/classify', { method: 'POST', body: JSON.stringify({ text: 'x', catalog: CATALOG }), headers: auth })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ route: 'content-pipeline', confidence: 'high', candidates: [] })
  })
})
