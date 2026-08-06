import { describe, it, expect } from 'vitest'
import { activeEasterEgg, EASTER_EGGS } from './easter-eggs'

describe('activeEasterEgg', () => {
  it('returns the egg whose MM-DD range covers the date', () => {
    const egg = activeEasterEgg(new Date('2026-04-12T10:00:00Z')) // Cosmonautics Day
    expect(egg?.id).toBe('cosmonautics')
    expect(egg?.glyph.length).toBeGreaterThan(0)
  })

  it('handles a year-wrapping range (New Year spans Dec→Jan)', () => {
    expect(activeEasterEgg(new Date('2026-12-31T00:00:00Z'))?.id).toBe('new-year')
    expect(activeEasterEgg(new Date('2026-01-03T00:00:00Z'))?.id).toBe('new-year')
  })

  it('returns null on an ordinary day', () => {
    expect(activeEasterEgg(new Date('2026-06-17T00:00:00Z'))).toBeNull()
  })

  it('every egg has a glyph and a bilingual label', () => {
    for (const e of EASTER_EGGS) {
      expect(e.glyph.length).toBeGreaterThan(0)
      expect(e.label.ru.length).toBeGreaterThan(0)
      expect(e.label.en.length).toBeGreaterThan(0)
    }
  })
})
