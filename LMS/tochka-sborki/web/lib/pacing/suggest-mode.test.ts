import { describe, it, expect } from 'vitest'
import { suggestModeFromCalibration } from './suggest-mode'

describe('suggestModeFromCalibration', () => {
  it('suggests commander after a "harder" rating', () => {
    expect(suggestModeFromCalibration('harder')).toBe('commander')
  })
  it('suggests archmage after an "easier" rating', () => {
    expect(suggestModeFromCalibration('easier')).toBe('archmage')
  })
  it('suggests nothing for "right" or undefined', () => {
    expect(suggestModeFromCalibration('right')).toBeNull()
    expect(suggestModeFromCalibration(undefined)).toBeNull()
  })
})
