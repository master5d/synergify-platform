import { describe, it, expect } from 'vitest'
import { selectNudge } from './select-nudge'
import { freshPacing } from '@/lib/pacing/store'
import type { NudgeContext } from './types'

const baseCtx: NudgeContext = {
  daysSinceActive: 0, todayCount: 0, currentStreak: 0, recentDowngrade: false,
  hasIncomplete: true, freshModule: null, g11: null, outcome: null, questsLeft: 5,
}
const TODAY = '2026-05-25'

describe('selectNudge', () => {
  it('returns null when no signal fires', () => {
    expect(selectNudge(freshPacing(), baseCtx, TODAY)).toBeNull()
  })
  it('prioritises re-engagement when lapsed with incomplete work', () => {
    expect(selectNudge(freshPacing(), { ...baseCtx, daysSinceActive: 8 }, TODAY)?.kind).toBe('reengage')
  })
  it('does not re-engage when everything is complete', () => {
    expect(selectNudge(freshPacing(), { ...baseCtx, daysSinceActive: 8, hasIncomplete: false }, TODAY)?.kind).not.toBe('reengage')
  })
  it('check-in outranks rest when both fire', () => {
    expect(selectNudge(freshPacing(), { ...baseCtx, todayCount: 4 }, TODAY)?.kind).toBe('checkin')
  })
  it('shows rest on a long streak alone', () => {
    expect(selectNudge(freshPacing(), { ...baseCtx, currentStreak: 5 }, TODAY)?.kind).toBe('rest')
  })
  it('shows calibrate for a fresh uncalibrated module', () => {
    expect(selectNudge(freshPacing(), { ...baseCtx, freshModule: { slug: '04-x', title: 'Prompts' } }, TODAY))
      .toEqual({ kind: 'calibrate', moduleSlug: '04-x', moduleTitle: 'Prompts' })
  })
  it('respects a same-day dismissal', () => {
    const s = { ...freshPacing(), dismissed: { rest: TODAY } }
    expect(selectNudge(s, { ...baseCtx, currentStreak: 5 }, TODAY)).toBeNull()
  })
})
