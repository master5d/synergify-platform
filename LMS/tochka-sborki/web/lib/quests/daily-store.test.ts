import { describe, it, expect } from 'vitest'
import { rolloverIfStale, markDone, isDone, localDate } from './daily-store'

describe('rolloverIfStale', () => {
  it('keeps the store when the date matches today', () => {
    const s = { date: '2026-05-24', completedIds: ['practice:00-kickstart'] }
    expect(rolloverIfStale(s, '2026-05-24')).toBe(s)
  })
  it('resets completedIds when the stored date is stale', () => {
    const s = { date: '2026-05-23', completedIds: ['practice:00-kickstart'] }
    const next = rolloverIfStale(s, '2026-05-24')
    expect(next.date).toBe('2026-05-24')
    expect(next.completedIds).toEqual([])
  })
})

describe('markDone / isDone', () => {
  it('marks an id once and reports it done', () => {
    const s = { date: '2026-05-24', completedIds: [] as string[] }
    const next = markDone(s, 'practice:00-kickstart')
    expect(isDone(next, 'practice:00-kickstart')).toBe(true)
  })
  it('is idempotent for a repeated id', () => {
    const s = { date: '2026-05-24', completedIds: ['x'] }
    const next = markDone(s, 'x')
    expect(next.completedIds).toEqual(['x'])
  })
  it('does not mutate the input', () => {
    const s = { date: '2026-05-24', completedIds: [] as string[] }
    markDone(s, 'y')
    expect(s.completedIds).toEqual([])
  })
})

describe('localDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(localDate(new Date(2026, 4, 9))).toBe('2026-05-09')
  })
})
