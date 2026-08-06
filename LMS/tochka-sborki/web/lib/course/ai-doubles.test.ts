import { describe, it, expect } from 'vitest'
import { getAiDoubles, AI_DOUBLE_KEYS } from './ai-doubles'

describe('getAiDoubles', () => {
  it('returns exactly the five domains in order, both locales', () => {
    for (const l of ['ru', 'en'] as const) {
      expect(getAiDoubles(l).doubles.map(d => d.key)).toEqual([...AI_DOUBLE_KEYS])
    }
  })

  it('keys match the u3-clones lesson domains (drift-guard)', () => {
    expect([...AI_DOUBLE_KEYS]).toEqual(['communication', 'meetings', 'content', 'learning', 'automation'])
  })

  it('has non-empty icon/name/does for every double in both locales', () => {
    for (const l of ['ru', 'en'] as const) {
      for (const d of getAiDoubles(l).doubles) {
        expect(d.icon.length).toBeGreaterThan(0)
        expect(d.name.length).toBeGreaterThan(0)
        expect(d.does.length).toBeGreaterThan(0)
      }
    }
  })

  it('has a non-empty heading and lead, distinct per locale', () => {
    expect(getAiDoubles('ru').heading).not.toBe(getAiDoubles('en').heading)
    expect(getAiDoubles('ru').lead.length).toBeGreaterThan(0)
    expect(getAiDoubles('en').lead.length).toBeGreaterThan(0)
  })

  it('carries no time-savings metrics (metrics-free marketing band)', () => {
    for (const l of ['ru', 'en'] as const) {
      const vm = getAiDoubles(l)
      const all = [vm.heading, vm.lead, ...vm.doubles.flatMap(d => [d.name, d.does])].join(' ')
      expect(all).not.toMatch(/\d+\s*(ч|h)\b/i)
      expect(all).not.toMatch(/час|hour/i)
    }
  })
})
