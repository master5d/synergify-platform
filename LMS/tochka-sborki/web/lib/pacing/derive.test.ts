import { describe, it, expect } from 'vitest'
import { todayCount, currentStreak, recentDowngrade, daysBetween } from './derive'
import { freshPacing, logCompletion } from './store'
import type { PacingState } from './types'

function withDates(dates: string[]): PacingState {
  return { ...freshPacing(), activeDates: [...dates].sort() }
}

describe('derive', () => {
  it('todayCount counts only today', () => {
    let s = logCompletion(freshPacing(), 'a', 'commander', '2026-05-25')
    s = logCompletion(s, 'b', 'commander', '2026-05-25')
    s = logCompletion(s, 'c', 'commander', '2026-05-24')
    expect(todayCount(s, '2026-05-25')).toBe(2)
  })
  it('currentStreak counts consecutive days ending today', () => {
    const s = withDates(['2026-05-23', '2026-05-24', '2026-05-25'])
    expect(currentStreak(s, '2026-05-25')).toBe(3)
  })
  it('currentStreak counts from yesterday when today is inactive', () => {
    const s = withDates(['2026-05-23', '2026-05-24'])
    expect(currentStreak(s, '2026-05-25')).toBe(2)
  })
  it('currentStreak is 0 with a gap', () => {
    const s = withDates(['2026-05-20', '2026-05-25'])
    expect(currentStreak(s, '2026-05-27')).toBe(0)
  })
  it('daysBetween computes calendar-day gap', () => {
    expect(daysBetween('2026-05-18', '2026-05-25')).toBe(7)
    expect(daysBetween('2026-05-25', '2026-05-25')).toBe(0)
  })
  it('recentDowngrade detects a strictly decreasing mode run', () => {
    let s = logCompletion(freshPacing(), 'a', 'archmage', '2026-05-25')
    s = logCompletion(s, 'b', 'copilot', '2026-05-25')
    s = logCompletion(s, 'c', 'commander', '2026-05-25')
    expect(recentDowngrade(s)).toBe(true)
  })
  it('recentDowngrade is false when steady or rising', () => {
    let s = logCompletion(freshPacing(), 'a', 'commander', '2026-05-25')
    s = logCompletion(s, 'b', 'copilot', '2026-05-25')
    expect(recentDowngrade(s)).toBe(false)
  })
})
