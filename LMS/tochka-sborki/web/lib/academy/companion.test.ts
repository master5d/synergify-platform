import { describe, it, expect } from 'vitest'
import { academyCompanionLayer, PEER_PRINCIPLES, type PeerPrinciple } from './companion'
import { REGISTRY, type AcademyRegistry } from './registry'

const BANNED = /скидк|осталось всего|только сегодня|отзыв|testimonial|discount|hurry|limited/i

describe('academyCompanionLayer', () => {
  it('is registry-driven (academy name from REGISTRY)', () => {
    expect(academyCompanionLayer('ru')).toContain(REGISTRY.academy.name)
    expect(academyCompanionLayer('en')).toContain(REGISTRY.academy.name)
  })

  it('honors an overridden registry', () => {
    const r = { ...REGISTRY, academy: { ...REGISTRY.academy, name: 'TEST-ACADEMY' } } as AcademyRegistry
    expect(academyCompanionLayer('en', r)).toContain('TEST-ACADEMY')
    expect(academyCompanionLayer('en', r)).not.toContain('S.A.S.H.A')
  })

  it('locales differ and both carry both principles', () => {
    const ru = academyCompanionLayer('ru')
    const en = academyCompanionLayer('en')
    expect(ru).not.toBe(en)
    for (const p of PEER_PRINCIPLES) {
      expect(ru).toContain(p.directive.ru)
      expect(en).toContain(p.directive.en)
    }
  })

  it('has exactly the two named principles', () => {
    expect(PEER_PRINCIPLES.map((p: PeerPrinciple) => p.key)).toEqual(['teach-to-learn', 'contributor-not-consumer'])
  })

  it('is de-hustled in both locales', () => {
    expect(academyCompanionLayer('ru')).not.toMatch(BANNED)
    expect(academyCompanionLayer('en')).not.toMatch(BANNED)
  })
})
