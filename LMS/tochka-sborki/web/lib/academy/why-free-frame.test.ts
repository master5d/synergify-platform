import { describe, it, expect } from 'vitest'
import frame from '../../../../why-free-frame.json'
import { lintDehustle } from '../authoring/dehustle'

describe('why-free-frame.json', () => {
  it('has a non-empty origin', () => {
    expect(frame.origin.source.trim().length).toBeGreaterThan(0)
    expect(frame.origin.note.trim().length).toBeGreaterThan(0)
  })

  it('has exactly 5 bilingual, non-empty frame points', () => {
    expect(frame.frame).toHaveLength(5)
    for (const f of frame.frame) {
      expect(f.id.trim().length).toBeGreaterThan(0)
      expect(f.ru.trim().length).toBeGreaterThan(0)
      expect(f.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('is de-hustle clean in every string', () => {
    const strings = [
      frame.origin.note,
      ...frame.frame.flatMap((f) => [f.ru, f.en]),
    ]
    for (const s of strings) {
      expect(lintDehustle(s), s).toEqual([])
    }
  })

  it('lists at least one placement', () => {
    expect(frame.placements.length).toBeGreaterThan(0)
  })
})
