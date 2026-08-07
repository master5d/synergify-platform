import { describe, it, expect, beforeEach, vi } from 'vitest'
import { freshRsvp, setWpm, setChunk, logSession, readRsvp, writeRsvp } from './rsvp-store'
import { RSVP_KEY } from './rsvp-types'
import { DEFAULT_WPM, DEFAULT_CHUNK, MIN_WPM, MAX_WPM, MAX_CHUNK } from './rsvp'

beforeEach(() => {
  const store: Record<string, string> = {}
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { for (const k of Object.keys(store)) delete store[k] },
  })
})

describe('rsvp-store', () => {
  it('freshRsvp has default wpm/chunk and empty sessions', () => {
    expect(freshRsvp()).toEqual({ wpm: DEFAULT_WPM, chunkSize: DEFAULT_CHUNK, sessions: [] })
  })
  it('setWpm and setChunk clamp', () => {
    expect(setWpm(freshRsvp(), 5).wpm).toBe(MIN_WPM)
    expect(setWpm(freshRsvp(), 99999).wpm).toBe(MAX_WPM)
    expect(setChunk(freshRsvp(), 99).chunkSize).toBe(MAX_CHUNK)
    expect(setChunk(freshRsvp(), 0).chunkSize).toBe(1)
  })
  it('logSession appends and caps at 50', () => {
    let s = freshRsvp()
    for (let i = 0; i < 60; i++) s = logSession(s, { date: '2026-07-05', wpm: 300, words: 10 })
    expect(s.sessions).toHaveLength(50)
  })
  it('write then read round-trips', () => {
    const s = setWpm(freshRsvp(), 450)
    writeRsvp(s)
    expect(readRsvp().wpm).toBe(450)
  })
  it('missing key → freshRsvp', () => {
    expect(readRsvp()).toEqual(freshRsvp())
  })
  it('malformed JSON → freshRsvp', () => {
    localStorage.setItem(RSVP_KEY, '{not json')
    expect(readRsvp()).toEqual(freshRsvp())
  })
})
