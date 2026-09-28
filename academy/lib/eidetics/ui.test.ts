import { describe, it, expect } from 'vitest'
import { EIDETICS_UI, RYAD_UI, DVOREC_UI } from './ui'
import { lintDehustle } from '../authoring/dehustle'
import { checkPromises } from './promises'

function allStrings(v: unknown): string[] {
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) return v.flatMap(allStrings)
  if (v && typeof v === 'object') return Object.values(v).flatMap(allStrings)
  return []
}

describe('eidetics UI strings', () => {
  it('RU and EN have the same keys', () => {
    for (const ui of [EIDETICS_UI, RYAD_UI, DVOREC_UI]) {
      expect(Object.keys(ui.ru).sort()).toEqual(Object.keys(ui.en).sort())
    }
  })

  it('are de-hustle and promise clean', () => {
    for (const s of allStrings([EIDETICS_UI, RYAD_UI, DVOREC_UI])) {
      expect(lintDehustle(s), s).toEqual([])
      expect(checkPromises(s), s).toEqual([])
    }
  })

  // Честная рамка на странице модуля: каждое утверждение об эффекте — со ссылкой.
  it('the honest frame cites its evidence and states the photographic-memory limit', () => {
    for (const loc of ['ru', 'en'] as const) {
      const h = EIDETICS_UI[loc].honest.join(' ')
      expect(h).toMatch(/Dresler 2017/)
      expect(h).toMatch(/Wagner 2021/)
      expect(h).toMatch(loc === 'ru' ? /доказательств не имеет/ : /no evidence/)
    }
  })

  it('trainer slugs match the routes', () => {
    expect(EIDETICS_UI.ru.trainers.map(t => t.slug)).toEqual(['ryad', 'dvorec'])
    expect(EIDETICS_UI.en.trainers.map(t => t.slug)).toEqual(['ryad', 'dvorec'])
  })
})
