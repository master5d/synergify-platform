import { describe, it, expect } from 'vitest'
import { getPromptAnatomy } from './prompt-anatomy'

describe('getPromptAnatomy', () => {
  for (const loc of ['ru', 'en'] as const) {
    it(`returns caption + 5 segments with content (${loc})`, () => {
      const a = getPromptAnatomy(loc)
      expect(a.caption.length).toBeGreaterThan(0)
      expect(a.segments).toHaveLength(5)
      for (const s of a.segments) {
        expect(s.text.length).toBeGreaterThan(0)
        expect(s.label.length).toBeGreaterThan(0)
        expect(s.note.length).toBeGreaterThan(0)
        expect(s.accent.length).toBeGreaterThan(0)
      }
    })
    it(`has 5 unique accents (${loc})`, () => {
      const accents = getPromptAnatomy(loc).segments.map(s => s.accent)
      expect(new Set(accents).size).toBe(5)
    })
  }
  it('ru and en differ', () => {
    expect(getPromptAnatomy('ru').caption).not.toBe(getPromptAnatomy('en').caption)
    expect(getPromptAnatomy('ru').segments[0].text).not.toBe(getPromptAnatomy('en').segments[0].text)
  })
})
