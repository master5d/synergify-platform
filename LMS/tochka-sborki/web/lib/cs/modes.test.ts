import { describe, it, expect } from 'vitest'
import { MODE } from './modes'
import type { Mode } from './types'

const ALL: Mode[] = ['commander', 'copilot', 'archmage']

describe('MODE presets', () => {
  it('defines all three modes with a multiplier, hintVisible and challengeTier', () => {
    for (const m of ALL) {
      expect(MODE[m].multiplier).toBeGreaterThan(0)
      expect(typeof MODE[m].hintVisible).toBe('boolean')
      expect(['task', 'process', 'outcome']).toContain(MODE[m].challengeTier)
      expect(MODE[m].label.ru.length).toBeGreaterThan(0)
      expect(MODE[m].label.en.length).toBeGreaterThan(0)
    }
  })

  it('multipliers ascend 1.0 / 1.5 / 2.5 as help decreases', () => {
    expect(MODE.commander.multiplier).toBe(1.0)
    expect(MODE.copilot.multiplier).toBe(1.5)
    expect(MODE.archmage.multiplier).toBe(2.5)
  })

  it('only archmage hides the instructional hint', () => {
    expect(MODE.commander.hintVisible).toBe(true)
    expect(MODE.copilot.hintVisible).toBe(true)
    expect(MODE.archmage.hintVisible).toBe(false)
  })

  it('maps each mode to a distinct challenge tier', () => {
    expect(MODE.commander.challengeTier).toBe('task')
    expect(MODE.copilot.challengeTier).toBe('process')
    expect(MODE.archmage.challengeTier).toBe('outcome')
  })
})
