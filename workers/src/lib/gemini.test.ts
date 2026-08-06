import { describe, it, expect, vi } from 'vitest'
import { generateSheetProse, fallbackProse } from './gemini'

describe('fallbackProse', () => {
  it('produces non-empty prose without network', () => {
    const p = fallbackProse({ charClass: 'healer', worldSkin: 'slavic-myth', language: 'ru' } as any)
    expect(p.legendaryTitle).toBeTruthy()
    expect(p.backstory).toBeTruthy()
    expect(p.firstQuest).toBeTruthy()
    expect(p.finalBoss).toBeTruthy()
  })
  it('uses the readable skin name, never the raw enum slug', () => {
    const ru = fallbackProse({ charClass: 'healer', worldSkin: 'slavic-myth', language: 'ru' } as any)
    expect(ru.legendaryTitle).not.toContain('slavic-myth')
    expect(ru.legendaryTitle).toContain('Славянский Миф')
    const en = fallbackProse({ charClass: 'healer', worldSkin: 'cyber-noir', language: 'en' } as any)
    expect(en.legendaryTitle).not.toContain('cyber-noir')
    expect(en.legendaryTitle).toContain('Cyber Noir')
  })
  it('does not crash on an unknown skin', () => {
    const p = fallbackProse({ charClass: 'healer', worldSkin: 'not-a-skin', language: 'en' } as any)
    expect(p.legendaryTitle).not.toContain('not-a-skin')
    expect(p.legendaryTitle).toBeTruthy()
  })
})

describe('generateSheetProse', () => {
  it('falls back when fetch throws', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network'))
    const r = await generateSheetProse({ charClass: 'healer', worldSkin: 'slavic-myth', language: 'ru' } as any,
      'fake-key', fetchImpl as any)
    expect(r.source).toBe('template')
    expect(r.legendaryTitle).toBeTruthy()
  })
  it('parses Gemini JSON on success', async () => {
    const body = { candidates: [{ content: { parts: [{ text: JSON.stringify({
      legendaryTitle: 'T', backstory: 'B', firstQuest: 'Q', finalBoss: 'F' }) }] } }] }
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => body })
    const r = await generateSheetProse({ charClass: 'healer', worldSkin: 'slavic-myth', language: 'ru' } as any,
      'fake-key', fetchImpl as any)
    expect(r.source).toBe('gemini')
    expect(r.legendaryTitle).toBe('T')
  })
})
