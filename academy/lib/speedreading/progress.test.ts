import { describe, it, expect } from 'vitest'
import { summarizeProgress } from './progress'
import type { RsvpState } from './rsvp-types'
import type { SchulteState } from './schulte-types'
import type { WpmTestState } from './wpm-test-types'

const emptyRsvp: RsvpState = { wpm: 300, chunkSize: 1, sessions: [] }
const emptySchulte: SchulteState = { size: 5, best: {}, sessions: [] }
const emptyWpm: WpmTestState = { results: [] }

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
