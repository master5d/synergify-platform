import { describe, it, expect } from 'vitest'
import { getCaptureForm } from './capture-forms'

describe('getCaptureForm', () => {
  it('returns a fully-populated config for the seeded retreat (ru + en)', () => {
    for (const locale of ['ru', 'en'] as const) {
      const c = getCaptureForm('retreat-inner-evolution', locale)
      expect(c).not.toBeNull()
      expect(c!.event).toBe('retreat-inner-evolution')
      expect(c!.heading.length).toBeGreaterThan(0)
      expect(c!.blurb.length).toBeGreaterThan(0)
      expect(c!.consentLabel.length).toBeGreaterThan(0)
      expect(c!.cta.length).toBeGreaterThan(0)
      expect(c!.successMessage.length).toBeGreaterThan(0)
      expect(c!.phoneJustification.length).toBeGreaterThan(0)
      expect(Array.isArray(c!.cities)).toBe(true)
    }
  })

  it('returns null for an unknown id', () => {
    expect(getCaptureForm('does-not-exist', 'ru')).toBeNull()
  })

  it('localizes — ru heading differs from en', () => {
    const ru = getCaptureForm('retreat-inner-evolution', 'ru')!
    const en = getCaptureForm('retreat-inner-evolution', 'en')!
    expect(ru.heading).not.toBe(en.heading)
  })
})
