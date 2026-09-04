import { describe, it, expect, vi } from 'vitest'
import { callLlm } from './llm-client'

const ENV = {
  LLM_SERVICE_URL: 'https://lms-llm.test',
  LLM_SERVICE_TOKEN: 'srv',
  CF_ACCESS_CLIENT_ID: 'cid',
  CF_ACCESS_CLIENT_SECRET: 'csec',
}

describe('callLlm', () => {
  it('шлёт bearer сервиса и оба заголовка CF Access', async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ a: 1 }) })
    await callLlm('/prose', { x: 1 }, ENV, f as any)
    const [url, init] = f.mock.calls[0]
    expect(String(url)).toBe('https://lms-llm.test/prose')
    expect(init.headers['Authorization']).toBe('Bearer srv')
    expect(init.headers['CF-Access-Client-Id']).toBe('cid')
    expect(init.headers['CF-Access-Client-Secret']).toBe('csec')
    expect(init.signal).toBeDefined()
  })

  it('ставит таймаут строго больше внутреннего (90s), чтобы видеть причину отказа', async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    await callLlm('/prose', {}, ENV, f as any)
    expect(f.mock.calls[0][1].signal).toBeDefined()
  })

  it('502 от сервиса превращается в исключение, а не в пустой объект', async () => {
    const f = vi.fn().mockResolvedValue({ ok: false, status: 502,
      json: async () => ({ error: { code: 'bad_shape', message: 'm' } }) })
    await expect(callLlm('/prose', {}, ENV, f as any)).rejects.toThrow(/bad_shape/)
  })

  it('секреты не попадают в текст исключения', async () => {
    const f = vi.fn().mockRejectedValue(new Error('net'))
    const e = await callLlm('/prose', {}, ENV, f as any).catch(x => x)
    const s = String(e?.message ?? '')
    expect(s).not.toContain('srv'); expect(s).not.toContain('csec')
  })
})
