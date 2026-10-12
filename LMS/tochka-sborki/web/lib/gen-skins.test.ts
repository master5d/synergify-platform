import { describe, it, expect, vi, afterEach } from 'vitest'
import { callGateway, SOVERN_AGENT } from '../../scripts/gen-skins.mjs'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('gen-skins → гейтвей', () => {
  it('вызов подписан x-sovern-agent: lms-skins — иначе строка учёта гейтвея ложится unattributed', async () => {
    const fetchImpl = vi.fn(async () => new Response(
      JSON.stringify({ choices: [{ message: { content: '```json\n{"ok":1}\n```' } }] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    vi.stubGlobal('fetch', fetchImpl)
    const out = await callGateway('p', 0.5, 'k')
    expect(out).toEqual({ ok: 1 })
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toMatch(/\/chat\/completions$/)
    const headers = init.headers as Record<string, string>
    expect(SOVERN_AGENT).toBe('lms-skins')
    expect(headers['x-sovern-agent']).toBe('lms-skins')
    expect(headers.Authorization).toBe('Bearer k')
  })
})
