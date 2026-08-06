import { describe, it, expect } from 'vitest'
import { markSeen, isSeen } from './use-help-seen'

describe('markSeen / isSeen', () => {
  it('marks a page seen', () => {
    const m = markSeen({}, 'dashboard')
    expect(isSeen(m, 'dashboard')).toBe(true)
  })
  it('is idempotent and immutable', () => {
    const base = { dashboard: true }
    const next = markSeen(base, 'dashboard')
    expect(next).toEqual({ dashboard: true })
    expect(next).toBe(base) // same reference when already seen (no needless copy)
    expect(isSeen(base, 'unit')).toBe(false)
  })
  it('does not mutate the input', () => {
    const base: Record<string, boolean> = {}
    markSeen(base, 'unit')
    expect(base).toEqual({})
  })
})
