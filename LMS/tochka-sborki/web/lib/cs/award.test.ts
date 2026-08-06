import { describe, it, expect } from 'vitest'
import { PHASE_BASE, BASE_TOTAL, computeUnitCS } from './award'

describe('CS award math', () => {
  it('weights the base toward the thinking phases', () => {
    expect(PHASE_BASE.reflection + PHASE_BASE.concept).toBeGreaterThan(
      PHASE_BASE.activation + PHASE_BASE.practice,
    )
  })

  it('base total is the sum of the four phases (70)', () => {
    const sum = PHASE_BASE.activation + PHASE_BASE.reflection + PHASE_BASE.concept + PHASE_BASE.practice
    expect(sum).toBe(70)
    expect(BASE_TOTAL).toBe(70)
  })

  it('computes 70 / 105 / 175 for commander / copilot / archmage', () => {
    expect(computeUnitCS('commander')).toBe(70)
    expect(computeUnitCS('copilot')).toBe(105)
    expect(computeUnitCS('archmage')).toBe(175)
  })
})
