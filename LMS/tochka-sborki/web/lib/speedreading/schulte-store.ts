// lib/speedreading/schulte-store.ts
// Pure reducers + localStorage persistence with graceful fallback. Mirrors lib/pacing/store.ts.
// The store takes `date` as an argument — no clock inside (the hook supplies localDate()).
import { SCHULTE_KEY, type SchulteState } from './schulte-types'
import { DEFAULT_SIZE, clampSize } from './schulte'

const SESSIONS_CAP = 50

export function freshSchulte(): SchulteState {
  return { size: DEFAULT_SIZE, best: {}, sessions: [] }
}

export function setSize(state: SchulteState, n: number): SchulteState {
  return { ...state, size: clampSize(n) }
}

export function recordResult(state: SchulteState, size: number, ms: number, errors: number, date: string): SchulteState {
  const prev = state.best[size]
  const best = prev === undefined || ms < prev ? { ...state.best, [size]: ms } : state.best
  const sessions = [...state.sessions, { date, size, ms, errors }]
  const capped = sessions.length > SESSIONS_CAP ? sessions.slice(sessions.length - SESSIONS_CAP) : sessions
  return { ...state, best, sessions: capped }
}

export function readSchulte(): SchulteState {
  try {
    const raw = localStorage.getItem(SCHULTE_KEY)
    if (!raw) return freshSchulte()
    const p = JSON.parse(raw) as Partial<SchulteState>
    return {
      size: clampSize(typeof p.size === 'number' ? p.size : DEFAULT_SIZE),
      best: p.best && typeof p.best === 'object' ? p.best as Record<number, number> : {},
      sessions: Array.isArray(p.sessions) ? p.sessions : [],
    }
  } catch {
    return freshSchulte()
  }
}

export function writeSchulte(state: SchulteState): void {
  try { localStorage.setItem(SCHULTE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}
