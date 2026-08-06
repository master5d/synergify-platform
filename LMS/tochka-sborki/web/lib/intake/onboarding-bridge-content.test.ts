import { describe, it, expect } from 'vitest'
import { buildBridgeContent } from './onboarding-bridge-content'
import { skinDecoder } from '@/lib/rpg/skins-meta'

describe('buildBridgeContent', () => {
  it('возвращает decoder выбранного скина', () => {
    const c = buildBridgeContent('space-opera', 'ru')
    expect(c.decoder).toBe(skinDecoder('space-opera', 'ru'))
    expect(c.decoder).toContain('кадет')
  })
  it('содержит ровно 5 терминов глоссария с непустыми desc', () => {
    const c = buildBridgeContent('wanderer', 'ru')
    expect(c.glossary).toHaveLength(5)
    for (const g of c.glossary) {
      expect(g.term.length).toBeGreaterThan(0)
      expect(g.desc.length).toBeGreaterThan(0)
      expect(g.icon.length).toBeGreaterThan(0)
    }
  })
  it('даёт непустые title/reassurance/enterLabel в обоих локалях', () => {
    for (const loc of ['ru', 'en'] as const) {
      const c = buildBridgeContent('anime-quest', loc)
      expect(c.title.length).toBeGreaterThan(0)
      expect(c.reassurance.length).toBeGreaterThan(0)
      expect(c.enterLabel.length).toBeGreaterThan(0)
    }
  })
})
