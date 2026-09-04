import { describe, it, expect, vi } from 'vitest'
import { createApp } from '../src/index.js'
import { loadEnv } from '../src/config.js'

const RAW = {
  GATEWAY_URL: 'http://gw.test/v1', GATEWAY_API_KEY: 'gk', API_TOKEN: 'srv-token',
  POOL_PROSE: 'p1', POOL_SKIN: 'p2', POOL_DEMAND_CLASSIFY: 'p3', POOL_DEMAND_BRIEF: 'p4',
  PORT: '4310',
}
const GOOD = { legendaryTitle: 'A', backstory: 'B', firstQuest: 'C', finalBoss: 'D' }
function reply(content: string) {
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) }
}
const INPUT = { charClass: 'C', worldSkin: 'slavic-myth', language: 'ru' }

describe('loadEnv', () => {
  it('падает громко, если GATEWAY_URL не задан — молчаливый старт с пустым адресом хуже отказа', () => {
    expect(() => loadEnv({ ...RAW, GATEWAY_URL: undefined } as any)).toThrow(/GATEWAY_URL/)
  })
  it('падает, если API_TOKEN пуст — иначе сервис открыт', () => {
    expect(() => loadEnv({ ...RAW, API_TOKEN: '' } as any)).toThrow(/API_TOKEN/)
  })
})

describe('HTTP', () => {
  const env = loadEnv(RAW as any)

  it('без токена отдаёт 401', async () => {
    const app = createApp(env)
    const res = await app.request('/prose', { method: 'POST', body: JSON.stringify(INPUT),
      headers: { 'Content-Type': 'application/json' } })
    expect(res.status).toBe(401)
  })

  it('с чужим токеном отдаёт 401', async () => {
    const app = createApp(env)
    const res = await app.request('/prose', { method: 'POST', body: JSON.stringify(INPUT),
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer wrong' } })
    expect(res.status).toBe(401)
  })

  it('с верным токеном отдаёт прозу', async () => {
    const app = createApp({ ...env, fetchImpl: vi.fn().mockResolvedValue(reply(JSON.stringify(GOOD))) as any })
    const res = await app.request('/prose', { method: 'POST', body: JSON.stringify(INPUT),
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer srv-token' } })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(GOOD)
  })

  it('сбой LLM отдаёт 502 с машинным кодом', async () => {
    const app = createApp({ ...env, fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }) as any })
    const res = await app.request('/prose', { method: 'POST', body: JSON.stringify(INPUT),
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer srv-token' } })
    expect(res.status).toBe(502)
    expect((await res.json() as any).error.code).toBe('gateway_error')
  })

  it('в теле ошибки нет ключа гейтвея', async () => {
    const app = createApp({ ...env, fetchImpl: vi.fn().mockRejectedValue(new Error('boom')) as any })
    const res = await app.request('/prose', { method: 'POST', body: JSON.stringify(INPUT),
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer srv-token' } })
    expect(await res.text()).not.toContain('gk')
  })

  it('/health не требует токена и не зовёт гейтвей', async () => {
    const app = createApp(env)
    const res = await app.request('/health')
    expect(res.status).toBe(200)
  })
})
