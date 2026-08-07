import { describe, it, expect } from 'vitest'
import { RSVP_SAMPLE, resolveRsvpSample } from './rsvp-sample'
import { lintDehustle } from '../authoring/dehustle'

describe('RSVP_SAMPLE', () => {
  it('has non-empty ru and en that differ', () => {
    expect(RSVP_SAMPLE.ru.length).toBeGreaterThan(0)
    expect(RSVP_SAMPLE.en.length).toBeGreaterThan(0)
    expect(RSVP_SAMPLE.ru).not.toBe(RSVP_SAMPLE.en)
  })
  it('is de-hustle clean in both locales', () => {
    expect(lintDehustle(RSVP_SAMPLE.ru)).toEqual([])
    expect(lintDehustle(RSVP_SAMPLE.en)).toEqual([])
  })
  it('resolveRsvpSample localizes', () => {
    expect(resolveRsvpSample('ru')).toBe(RSVP_SAMPLE.ru)
    expect(resolveRsvpSample('en')).toBe(RSVP_SAMPLE.en)
  })
})
