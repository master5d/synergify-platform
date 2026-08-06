import { describe, it, expect } from 'vitest'
import { EFFORT_INTENTS, resolveEffort } from './effort'
import { lintDehustle } from './authoring/dehustle'

describe('EFFORT_INTENTS', () => {
  it('has exactly the 5 expected keys in order', () => {
    expect(EFFORT_INTENTS.map(i => i.key)).toEqual([
      'co-build', 'mastermind', 'teach-swap', 'clients', 'peer-support',
    ])
  })

  it('has unique keys', () => {
    const keys = EFFORT_INTENTS.map(i => i.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('has non-empty ru+en label and line for every intent', () => {
    for (const i of EFFORT_INTENTS) {
      expect(i.label.ru.trim().length).toBeGreaterThan(0)
      expect(i.label.en.trim().length).toBeGreaterThan(0)
      expect(i.line.ru.trim().length).toBeGreaterThan(0)
      expect(i.line.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('is de-hustle clean across every label and line, both locales', () => {
    for (const i of EFFORT_INTENTS) {
      for (const s of [i.label.ru, i.label.en, i.line.ru, i.line.en]) {
        expect(lintDehustle(s)).toEqual([])
      }
    }
  })
})

describe('resolveEffort', () => {
  it('localizes each known key (ru differs from en)', () => {
    const ru = resolveEffort('ru', 'co-build')!
    const en = resolveEffort('en', 'co-build')!
    expect(ru.label.length).toBeGreaterThan(0)
    expect(en.label.length).toBeGreaterThan(0)
    expect(ru.label).not.toBe(en.label)
  })

  it('resolves all 5 keys to non-empty label+line', () => {
    for (const i of EFFORT_INTENTS) {
      const r = resolveEffort('ru', i.key)!
      expect(r.label.length).toBeGreaterThan(0)
      expect(r.line.length).toBeGreaterThan(0)
    }
  })

  it('returns null for a null key', () => {
    expect(resolveEffort('ru', null)).toBeNull()
  })

  it('returns null for an unknown key', () => {
    expect(resolveEffort('ru', 'nonsense')).toBeNull()
  })
})
