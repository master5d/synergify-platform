import { describe, it, expect, vi } from 'vitest'
import { chatJson, stripFence, LlmError } from '../src/gateway.js'

const ENV = { GATEWAY_URL: 'http://gw.test/v1', GATEWAY_API_KEY: 'sk-SEKRIT-TEST-VALUE' }

function reply(content: string) {
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) }
}

describe('stripFence', () => {
  it('снимает ```json-забор', () => {
    expect(stripFence('```json\n{"a":1}\n```')).toBe('{"a":1}')
  })
  it('снимает голый ```-забор', () => {
    expect(stripFence('```\n{"a":1}\n```')).toBe('{"a":1}')
  })
  it('не трогает чистый JSON', () => {
    expect(stripFence('{"a":1}')).toBe('{"a":1}')
  })
})

describe('chatJson', () => {
  it('разбирает ответ в заборе — иначе пул, обернувший JSON, читался бы как отказ', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply('```json\n{"a":1}\n```'))
    await expect(chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }))
      .resolves.toEqual({ a: 1 })
  })

  it('шлёт max_tokens не ниже 4000 — с 900 думающая модель обрывает ответ', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply('{"a":1}'))
    await chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any })
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body)
    expect(body.max_tokens).toBeGreaterThanOrEqual(4000)
    expect(body.model).toBe('p')
  })

  it('ключ идёт заголовком, а не в URL', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply('{"a":1}'))
    await chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(String(url)).not.toContain(ENV.GATEWAY_API_KEY)
    expect(init.headers.Authorization).toBe(`Bearer ${ENV.GATEWAY_API_KEY}`)
    expect(init.signal).toBeDefined()
  })

  it('обрезанный ответ = unparsable, а не пустой результат', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply('{"legendaryTitle": "Зод'))
    await expect(chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }))
      .rejects.toMatchObject({ code: 'unparsable' })
  })

  it('не-200 от гейтвея = gateway_error', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) })
    await expect(chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }))
      .rejects.toMatchObject({ code: 'gateway_error' })
  })

  it('таймаут отличается от прочих сбоев сети', async () => {
    const err = new Error('t'); err.name = 'TimeoutError'
    const fetchImpl = vi.fn().mockRejectedValue(err)
    await expect(chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }))
      .rejects.toMatchObject({ code: 'timeout' })
  })

  it('ключ не попадает в текст ошибки', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('boom'))
    const e = await chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }).catch(x => x)
    expect(e).toBeInstanceOf(LlmError)
    expect(String((e as Error).message)).not.toContain(ENV.GATEWAY_API_KEY)
  })

  it('не-JSON в теле ответа гейтвея не пробивает контракт LlmError', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: async () => { throw new SyntaxError('Unexpected token < in JSON at position 0') },
    })
    const e = await chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }).catch(x => x)
    expect(e).toBeInstanceOf(LlmError)
    expect((e as any).code).toBe('gateway_error')
  })

  it('проза с JSON в конце разбирается', async () => {
    const reasoning = '**Reasoning**\n\n"Blade Runner 2049" is set in a dystopian...\nAmong options:\n- slavic-myth – not a fit\n{"skin":"cyber-noir"}'
    const fetchImpl = vi.fn().mockResolvedValue(reply(reasoning))
    await expect(chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }))
      .resolves.toEqual({ skin: 'cyber-noir' })
  })

  it('вложенный JSON в конце прозы разбирается целиком', async () => {
    const text = 'Analyzing items...\nResult: {"items":[{"id":1,"name":"a"},{"id":2,"name":"b"}]}'
    const fetchImpl = vi.fn().mockResolvedValue(reply(text))
    await expect(chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }))
      .resolves.toEqual({ items: [{ id: 1, name: 'a' }, { id: 2, name: 'b' }] })
  })

  it('текст без JSON по-прежнему даёт unparsable', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply('Just some text without any JSON at all'))
    await expect(chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }))
      .rejects.toMatchObject({ code: 'unparsable' })
  })

  it('строка с } внутри значения разбирается верно', async () => {
    const text = 'Here is the result:\n{"note": "text with } bracket inside", "value": 42}'
    const fetchImpl = vi.fn().mockResolvedValue(reply(text))
    await expect(chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }))
      .resolves.toEqual({ note: 'text with } bracket inside', value: 42 })
  })

  it('если два JSON-объекта, берётся ПОСЛЕДНИЙ', async () => {
    const text = 'First attempt: {"wrong": true}\nFinal result: {"correct": true}'
    const fetchImpl = vi.fn().mockResolvedValue(reply(text))
    await expect(chatJson({ pool: 'p', prompt: 'x', env: ENV, fetchImpl: fetchImpl as any }))
      .resolves.toEqual({ correct: true })
  })
})
