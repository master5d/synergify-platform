import { describe, it, expect } from 'vitest'
import { getEcosystem } from './ecosystem'

describe('getEcosystem', () => {
  for (const loc of ['ru', 'en'] as const) {
    it(`returns 3 ordered pillars with non-empty nodes (${loc})`, () => {
      const e = getEcosystem(loc)
      expect(e.eyebrow.length).toBeGreaterThan(0)
      expect(e.heading.length).toBeGreaterThan(0)
      expect(e.pillars.map((p) => p.key)).toEqual(['learn', 'connect', 'prove'])
      for (const p of e.pillars) {
        expect(p.title.length).toBeGreaterThan(0)
        expect(p.nodes.length).toBeGreaterThan(0)
        for (const n of p.nodes) {
          expect(n.label.length).toBeGreaterThan(0)
          expect(['live', 'planned']).toContain(n.status)
        }
      }
    })
  }

  it('has at least one planned node (honest not-yet-live)', () => {
    const all = getEcosystem('ru').pillars.flatMap((p) => p.nodes)
    expect(all.some((n) => n.status === 'planned')).toBe(true)
  })

  it('is bilingual (ru and en headings differ)', () => {
    expect(getEcosystem('ru').heading).not.toBe(getEcosystem('en').heading)
  })

  it('Connect pillar surfaces the AMA office-hours node', () => {
    const connect = getEcosystem('ru').pillars.find((p) => p.key === 'connect')!
    const labels = connect.nodes.map((n) => n.label)
    expect(labels).toContain('AMA office-hours')
  })
})
