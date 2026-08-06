import { describe, it, expect } from 'vitest'
import { NUDGE_VARIANTS, pickNudge, botCopy } from './bot-copy'

const LOCALES = ['ru', 'en'] as const

describe('NUDGE_VARIANTS', () => {
  for (const loc of LOCALES) {
    it(`${loc}: >=4 non-empty variants, [0] === nudgeIntro`, () => {
      const v = NUDGE_VARIANTS[loc]
      expect(v.length).toBeGreaterThanOrEqual(4)
      for (const s of v) expect(s.trim().length).toBeGreaterThan(0)
      expect(v[0]).toBe(botCopy(loc).nudgeIntro)
    })
  }
  it('ru and en variant sets differ (bilingual)', () => {
    expect(NUDGE_VARIANTS.ru.join('|')).not.toBe(NUDGE_VARIANTS.en.join('|'))
  })
})

describe('pickNudge', () => {
  for (const loc of LOCALES) {
    it(`${loc}: returns a member of the variant set`, () => {
      expect(NUDGE_VARIANTS[loc]).toContain(pickNudge(loc, 1_800_000_000))
    })
    it(`${loc}: deterministic for a fixed seed`, () => {
      expect(pickNudge(loc, 1_800_000_000)).toBe(pickNudge(loc, 1_800_000_000))
    })
    it(`${loc}: index = floor(seed/86400) % len`, () => {
      const v = NUDGE_VARIANTS[loc]
      for (const seed of [0, 86400, 86400 * v.length, 1_800_000_000]) {
        expect(pickNudge(loc, seed)).toBe(v[Math.floor(seed / 86400) % v.length])
      }
    })
    it(`${loc}: rotates — seeds one day apart give different variants`, () => {
      expect(pickNudge(loc, 0)).not.toBe(pickNudge(loc, 86400))
    })
  }
})
