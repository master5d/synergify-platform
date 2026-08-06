import { describe, it, expect } from 'vitest'
import hero from '../../../../hero-frame.json'
import { lintDehustle } from '../authoring/dehustle'

describe('hero-frame.json', () => {
  it('has a non-empty origin', () => {
    expect(hero.origin.source.trim().length).toBeGreaterThan(0)
    expect(hero.origin.note.trim().length).toBeGreaterThan(0)
  })

  it('has exactly 3 bilingual frames with labels', () => {
    expect(hero.frames).toHaveLength(3)
    for (const f of hero.frames) {
      expect(f.id.trim().length).toBeGreaterThan(0)
      expect(f.label.ru.trim().length).toBeGreaterThan(0)
      expect(f.label.en.trim().length).toBeGreaterThan(0)
      expect(f.ru.trim().length).toBeGreaterThan(0)
      expect(f.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('has at least 3 objection→reframe pairs, bilingual', () => {
    expect(hero.objections.length).toBeGreaterThanOrEqual(3)
    for (const o of hero.objections) {
      expect(o.id.trim().length).toBeGreaterThan(0)
      expect(o.objection.ru.trim().length).toBeGreaterThan(0)
      expect(o.objection.en.trim().length).toBeGreaterThan(0)
      expect(o.reframe.ru.trim().length).toBeGreaterThan(0)
      expect(o.reframe.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('is de-hustle clean in every string', () => {
    const strings = [
      hero.origin.note,
      ...hero.frames.flatMap((f) => [f.label.ru, f.label.en, f.ru, f.en]),
      ...hero.objections.flatMap((o) => [o.objection.ru, o.objection.en, o.reframe.ru, o.reframe.en]),
    ]
    for (const s of strings) {
      expect(lintDehustle(s), s).toEqual([])
    }
  })

  it('lists at least one placement', () => {
    expect(hero.placements.length).toBeGreaterThan(0)
  })

  it('frame ids are the 3 canonical ones', () => {
    expect(hero.frames.map((f) => f.id)).toEqual(['chat-vs-system', 'dream-together', 'what-changes'])
  })
})
