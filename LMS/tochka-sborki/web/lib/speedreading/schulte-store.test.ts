import { describe, it, expect, beforeEach, vi } from 'vitest'
import { freshSchulte, setSize, recordResult, readSchulte, writeSchulte } from './schulte-store'
import { SCHULTE_KEY } from './schulte-types'
import { DEFAULT_SIZE, MIN_SIZE, MAX_SIZE } from './schulte'

beforeEach(() => {
  const store: Record<string, string> = {}
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { for (const k of Object.keys(store)) delete store[k] },
  })
})

describe('schulte-store', () => {
  it('freshSchulte has default size, empty best and sessions', () => {
    expect(freshSchulte()).toEqual({ size: DEFAULT_SIZE, best: {}, sessions: [] })
  })
  it('setSize clamps', () => {
    expect(setSize(freshSchulte(), 1).size).toBe(MIN_SIZE)
    expect(setSize(freshSchulte(), 99).size).toBe(MAX_SIZE)
  })
  it('recordResult sets best on first result and stores errors', () => {
    const s = recordResult(freshSchulte(), 5, 8000, 2, '2026-07-05')
    expect(s.best[5]).toBe(8000)
    expect(s.sessions).toHaveLength(1)
    expect(s.sessions[0]).toEqual({ date: '2026-07-05', size: 5, ms: 8000, errors: 2 })
  })
  it('recordResult keeps the faster best, ignores a slower ms', () => {
    let s = recordResult(freshSchulte(), 5, 8000, 0, '2026-07-05')
    s = recordResult(s, 5, 9000, 0, '2026-07-05') // slower
    expect(s.best[5]).toBe(8000)
    s = recordResult(s, 5, 6000, 0, '2026-07-05') // faster
    expect(s.best[5]).toBe(6000)
  })
  it('caps sessions at 50', () => {
    let s = freshSchulte()
    for (let i = 0; i < 60; i++) s = recordResult(s, 5, 8000, 0, '2026-07-05')
    expect(s.sessions).toHaveLength(50)
  })
  it('write then read round-trips', () => {
    const s = recordResult(setSize(freshSchulte(), 6), 6, 7000, 1, '2026-07-05')
    writeSchulte(s)
    const r = readSchulte()
    expect(r.size).toBe(6)
    expect(r.best[6]).toBe(7000)
  })
  it('missing key and malformed JSON → freshSchulte', () => {
    expect(readSchulte()).toEqual(freshSchulte())
    localStorage.setItem(SCHULTE_KEY, '{not json')
    expect(readSchulte()).toEqual(freshSchulte())
  })
})
