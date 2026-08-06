import { describe, it, expect } from 'vitest'
import { ACCEL_STAGES, resolveAcceleration } from './synergem-acceleration'
import { lintDehustle } from '@/lib/authoring/dehustle'

const KEYS = ['form', 'rhythm', 'output', 'outward', 'autonomous']

describe('synergem-acceleration', () => {
  it('has exactly the 5 canonical stages in order with unique keys', () => {
    expect(ACCEL_STAGES.map(s => s.key)).toEqual(KEYS)
    expect(new Set(ACCEL_STAGES.map(s => s.key)).size).toBe(5)
  })

  it('resolves ru with non-empty intro and 5 fully-populated stages', () => {
    const a = resolveAcceleration('ru')
    expect(a.intro.length).toBeGreaterThan(0)
    expect(a.stages).toHaveLength(5)
    for (const s of a.stages) {
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.milestone.length).toBeGreaterThan(0)
      expect(s.readiness.length).toBeGreaterThan(0)
      expect(s.move.length).toBeGreaterThan(0)
    }
  })

  it('resolves en with non-empty intro and 5 fully-populated stages', () => {
    const a = resolveAcceleration('en')
    expect(a.intro.length).toBeGreaterThan(0)
    expect(a.stages).toHaveLength(5)
    for (const s of a.stages) {
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.milestone.length).toBeGreaterThan(0)
      expect(s.readiness.length).toBeGreaterThan(0)
      expect(s.move.length).toBeGreaterThan(0)
    }
  })

  it('ru differs from en for intro and every stage field (real translation)', () => {
    const ru = resolveAcceleration('ru')
    const en = resolveAcceleration('en')
    expect(ru.intro).not.toBe(en.intro)
    ru.stages.forEach((s, i) => {
      expect(s.name).not.toBe(en.stages[i].name)
      expect(s.milestone).not.toBe(en.stages[i].milestone)
      expect(s.readiness).not.toBe(en.stages[i].readiness)
      expect(s.move).not.toBe(en.stages[i].move)
    })
  })

  it('is de-hustle clean across intro and every stage field, both locales', () => {
    for (const loc of ['ru', 'en'] as const) {
      const a = resolveAcceleration(loc)
      const strings = [a.intro, ...a.stages.flatMap(s => [s.name, s.milestone, s.readiness, s.move])]
      for (const str of strings) {
        expect(lintDehustle(str)).toEqual([])
      }
    }
  })
})
