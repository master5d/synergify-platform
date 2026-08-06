import { PACING_KEY, type PacingState, type CalibrationRating } from './types'
import type { Mode } from '@/lib/cs/types'

const COMPLETIONS_CAP = 50
const ACTIVE_DATES_CAP = 60

export function freshPacing(): PacingState {
  return { activeDates: [], lastSeen: '', completions: [], calibration: {}, dismissed: {} }
}

function addDate(dates: string[], date: string): string[] {
  if (dates.includes(date)) return dates
  const next = [...dates, date].sort()
  return next.length > ACTIVE_DATES_CAP ? next.slice(next.length - ACTIVE_DATES_CAP) : next
}

export function logCompletion(state: PacingState, unitKey: string, mode: Mode, date: string): PacingState {
  const activeDates = addDate(state.activeDates, date)
  if (state.completions.some(c => c.unitKey === unitKey && c.date === date)) {
    return { ...state, activeDates }
  }
  const completions = [...state.completions, { unitKey, date, mode }]
  const capped = completions.length > COMPLETIONS_CAP
    ? completions.slice(completions.length - COMPLETIONS_CAP)
    : completions
  return { ...state, completions: capped, activeDates }
}

export function touch(state: PacingState, date: string): PacingState {
  return { ...state, lastSeen: date, activeDates: addDate(state.activeDates, date) }
}

export function recordCalibration(state: PacingState, moduleSlug: string, rating: CalibrationRating): PacingState {
  return {
    ...state,
    calibration: { ...state.calibration, [moduleSlug]: rating },
    lastCalibration: { module: moduleSlug, rating },
  }
}

export function dismissNudge(state: PacingState, key: string, date: string): PacingState {
  return { ...state, dismissed: { ...state.dismissed, [key]: date } }
}

export function readPacing(): PacingState {
  try {
    const raw = localStorage.getItem(PACING_KEY)
    if (!raw) return freshPacing()
    const p = JSON.parse(raw) as Partial<PacingState>
    return {
      activeDates: Array.isArray(p.activeDates) ? p.activeDates : [],
      lastSeen: typeof p.lastSeen === 'string' ? p.lastSeen : '',
      completions: Array.isArray(p.completions) ? p.completions : [],
      calibration: p.calibration && typeof p.calibration === 'object' ? p.calibration : {},
      lastCalibration: p.lastCalibration,
      dismissed: p.dismissed && typeof p.dismissed === 'object' ? p.dismissed : {},
    }
  } catch {
    return freshPacing()
  }
}

export function writePacing(state: PacingState): void {
  try { localStorage.setItem(PACING_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}
