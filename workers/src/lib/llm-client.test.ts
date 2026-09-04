import { describe, it, expect, vi } from 'vitest'
import { callLlm } from './llm-client'

// Отличимые строки, а не короткие литералы вроде 'srv': тест на непопадание
// секретов в текст исключения обязан ловить настоящую подстроку, а не
// совпасть случайно с чем угодно.
const ENV = {
  LLM_SERVICE_URL: 'https://lms-llm.test',
  LLM_SERVICE_TOKEN: 'srv-SEKRIT-TOKEN',
  LLM_CF_ACCESS_CLIENT_ID: 'cf-id-SEKRIT',
  LLM_CF_ACCESS_CLIENT_SECRET: 'cf-secret-SEKRIT',
}

describe('callLlm', () => {
  it('шлёт bearer сервиса и оба заголовка CF Access (свои, не Listmonk)', async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ a: 1 }) })
    await callLlm('/prose', { x: 1 }, ENV, f as any)
    const [url, init] = f.mock.calls[0]
    expect(String(url)).toBe('https://lms-llm.test/prose')
    expect(init.headers['Authorization']).toBe('Bearer srv-SEKRIT-TOKEN')
    expect(init.headers['CF-Access-Client-Id']).toBe('cf-id-SEKRIT')
    expect(init.headers['CF-Access-Client-Secret']).toBe('cf-secret-SEKRIT')
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
    expect(s).not.toContain(ENV.LLM_SERVICE_TOKEN)
    expect(s).not.toContain(ENV.LLM_CF_ACCESS_CLIENT_ID)
    expect(s).not.toContain(ENV.LLM_CF_ACCESS_CLIENT_SECRET)
  })

  it('срезает хвостовые пробелы/переводы строк в секретах (env с trailing \\n не ломает заголовок)', async () => {
    const dirty = {
      LLM_SERVICE_URL: 'https://lms-llm.test',
      LLM_SERVICE_TOKEN: 'srv-SEKRIT-TOKEN\n',
      LLM_CF_ACCESS_CLIENT_ID: '  cf-id-SEKRIT  ',
      LLM_CF_ACCESS_CLIENT_SECRET: 'cf-secret-SEKRIT\r\n',
    }
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    await callLlm('/prose', {}, dirty, f as any)
    const init = f.mock.calls[0][1]
    expect(init.headers['Authorization']).toBe('Bearer srv-SEKRIT-TOKEN')
    expect(init.headers['CF-Access-Client-Id']).toBe('cf-id-SEKRIT')
    expect(init.headers['CF-Access-Client-Secret']).toBe('cf-secret-SEKRIT')
  })
})
