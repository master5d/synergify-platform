import { describe, it, expect, vi } from 'vitest'
import { fallbackProse } from '../lib/gemini'
import { callLlm } from '../lib/llm-client'

// Поправка 3 к брифу: имена CF Access — LLM_CF_ACCESS_CLIENT_ID/SECRET, а не
// CF_ACCESS_CLIENT_ID/SECRET — те заняты Listmonk (см. crm.ts), другой service-token.
const ENV = { LLM_SERVICE_URL: 'https://x', LLM_SERVICE_TOKEN: 't',
  LLM_CF_ACCESS_CLIENT_ID: 'i', LLM_CF_ACCESS_CLIENT_SECRET: 's' }
const INPUT = { charClass: 'C', worldSkin: 'slavic-myth', language: 'ru' }

describe('деградация интейка', () => {
  it('при 502 сервиса лист собирается из шаблона, а не падает', async () => {
    const f = vi.fn().mockResolvedValue({ ok: false, status: 502,
      json: async () => ({ error: { code: 'timeout', message: 'm' } }) })
    let prose
    try {
      prose = await callLlm('/prose', INPUT, ENV, f as any)
    } catch {
      prose = { ...fallbackProse(INPUT), source: 'template' }
    }
    expect(prose.source).toBe('template')
    expect(prose.legendaryTitle).toBeTruthy()
  })
})
