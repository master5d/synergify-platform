import { describe, it, expect } from 'vitest'
import { getAppliedChallenge, fillNicheSlots } from './applied-challenge'

const M = '04-prompt-engineering'

describe('getAppliedChallenge', () => {
  it('slot-fills {niche} with the niche word for the task tier', () => {
    const out = getAppliedChallenge({ niche: 'coach', outcome: null }, M, 'task', 'ru')
    expect(out).toContain('коучинге')
    expect(out).not.toContain('{niche}')
    expect(out).not.toContain('coach')
  })

  it('slot-fills {niche} for the process tier (en)', () => {
    const out = getAppliedChallenge({ niche: 'coach', outcome: null }, M, 'process', 'en')
    expect(out).toContain('coaching')
    expect(out).not.toContain('{niche}')
  })

  it('slot-fills {outcome} for the outcome tier when F3 is present', () => {
    const out = getAppliedChallenge(
      { niche: 'coach', outcome: 'cut review time in half' }, M, 'outcome', 'en',
    )
    expect(out).toContain('cut review time in half')
    expect(out).not.toContain('{outcome}')
  })

  it('falls back to the niche-generic line (with niche word) when F3 outcome is empty', () => {
    const out = getAppliedChallenge({ niche: 'coach', outcome: '   ' }, M, 'outcome', 'en')
    expect(out).toContain('coaching')
    expect(out).not.toContain('{outcome}')
  })

  it('falls back to the task framing when both niche and outcome are absent (outcome tier)', () => {
    const out = getAppliedChallenge({ niche: null, outcome: null }, M, 'outcome', 'ru')
    const taskNoSlot = getAppliedChallenge({ niche: null, outcome: null }, M, 'task', 'ru')
    expect(out).toBe(taskNoSlot)
  })

  it('uses the neutral niche word when niche is absent', () => {
    const out = getAppliedChallenge({ niche: null, outcome: null }, M, 'task', 'en')
    expect(out).toContain('your field')
    expect(out).not.toContain('{niche}')
  })

  it('uses the neutral niche word for an unknown niche (e.g. "other")', () => {
    const out = getAppliedChallenge({ niche: 'other', outcome: null }, M, 'task', 'ru')
    expect(out).toContain('твоей сфере')
  })

  it('returns null for an unknown module', () => {
    expect(getAppliedChallenge({ niche: 'coach', outcome: 'y' }, 'no-such-module', 'task', 'ru')).toBeNull()
  })
})

describe('fillNicheSlots', () => {
  it('maps a known niche to its slot word and fills {outcome}', () => {
    expect(fillNicheSlots('do {niche} → {outcome}', 'coach', 'win', 'en')).toBe('do coaching → win')
  })
  it('falls back to the locale niche word for unknown/empty niche, and {outcome} to empty', () => {
    expect(fillNicheSlots('for {niche}: {outcome}', 'other', null, 'en')).toBe('for your field: ')
    expect(fillNicheSlots('для {niche}', null, null, 'ru')).toBe('для твоей сфере')
  })
})
