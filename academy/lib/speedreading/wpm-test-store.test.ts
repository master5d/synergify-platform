import { describe, it, expect, beforeEach, vi } from 'vitest'
import { freshWpmTest, recordTest, readWpmTest, writeWpmTest } from './wpm-test-store'
import { WPM_KEY, type WpmResult } from './wpm-test-types'

const sample = (wpm: number): WpmResult => ({
  date: '2026-07-05', passageId: 'attention', ms: 30000, words: 150,
  wpm, correct: 3, total: 3, effectiveWpm: wpm,
})

beforeEach(() => {
  const store: Record<string, string> = {}
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { for (const k of Object.keys(store)) delete store[k] },
  })
})

describe('wpm-test-store', () => {
  it('freshWpmTest has empty results', () => {
    expect(freshWpmTest()).toEqual({ results: [] })
  })
  it('recordTest appends', () => {
    const s = recordTest(freshWpmTest(), sample(300))
    expect(s.results).toHaveLength(1)
    expect(s.results[0].wpm).toBe(300)
  })
  it('caps results at 50', () => {
    let s = freshWpmTest()
    for (let i = 0; i < 60; i++) s = recordTest(s, sample(300))
    expect(s.results).toHaveLength(50)
  })
  it('write then read round-trips', () => {
    writeWpmTest(recordTest(freshWpmTest(), sample(420)))
    expect(readWpmTest().results[0].wpm).toBe(420)
  })
  it('missing key and malformed JSON → freshWpmTest', () => {
    expect(readWpmTest()).toEqual(freshWpmTest())
    localStorage.setItem(WPM_KEY, '{not json')
    expect(readWpmTest()).toEqual(freshWpmTest())
  })
})
