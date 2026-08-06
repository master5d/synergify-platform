import { describe, it, expect } from 'vitest'
import { shouldNudge, THROTTLE_SEC, LAPSE_SEC } from './nudge-policy'

const NOW = 1_800_000_000
const base = { optout: false, lastNudgeAt: null as number | null, lastActivityAt: NOW - 2 * 24 * 3600, hasIncomplete: true, nowSec: NOW }

describe('shouldNudge', () => {
  it('nudges an eligible learner (incomplete, idle 2 days, never nudged)', () => {
    expect(shouldNudge(base)).toBe(true)
  })
  it('never nudges an opted-out learner', () => {
    expect(shouldNudge({ ...base, optout: true })).toBe(false)
  })
  it('never nudges a finished learner', () => {
    expect(shouldNudge({ ...base, hasIncomplete: false })).toBe(false)
  })
  it('skips when nudged within the throttle window', () => {
    expect(shouldNudge({ ...base, lastNudgeAt: NOW - (THROTTLE_SEC - 60) })).toBe(false)
  })
  it('skips a just-active learner (mid-session)', () => {
    expect(shouldNudge({ ...base, lastActivityAt: NOW - 3600 })).toBe(false)
  })
  it('stops nudging a lapsed learner (> 14 days idle)', () => {
    expect(shouldNudge({ ...base, lastActivityAt: NOW - (LAPSE_SEC + 3600) })).toBe(false)
  })
  it('gives a brand-new signup a quiet day (activity == created, just now)', () => {
    expect(shouldNudge({ ...base, lastActivityAt: NOW - 3600 })).toBe(false)
  })
})
