import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  RECALL_KEY, freshRecall, pendingDelayed, readRecall, recordDelayed, recordImmediate, summarizeRecall, writeRecall,
  type RecallSession,
} from './recall-store'
import { PALACE_KEY, MAX_LOCI, freshPalace, isRouteReady, readPalace, recordRun, setLoci, writePalace } from './palace-store'
import { MIN_DELAY_MS } from './recall'

beforeEach(() => {
  const store: Record<string, string> = {}
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { for (const k of Object.keys(store)) delete store[k] },
  })
})

const T0 = 1_700_000_000_000
const session = (id: string, studiedAt: number, anyOrder: number): Omit<RecallSession, 'delayed' | 'delayedAt'> => ({
  id, date: '2026-09-28', studiedAt, kind: 'words', locale: 'ru',
  items: ['кот', 'мост'], immediate: { inOrder: anyOrder, anyOrder, total: 2 },
})

describe('recall-store', () => {
  it('records an immediate result with no delayed check yet', () => {
    const s = recordImmediate(freshRecall(), session('a', T0, 2))
    expect(s.sessions[0].delayed).toBeNull()
  })

  it('refuses a delayed check before the window, accepts after, only once', () => {
    let s = recordImmediate(freshRecall(), session('a', T0, 2))
    const score = { inOrder: 1, anyOrder: 1, total: 2 }
    s = recordDelayed(s, 'a', score, T0 + 1000)
    expect(s.sessions[0].delayed).toBeNull()
    s = recordDelayed(s, 'a', score, T0 + MIN_DELAY_MS)
    expect(s.sessions[0].delayed).toEqual(score)
    s = recordDelayed(s, 'a', { inOrder: 2, anyOrder: 2, total: 2 }, T0 + 2 * MIN_DELAY_MS)
    expect(s.sessions[0].delayed).toEqual(score)
  })

  it('splits pending delayed checks into due and waiting', () => {
    let s = recordImmediate(freshRecall(), session('old', T0, 2))
    s = recordImmediate(s, session('new', T0 + MIN_DELAY_MS, 2))
    const p = pendingDelayed(s, T0 + MIN_DELAY_MS + 5)
    expect(p.due.map(x => x.id)).toEqual(['old'])
    expect(p.waiting.map(x => x.id)).toEqual(['new'])
  })

  it('summary: first session is «before», last is «after»', () => {
    expect(summarizeRecall(freshRecall())).toEqual({ count: 0, before: null, after: null })
    let s = recordImmediate(freshRecall(), session('a', T0, 1))
    expect(summarizeRecall(s).after).toBeNull()
    s = recordImmediate(s, session('b', T0 + 1, 2))
    const sum = summarizeRecall(s)
    expect(sum.before).toEqual({ immediate: 50, delayed: null })
    expect(sum.after).toEqual({ immediate: 100, delayed: null })
  })

  it('round-trips; malformed JSON → fresh', () => {
    writeRecall(recordImmediate(freshRecall(), session('a', T0, 2)))
    expect(readRecall().sessions).toHaveLength(1)
    localStorage.setItem(RECALL_KEY, '{nope')
    expect(readRecall()).toEqual(freshRecall())
  })
})

describe('palace-store', () => {
  it('cleans the route and caps it at MAX_LOCI', () => {
    const s = setLoci(freshPalace(), [' дверь ', '', 'вешалка', ...Array.from({ length: 20 }, (_, i) => `т${i}`)])
    expect(s.loci[0]).toBe('дверь')
    expect(s.loci).toHaveLength(MAX_LOCI)
  })

  it('route is ready from 5 loci', () => {
    expect(isRouteReady(setLoci(freshPalace(), ['a', 'b', 'c', 'd']))).toBe(false)
    expect(isRouteReady(setLoci(freshPalace(), ['a', 'b', 'c', 'd', 'e']))).toBe(true)
  })

  it('records runs, round-trips, malformed → fresh', () => {
    const s = recordRun(setLoci(freshPalace(), ['a', 'b', 'c', 'd', 'e']), { date: '2026-09-28', loci: 5, correct: 4 })
    writePalace(s)
    expect(readPalace()).toEqual(s)
    localStorage.setItem(PALACE_KEY, 'x')
    expect(readPalace()).toEqual(freshPalace())
  })
})
