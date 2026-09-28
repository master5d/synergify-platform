// lib/eidetics/palace-store.ts
// «Свой дворец памяти»: маршрут пользователя (точки по порядку) + журнал прогонов.
// Маршрут часто — собственная квартира или дорога, поэтому живёт только в localStorage.
export const PALACE_KEY = 'eidetics_dvorec'
export const MIN_LOCI = 5
export const MAX_LOCI = 10
const RUNS_CAP = 50

export interface PalaceRun { date: string; loci: number; correct: number }
export interface PalaceState { loci: string[]; runs: PalaceRun[] }

export function freshPalace(): PalaceState {
  return { loci: [], runs: [] }
}

/** Чистит маршрут: пустые строки выкидываются, длина обрезается до MAX_LOCI. */
export function setLoci(state: PalaceState, loci: string[]): PalaceState {
  const clean = loci.map(l => l.trim()).filter(Boolean).slice(0, MAX_LOCI)
  return { ...state, loci: clean }
}

export function isRouteReady(state: PalaceState): boolean {
  return state.loci.length >= MIN_LOCI
}

export function recordRun(state: PalaceState, run: PalaceRun): PalaceState {
  const runs = [...state.runs, run]
  return { ...state, runs: runs.length > RUNS_CAP ? runs.slice(runs.length - RUNS_CAP) : runs }
}

export function readPalace(): PalaceState {
  try {
    const raw = localStorage.getItem(PALACE_KEY)
    if (!raw) return freshPalace()
    const p = JSON.parse(raw) as Partial<PalaceState>
    return {
      loci: Array.isArray(p.loci) ? p.loci.filter((l): l is string => typeof l === 'string').slice(0, MAX_LOCI) : [],
      runs: Array.isArray(p.runs) ? p.runs : [],
    }
  } catch {
    return freshPalace()
  }
}

export function writePalace(state: PalaceState): void {
  try { localStorage.setItem(PALACE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}
