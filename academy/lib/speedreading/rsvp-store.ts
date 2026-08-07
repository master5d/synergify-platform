// lib/speedreading/rsvp-store.ts
// Pure reducers + localStorage persistence with graceful fallback. Mirrors lib/pacing/store.ts.
import { RSVP_KEY, type RsvpState, type RsvpSession } from './rsvp-types'
import { DEFAULT_WPM, DEFAULT_CHUNK, clampWpm, clampChunk } from './rsvp'

const SESSIONS_CAP = 50

export function freshRsvp(): RsvpState {
  return { wpm: DEFAULT_WPM, chunkSize: DEFAULT_CHUNK, sessions: [] }
}

export function setWpm(state: RsvpState, wpm: number): RsvpState {
  return { ...state, wpm: clampWpm(wpm) }
}

export function setChunk(state: RsvpState, n: number): RsvpState {
  return { ...state, chunkSize: clampChunk(n) }
}

export function logSession(state: RsvpState, session: RsvpSession): RsvpState {
  const sessions = [...state.sessions, session]
  const capped = sessions.length > SESSIONS_CAP ? sessions.slice(sessions.length - SESSIONS_CAP) : sessions
  return { ...state, sessions: capped }
}

export function readRsvp(): RsvpState {
  try {
    const raw = localStorage.getItem(RSVP_KEY)
    if (!raw) return freshRsvp()
    const p = JSON.parse(raw) as Partial<RsvpState>
    return {
      wpm: clampWpm(typeof p.wpm === 'number' ? p.wpm : DEFAULT_WPM),
      chunkSize: clampChunk(typeof p.chunkSize === 'number' ? p.chunkSize : DEFAULT_CHUNK),
      sessions: Array.isArray(p.sessions) ? p.sessions : [],
    }
  } catch {
    return freshRsvp()
  }
}

export function writeRsvp(state: RsvpState): void {
  try { localStorage.setItem(RSVP_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}
