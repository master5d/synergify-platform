// lib/speedreading/wpm-test-store.ts
// Pure reducers + localStorage persistence with graceful fallback. Mirrors lib/pacing/store.ts.
import { WPM_KEY, type WpmTestState, type WpmResult } from './wpm-test-types'

const RESULTS_CAP = 50

export function freshWpmTest(): WpmTestState {
  return { results: [] }
}

export function recordTest(state: WpmTestState, result: WpmResult): WpmTestState {
  const results = [...state.results, result]
  const capped = results.length > RESULTS_CAP ? results.slice(results.length - RESULTS_CAP) : results
  return { ...state, results: capped }
}

export function readWpmTest(): WpmTestState {
  try {
    const raw = localStorage.getItem(WPM_KEY)
    if (!raw) return freshWpmTest()
    const p = JSON.parse(raw) as Partial<WpmTestState>
    return { results: Array.isArray(p.results) ? p.results : [] }
  } catch {
    return freshWpmTest()
  }
}

export function writeWpmTest(state: WpmTestState): void {
  try { localStorage.setItem(WPM_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}
