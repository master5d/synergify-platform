import { describe, it, expect } from 'vitest'
import { shouldBreak } from './should-break'
import type { BreakContext } from './types'

// A context where every gate passes; each test flips exactly one field.
const pass: BreakContext = {
  availableCount: 1,
  currentStep: 2,
  stepsSinceLastBreak: 3,
  breaksShownThisSession: 0,
  restMode: false,
}

describe('shouldBreak', () => {
  it('returns true when all gates pass', () => {
    expect(shouldBreak(pass)).toBe(true)
  })
  it('false when no break content is available (dark-ship)', () => {
    expect(shouldBreak({ ...pass, availableCount: 0 })).toBe(false)
  })
  it('false before MIN_BREAK_STEP', () => {
    expect(shouldBreak({ ...pass, currentStep: 1 })).toBe(false)
  })
  it('false within the cooldown window', () => {
    expect(shouldBreak({ ...pass, stepsSinceLastBreak: 2 })).toBe(false)
  })
  it('false at the session frequency cap', () => {
    expect(shouldBreak({ ...pass, breaksShownThisSession: 2 })).toBe(false)
  })
  it('false when pacing is in rest mode', () => {
    expect(shouldBreak({ ...pass, restMode: true })).toBe(false)
  })
})
