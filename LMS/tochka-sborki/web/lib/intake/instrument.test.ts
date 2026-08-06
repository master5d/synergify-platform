import { describe, it, expect } from 'vitest'
import { getQuestions, getModuleIntros, requiredIds } from './instrument'

describe('instrument router', () => {
  it('returns the v1 bank for version 1', () => {
    expect(getQuestions(1).some(q => q.id === 'A1')).toBe(true)
    expect(getQuestions(1).some(q => q.id === 'V_WHY')).toBe(false)
  })
  it('returns the v2 bank for version 2', () => {
    expect(getQuestions(2).some(q => q.id === 'V_WHY')).toBe(true)
    expect(getQuestions(2).some(q => q.id === 'A1')).toBe(false)
  })
  it('requiredIds for v2 is empty (all optional)', () => {
    expect(requiredIds(2)).toEqual([])
  })
  it('requiredIds for v1 is non-empty', () => {
    expect(requiredIds(1).length).toBeGreaterThan(0)
  })
  it('module intros track the version', () => {
    expect(getModuleIntros(2).some(i => i.id === 'V')).toBe(true)
  })
})
