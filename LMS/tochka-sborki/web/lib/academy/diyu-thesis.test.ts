import { describe, it, expect } from 'vitest'
import diyu from '../../../../diyu-thesis.json'
import { lintDehustle } from '../authoring/dehustle'

describe('diyu-thesis.json', () => {
  it('attributes Kamenetz and the DIYU work', () => {
    expect(diyu.attribution.source).toContain('Kamenetz')
    expect(diyu.attribution.work).toContain('DIYU')
  })

  it('has exactly 5 bilingual, non-empty thesis points', () => {
    expect(diyu.thesis).toHaveLength(5)
    for (const t of diyu.thesis) {
      expect(t.id.trim().length).toBeGreaterThan(0)
      expect(t.ru.trim().length).toBeGreaterThan(0)
      expect(t.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('is de-hustle clean in every string', () => {
    const strings = [
      diyu.attribution.note,
      ...diyu.thesis.flatMap((t) => [t.ru, t.en]),
    ]
    for (const s of strings) {
      expect(lintDehustle(s), s).toEqual([])
    }
  })

  it('lists at least one placement', () => {
    expect(diyu.placements.length).toBeGreaterThan(0)
  })
})
