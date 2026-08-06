import { describe, it, expect } from 'vitest'
import { freshPacing, logCompletion, touch, recordCalibration, dismissNudge } from './store'

describe('pacing store mutations', () => {
  it('logs a completion and records the active date', () => {
    const s = logCompletion(freshPacing(), '01/u1', 'copilot', '2026-05-25')
    expect(s.completions).toEqual([{ unitKey: '01/u1', date: '2026-05-25', mode: 'copilot' }])
    expect(s.activeDates).toEqual(['2026-05-25'])
  })
  it('is idempotent for the same unit on the same day', () => {
    let s = logCompletion(freshPacing(), '01/u1', 'copilot', '2026-05-25')
    s = logCompletion(s, '01/u1', 'archmage', '2026-05-25')
    expect(s.completions).toHaveLength(1)
  })
  it('does not mutate the input', () => {
    const base = freshPacing()
    logCompletion(base, '01/u1', 'copilot', '2026-05-25')
    expect(base.completions).toHaveLength(0)
  })
  it('caps completions at 50 (FIFO)', () => {
    let s = freshPacing()
    for (let i = 0; i < 55; i++) s = logCompletion(s, `m/u${i}`, 'commander', '2026-05-25')
    expect(s.completions).toHaveLength(50)
    expect(s.completions[0].unitKey).toBe('m/u5')
  })
  it('touch sets lastSeen and active date', () => {
    const s = touch(freshPacing(), '2026-05-25')
    expect(s.lastSeen).toBe('2026-05-25')
    expect(s.activeDates).toContain('2026-05-25')
  })
  it('records calibration (map + lastCalibration)', () => {
    const s = recordCalibration(freshPacing(), '04-prompt-engineering', 'harder')
    expect(s.calibration['04-prompt-engineering']).toBe('harder')
    expect(s.lastCalibration).toEqual({ module: '04-prompt-engineering', rating: 'harder' })
  })
  it('dismissNudge stamps the date', () => {
    const s = dismissNudge(freshPacing(), 'rest', '2026-05-25')
    expect(s.dismissed.rest).toBe('2026-05-25')
  })
})
