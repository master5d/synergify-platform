import { describe, it, expect } from 'vitest'
import { IGI, resolveIgi, type IgiRitual } from './igi'
import { lintDehustle } from './authoring/dehustle'

const CARD_IDS = ['question', 'learning', 'knowledge', 'umwelt', 'trust', 'opinion']
const STEP_IDS = ['frame', 'choose', 'cultivate', 'wisdom']

describe('resolveIgi', () => {
  it('returns 6 cards and 4 steps with non-empty strings in both locales', () => {
    for (const locale of ['ru', 'en'] as const) {
      const r = resolveIgi(locale)
      expect(r.title.trim().length).toBeGreaterThan(0)
      expect(r.intro.trim().length).toBeGreaterThan(0)
      expect(r.generative.trim().length).toBeGreaterThan(0)
      expect(r.cards).toHaveLength(6)
      expect(r.steps).toHaveLength(4)
      for (const c of r.cards) {
        expect(c.name.trim().length).toBeGreaterThan(0)
        expect(c.prompt.trim().length).toBeGreaterThan(0)
      }
      for (const s of r.steps) {
        expect(s.title.trim().length).toBeGreaterThan(0)
        expect(s.body.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('carries the expected card and step ids', () => {
    const r = resolveIgi('ru')
    expect(r.cards.map((c) => c.id)).toEqual(CARD_IDS)
    expect(r.steps.map((s) => s.id)).toEqual(STEP_IDS)
  })

  it('localizes ru and en differently', () => {
    expect(resolveIgi('ru').generative).not.toBe(resolveIgi('en').generative)
    expect(resolveIgi('ru').cards[0].name).not.toBe(resolveIgi('en').cards[0].name)
  })

  it('resolves from an injected source', () => {
    const fake: IgiRitual = { ...IGI, title: { ru: 'РУ', en: 'EN' } }
    expect(resolveIgi('ru', fake).title).toBe('РУ')
    expect(resolveIgi('en', fake).title).toBe('EN')
  })
})

describe('ИГИ de-hustle', () => {
  it('is clean in every string', () => {
    const strings: string[] = []
    for (const locale of ['ru', 'en'] as const) {
      const r = resolveIgi(locale)
      strings.push(r.title, r.intro, r.generative)
      for (const c of r.cards) strings.push(c.name, c.prompt)
      for (const s of r.steps) strings.push(s.title, s.body)
    }
    for (const s of strings) expect(lintDehustle(s), s).toEqual([])
  })
})
