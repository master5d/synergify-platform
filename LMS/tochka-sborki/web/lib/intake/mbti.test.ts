import { describe, it, expect } from 'vitest'
import { deriveMbti, relationalStyle } from './mbti'

describe('deriveMbti', () => {
  it('uses self-report when a real type is chosen', () => {
    expect(deriveMbti({ V_MBTI_SR: 'ENFP' })).toBe('ENFP')
  })
  it('assembles from the 4 axes when self-report is unknown', () => {
    expect(deriveMbti({ V_MBTI_SR: 'unknown', V_MBTI_EI: 'I', V_MBTI_SN: 'N', V_MBTI_TF: 'T', V_MBTI_JP: 'J' })).toBe('INTJ')
  })
  it('returns null when nothing usable', () => {
    expect(deriveMbti({})).toBeNull()
    expect(deriveMbti({ V_MBTI_SR: 'unknown' })).toBeNull()
  })
})

describe('relationalStyle', () => {
  it('captures rhythm / error / anchor / attention', () => {
    expect(relationalStyle({ V_RHYTHM: 'fuego', V_ERR: 'soft_feedback', V_ANCHOR: 'quick_wins', V_ATTN: 'short' }))
      .toEqual({ rhythm: 'fuego', errorStyle: 'soft_feedback', anchor: 'quick_wins', attention: 'short' })
  })
  it('nulls absent fields', () => {
    expect(relationalStyle({})).toEqual({ rhythm: null, errorStyle: null, anchor: null, attention: null })
  })
})
