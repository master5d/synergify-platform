import { describe, it, expect } from 'vitest'
import {
  tokenize, orpIndex, splitOrp, buildSchedule, clampWpm, clampChunk,
  DEFAULT_WPM, MIN_WPM, MAX_WPM, DEFAULT_CHUNK, MAX_CHUNK,
} from './rsvp'

describe('tokenize', () => {
  it('splits on any whitespace and drops empties', () => {
    expect(tokenize('  hello   world\n\tfoo ')).toEqual(['hello', 'world', 'foo'])
  })
  it('keeps punctuation attached to words', () => {
    expect(tokenize('Hello, world.')).toEqual(['Hello,', 'world.'])
  })
  it('empty / whitespace-only text → []', () => {
    expect(tokenize('')).toEqual([])
    expect(tokenize('   \n  ')).toEqual([])
  })
})

describe('orpIndex', () => {
  it('buckets by length', () => {
    expect(orpIndex('a')).toBe(0)        // len 1
    expect(orpIndex('read')).toBe(1)     // len 2–5
    expect(orpIndex('reading')).toBe(2)  // len 6–9
    expect(orpIndex('comprehend')).toBe(3) // len 10–13
    expect(orpIndex('extraordinarily')).toBe(4) // len 14+
  })
  it('never exceeds the last index', () => {
    expect(orpIndex('')).toBe(0)
    expect(orpIndex('to')).toBeLessThanOrEqual(1)
  })
})

describe('splitOrp', () => {
  it('pivot is exactly one char and the parts reconstruct the word', () => {
    const w = 'reading'
    const s = splitOrp(w)
    expect(s.pivot.length).toBe(1)
    expect(s.before + s.pivot + s.after).toBe(w)
    expect(s.before.length).toBe(orpIndex(w))
  })
  it('handles the empty string', () => {
    expect(splitOrp('')).toEqual({ before: '', pivot: '', after: '' })
  })
})

describe('buildSchedule', () => {
  it('one frame per word at chunk 1, base ms = round(60000/wpm), sequential index', () => {
    const frames = buildSchedule(['aa', 'bb', 'cc'], { wpm: 300, punctuationDwell: false })
    expect(frames).toHaveLength(3)
    expect(frames.map(f => f.index)).toEqual([0, 1, 2])
    expect(frames[0].ms).toBe(200) // 60000/300
    expect(frames[0].text).toBe('aa')
  })
  it('groups words at chunk size 2', () => {
    const frames = buildSchedule(['a', 'b', 'c'], { wpm: 300, chunkSize: 2, punctuationDwell: false })
    expect(frames.map(f => f.text)).toEqual(['a b', 'c'])
    expect(frames[0].ms).toBe(400) // two words × 200
  })
  it('punctuation dwell: comma ×1.5, period ×2.0 (on by default)', () => {
    const mid = buildSchedule(['word,'], { wpm: 300 })
    const end = buildSchedule(['word.'], { wpm: 300 })
    expect(mid[0].ms).toBe(300) // 200 × 1.5
    expect(end[0].ms).toBe(400) // 200 × 2.0
  })
  it('empty tokens → []', () => {
    expect(buildSchedule([], { wpm: 300 })).toEqual([])
  })
})

describe('clamps', () => {
  it('clampWpm bounds and rounds', () => {
    expect(clampWpm(10)).toBe(MIN_WPM)
    expect(clampWpm(99999)).toBe(MAX_WPM)
    expect(clampWpm(301.6)).toBe(302)
    expect(clampWpm(Number.NaN)).toBe(DEFAULT_WPM)
  })
  it('clampChunk bounds', () => {
    expect(clampChunk(0)).toBe(1)
    expect(clampChunk(99)).toBe(MAX_CHUNK)
    expect(clampChunk(Number.NaN)).toBe(DEFAULT_CHUNK)
  })
})
