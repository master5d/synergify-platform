import { describe, it, expect } from 'vitest'
import { MILESTONES, earnedMilestoneKeys, grantMilestoneCredits, summarizeProgress } from './progress'
import type { RsvpState } from './rsvp-types'
import type { SchulteState } from './schulte-types'
import type { WpmTestState } from './wpm-test-types'
import type { Wallet } from '@/lib/cs/types'

const emptyRsvp: RsvpState = { wpm: 300, chunkSize: 1, sessions: [] }
const emptySchulte: SchulteState = { size: 5, best: {}, sessions: [] }
const emptyWpm: WpmTestState = { results: [] }
const freshWallet = (): Wallet => ({ balance: 0, earnedUnits: [], unlocks: [], modeByUnit: {} })

const rsvp1: RsvpState = { ...emptyRsvp, sessions: [{ date: 'd', wpm: 250, words: 70 }] }
const schulte1: SchulteState = { ...emptySchulte, best: { 5: 9000 }, sessions: [{ date: 'd', size: 5, ms: 9000, errors: 0 }] }
const wpm1: WpmTestState = { results: [{ date: 'd', passageId: 'attention', ms: 30000, words: 150, wpm: 300, correct: 3, total: 3, effectiveWpm: 300 }] }

describe('MILESTONES', () => {
  it('has 3 unique sr:-namespaced keys with positive cs and bilingual labels', () => {
    expect(MILESTONES).toHaveLength(3)
    const keys = MILESTONES.map(m => m.key)
    expect(new Set(keys).size).toBe(3)
    for (const m of MILESTONES) {
      expect(m.key.startsWith('sr:')).toBe(true)
      expect(m.cs).toBeGreaterThan(0)
      expect(m.label.ru.length).toBeGreaterThan(0)
      expect(m.label.en.length).toBeGreaterThan(0)
    }
  })
})

describe('earnedMilestoneKeys', () => {
  it('empty states earn nothing', () => {
    expect(earnedMilestoneKeys(emptyRsvp, emptySchulte, emptyWpm)).toEqual([])
  })
  it('one session/result each earns the matching key', () => {
    expect(earnedMilestoneKeys(rsvp1, emptySchulte, emptyWpm)).toEqual(['sr:rsvp:first'])
    expect(earnedMilestoneKeys(emptyRsvp, schulte1, emptyWpm)).toEqual(['sr:schulte:first'])
    expect(earnedMilestoneKeys(emptyRsvp, emptySchulte, wpm1)).toEqual(['sr:wpm:first'])
  })
  it('all three earned returns all keys in MILESTONES order', () => {
    expect(earnedMilestoneKeys(rsvp1, schulte1, wpm1)).toEqual(['sr:rsvp:first', 'sr:schulte:first', 'sr:wpm:first'])
  })
})

describe('grantMilestoneCredits', () => {
  it('grants earned milestones once (balance +60, keys in ledger)', () => {
    const w = grantMilestoneCredits(freshWallet(), rsvp1, schulte1, wpm1)
    expect(w.balance).toBe(60)
    expect(w.earnedUnits).toEqual(['sr:rsvp:first', 'sr:schulte:first', 'sr:wpm:first'])
  })
  it('is idempotent — a second grant adds nothing', () => {
    const once = grantMilestoneCredits(freshWallet(), rsvp1, schulte1, wpm1)
    const twice = grantMilestoneCredits(once, rsvp1, schulte1, wpm1)
    expect(twice.balance).toBe(60)
    expect(twice.earnedUnits).toHaveLength(3)
  })
  it('grants only the earned subset', () => {
    const w = grantMilestoneCredits(freshWallet(), rsvp1, emptySchulte, emptyWpm)
    expect(w.balance).toBe(20)
    expect(w.earnedUnits).toEqual(['sr:rsvp:first'])
  })
})

describe('summarizeProgress', () => {
  it('all-empty → zeros and nulls', () => {
    expect(summarizeProgress(emptyRsvp, emptySchulte, emptyWpm)).toEqual({
      rsvpSessions: 0, rsvpLastWpm: null, schulteBestMs: null, schulteSizes: [],
      wpmCount: 0, wpmLatestEff: null, wpmFirstEff: null, wpmDelta: null,
    })
  })
  it('aggregates counts, last wpm, best time (min), sizes, and effective-wpm delta', () => {
    const rsvp: RsvpState = { ...emptyRsvp, sessions: [
      { date: 'd', wpm: 250, words: 70 }, { date: 'd', wpm: 320, words: 70 },
    ] }
    const schulte: SchulteState = { ...emptySchulte, best: { 5: 9000, 4: 8000 } }
    const wpm: WpmTestState = { results: [
      { date: 'd', passageId: 'attention', ms: 40000, words: 150, wpm: 225, correct: 2, total: 3, effectiveWpm: 150 },
      { date: 'd', passageId: 'memory', ms: 30000, words: 150, wpm: 300, correct: 3, total: 3, effectiveWpm: 300 },
    ] }
    expect(summarizeProgress(rsvp, schulte, wpm)).toEqual({
      rsvpSessions: 2, rsvpLastWpm: 320, schulteBestMs: 8000, schulteSizes: [4, 5],
      wpmCount: 2, wpmLatestEff: 300, wpmFirstEff: 150, wpmDelta: 150,
    })
  })
})
