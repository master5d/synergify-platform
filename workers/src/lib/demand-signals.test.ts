import { describe, it, expect } from 'vitest'
import { extractSignals, valueTier, normalizeTopicKey, shouldRaiseBrief, THRESHOLD } from './demand-signals'

describe('extractSignals', () => {
  it('picks F3 and F2__other, trims, skips empties', () => {
    const s = extractSignals({ F3: '  automate my DMs ', F2__other: 'tarot reader', F1: 'solo' })
    expect(s).toEqual([
      { source: 'F3', text: 'automate my DMs' },
      { source: 'F2_other', text: 'tarot reader' },
    ])
  })
  it('returns empty when no demand text', () => {
    expect(extractSignals({ F3: '   ', F1: 'solo' })).toEqual([])
    expect(extractSignals({})).toEqual([])
  })
  it('picks the v2 equivalents (V_OUTCOME ↔ F3, V_NICHE__other ↔ F2_other)', () => {
    const s = extractSignals({ V_OUTCOME: '  ship my course ', V_NICHE: 'other', V_NICHE__other: 'tarot reader' })
    expect(s).toEqual([
      { source: 'F3', text: 'ship my course' },
      { source: 'F2_other', text: 'tarot reader' },
    ])
  })
})

describe('valueTier', () => {
  it('high when F5=yes regardless of gemini', () => {
    expect(valueTier({ F5: 'yes' }, 'normal')).toBe('high')
  })
  it('high when gemini says high', () => {
    expect(valueTier({ F5: 'no' }, 'high')).toBe('high')
  })
  it('normal otherwise', () => {
    expect(valueTier({ F5: 'no' }, 'normal')).toBe('normal')
    expect(valueTier({}, 'normal')).toBe('normal')
  })
})

describe('normalizeTopicKey', () => {
  it('produces a stable kebab slug', () => {
    expect(normalizeTopicKey('Telegram Intake Bot!')).toBe('telegram-intake-bot')
    expect(normalizeTopicKey('  already-kebab  ')).toBe('already-kebab')
    expect(normalizeTopicKey('A/B   testing')).toBe('ab-testing')
  })
})

describe('shouldRaiseBrief', () => {
  it('false if an open brief already exists', () => {
    expect(shouldRaiseBrief('high', 99, true)).toBe(false)
  })
  it('true for high-value when no open brief', () => {
    expect(shouldRaiseBrief('high', 0, false)).toBe(true)
  })
  it('true at or above threshold', () => {
    expect(shouldRaiseBrief('normal', THRESHOLD, false)).toBe(true)
  })
  it('false below threshold', () => {
    expect(shouldRaiseBrief('normal', THRESHOLD - 1, false)).toBe(false)
  })
})
