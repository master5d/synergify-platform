import { describe, it, expect } from 'vitest'
import { mentorFirmness, mentorFirmnessCompact, mentorStateAdaptation, LEARNER_STATE_KEYS } from './mentor-persona'

describe('mentorFirmness', () => {
  it('returns a non-empty anti-flattery contract in both locales', () => {
    expect(mentorFirmness('ru')).toMatch(/льст/)
    expect(mentorFirmness('en')).toMatch(/flatter/)
    expect(mentorFirmness('ru').length).toBeGreaterThan(0)
    expect(mentorFirmness('en').length).toBeGreaterThan(0)
  })

  it('reads as caring-firmness, not coldness (warm marker present)', () => {
    expect(mentorFirmness('ru')).toMatch(/тёплым|поддерживай/)
    expect(mentorFirmness('en')).toMatch(/warm|support/)
  })
})

describe('mentorFirmnessCompact', () => {
  it('returns a short anti-flattery clause in both locales', () => {
    expect(mentorFirmnessCompact('ru')).toMatch(/льст/)
    expect(mentorFirmnessCompact('en')).toMatch(/flatter/)
  })

  it('is shorter than the full contract and distinct from it', () => {
    for (const l of ['ru', 'en'] as const) {
      expect(mentorFirmnessCompact(l).length).toBeLessThan(mentorFirmness(l).length)
      expect(mentorFirmnessCompact(l)).not.toBe(mentorFirmness(l))
    }
  })
})

describe('mentorStateAdaptation', () => {
  it('returns a non-empty, distinct string per locale', () => {
    expect(mentorStateAdaptation('ru').length).toBeGreaterThan(0)
    expect(mentorStateAdaptation('en').length).toBeGreaterThan(0)
    expect(mentorStateAdaptation('ru')).not.toBe(mentorStateAdaptation('en'))
  })

  it('covers the 3 T\'s (tone/tempo/breath) in both locales', () => {
    const ru = mentorStateAdaptation('ru')
    expect(ru).toMatch(/тёплым и твёрдым/) // tone
    expect(ru).toMatch(/Темп/)             // tempo
    expect(ru).toMatch(/Пауза/)            // take a breath
    const en = mentorStateAdaptation('en')
    expect(en).toMatch(/warm and firm/)    // tone
    expect(en).toMatch(/Tempo/)            // tempo
    expect(en).toMatch(/Take a breath/)    // take a breath
  })

  it('covers each archetype tactic in both locales', () => {
    const ru = mentorStateAdaptation('ru')
    expect(ru).toMatch(/прежде чем/) // over_eager: ask before I tell
    expect(ru).toMatch(/конкретным/) // cynical: concrete example
    expect(ru).toMatch(/без вины/)   // disengaged: no guilt
    expect(ru).toMatch(/вытяну/)     // quiet: draw out
    const en = mentorStateAdaptation('en')
    expect(en).toMatch(/before I tell/) // over_eager
    expect(en).toMatch(/concrete/)      // cynical
    expect(en).toMatch(/no guilt/)      // disengaged
    expect(en).toMatch(/draw you out/)  // quiet
  })

  it('stays warm-firm, never shaming (no guilt/laziness markers)', () => {
    for (const l of ['ru', 'en'] as const) {
      const s = mentorStateAdaptation(l)
      expect(s).not.toMatch(/ленив|lazy|стыд|shame/i)
    }
  })
})

describe('LEARNER_STATES data integrity (via LEARNER_STATE_KEYS)', () => {
  it('exposes exactly the four archetype keys in order', () => {
    expect(LEARNER_STATE_KEYS).toEqual(['over_eager', 'cynical', 'disengaged', 'quiet'])
  })
})
