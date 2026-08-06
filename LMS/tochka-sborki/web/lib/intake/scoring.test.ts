import { describe, it, expect } from 'vitest'
import { computeAttributes } from './scoring'

describe('computeAttributes', () => {
  it('sums MC/Likert points and normalizes to range', () => {
    const answers = { C1: 'tier4', C3: 'used', C4: 'comfortable', C8: 'very', D3: 'absorb', D7: 'many' }
    const a = computeAttributes(answers)
    expect(a.int).toBe(30)
  })
  it('returns 0 for an attribute with no answers', () => {
    const a = computeAttributes({})
    expect(a.int).toBe(0)
    expect(a.cha).toBe(0)
  })
  it('ignores open-text answers', () => {
    const a = computeAttributes({ A1: 'I am a massage therapist', C1: 'tier0' })
    expect(a.int).toBe(0)
  })
})

import { assignClass } from './scoring'

describe('assignClass', () => {
  it('Artificer when INT/STR/CON high', () => {
    expect(assignClass({ int: 22, wis: 10, con: 19, dex: 10, cha: 10, str: 16 })).toBe('artificer')
  })
  it('Healer when CHA/CON high and INT low', () => {
    expect(assignClass({ int: 8, wis: 16, con: 20, dex: 17, cha: 19, str: 12 })).toBe('healer')
  })
  it('Wanderer when no thresholds met', () => {
    expect(assignClass({ int: 5, wis: 5, con: 5, dex: 5, cha: 5, str: 5 })).toBe('wanderer')
  })
})

import { assignWorldSkin, computeCogTier, scoreProfile } from './scoring'

describe('assignWorldSkin', () => {
  it('G9 explicit choice wins over G3', () => {
    expect(assignWorldSkin({ G9: 'cyber-noir', G3: 'Ведьмак' })).toEqual({ skin: 'cyber-noir', source: 'g9' })
  })
  it('falls back to wanderer when neither present', () => {
    expect(assignWorldSkin({})).toEqual({ skin: 'wanderer', source: 'wanderer-fallback' })
  })
  it('leaves G3 to async classification (returns g3 marker)', () => {
    expect(assignWorldSkin({ G3: 'Ведьмак' })).toEqual({ skin: 'wanderer', source: 'g3' })
  })
})

describe('computeCogTier', () => {
  it('downshifts when G6 says under 3 min despite long D2', () => {
    expect(computeCogTier({ D2: '30_45', G6: 'under3' })).toBe(1)
  })
  it('uses D2 when consistent', () => {
    expect(computeCogTier({ D2: '30_45', G6: '10_30' })).toBe(3)
  })
})

describe('scoreProfile', () => {
  it('produces a full ScoreResult', () => {
    const r = scoreProfile({
      C1: 'tier0', A5: 'supported', A6: 'professional', F2: 'massage',
      E3: 'community', E4: 'high', D2: '15_20', G6: '10_30',
      G8: 'ty', G12: 'ru-tech', G9: 'slavic-myth',
    })
    expect(r.charLevel).toBe(0)
    expect(r.register).toBe('ty')
    expect(r.sheetLanguage).toBe('ru-tech')
    expect(r.niche).toBe('massage')
    expect(r.worldSkin).toBe('slavic-myth')
  })
})
