import type { PacingState } from './types'
import type { Mode } from '@/lib/cs/types'

const RANK: Record<Mode, number> = { commander: 0, copilot: 1, archmage: 2 }

export function todayCount(state: PacingState, today: string): number {
  return state.completions.filter(c => c.date === today).length
}

function dayBefore(date: string): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function currentStreak(state: PacingState, today: string): number {
  const set = new Set(state.activeDates)
  let cursor: string | null = set.has(today)
    ? today
    : (set.has(dayBefore(today)) ? dayBefore(today) : null)
  let n = 0
  while (cursor && set.has(cursor)) { n++; cursor = dayBefore(cursor) }
  return n
}

export function daysBetween(from: string, to: string): number {
  const a = new Date(from + 'T00:00:00').getTime()
  const b = new Date(to + 'T00:00:00').getTime()
  return Math.round((b - a) / 86400000)
}

export function recentDowngrade(state: PacingState): boolean {
  const recent = state.completions.slice(-3)
  if (recent.length < 2) return false
  for (let i = 1; i < recent.length; i++) {
    if (RANK[recent[i].mode] >= RANK[recent[i - 1].mode]) return false
  }
  return true
}
