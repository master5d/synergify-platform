import { describe, it, expect } from 'vitest'
import { wordCount, computeWpm, comprehensionFraction, effectiveWpm } from './wpm'

describe('wordCount', () => {
  it('counts whitespace-separated words (matches tokenize)', () => {
    expect(wordCount('  one two   three\nfour ')).toBe(4)
    expect(wordCount('')).toBe(0)
  })
})

describe('computeWpm', () => {
  it('words per minute, rounded', () => {
    expect(computeWpm(300, 60000)).toBe(300)
    expect(computeWpm(150, 30000)).toBe(300)
    expect(computeWpm(100, 40000)).toBe(150)
  })
  it('non-positive ms → 0', () => {
    expect(computeWpm(300, 0)).toBe(0)
    expect(computeWpm(300, -5)).toBe(0)
  })
})

describe('comprehensionFraction', () => {
  it('correct / total, guarded', () => {
    expect(comprehensionFraction(3, 3)).toBe(1)
    expect(comprehensionFraction(1, 2)).toBe(0.5)
    expect(comprehensionFraction(0, 3)).toBe(0)
    expect(comprehensionFraction(1, 0)).toBe(0)
  })
})

describe('effectiveWpm', () => {
  it('rounds wpm × fraction', () => {
    expect(effectiveWpm(400, 0.5)).toBe(200)
    expect(effectiveWpm(333, 1)).toBe(333)
    expect(effectiveWpm(300, 0)).toBe(0)
  })
})
