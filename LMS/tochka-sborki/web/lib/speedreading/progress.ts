// lib/speedreading/progress.ts
// Aggregates the three trainer stores for the /speedreading hub, and grants Cognitive Shards for
// one-time trainer milestones (Скорочтение epic, slice 5). This file holds the ONE intentional one-way
// bridge to the CS layer (@/lib/cs); nothing in @/lib/cs depends on speedreading. Grants are idempotent
// via applyCredit's earnedUnits ledger and one-time (non-farmable), keys namespaced `sr:*`.
import type { Bi } from '@/lib/course'
import type { Wallet } from '@/lib/cs/types'
import { applyCredit } from '@/lib/cs/wallet'
import type { RsvpState } from './rsvp-types'
import type { SchulteState } from './schulte-types'
import type { WpmTestState } from './wpm-test-types'

export interface Milestone { key: string; cs: number; label: Bi }

export const MILESTONES: Milestone[] = [
  { key: 'sr:rsvp:first',    cs: 20, label: { ru: 'Первая тренировка ритма', en: 'First rhythm session' } },
  { key: 'sr:schulte:first', cs: 20, label: { ru: 'Первая таблица',          en: 'First table' } },
  { key: 'sr:wpm:first',     cs: 20, label: { ru: 'Первый замер скорости',   en: 'First speed check' } },
]

export function earnedMilestoneKeys(rsvp: RsvpState, schulte: SchulteState, wpm: WpmTestState): string[] {
  const keys: string[] = []
  if (rsvp.sessions.length >= 1) keys.push('sr:rsvp:first')
  if (schulte.sessions.length >= 1) keys.push('sr:schulte:first')
  if (wpm.results.length >= 1) keys.push('sr:wpm:first')
  return keys
}

export function grantMilestoneCredits(wallet: Wallet, rsvp: RsvpState, schulte: SchulteState, wpm: WpmTestState): Wallet {
  const earned = new Set(earnedMilestoneKeys(rsvp, schulte, wpm))
  return MILESTONES.reduce((w, m) => (earned.has(m.key) ? applyCredit(w, m.key, m.cs) : w), wallet)
}

export interface ProgressSummary {
  rsvpSessions: number
  rsvpLastWpm: number | null
  schulteBestMs: number | null
  schulteSizes: number[]
  wpmCount: number
  wpmLatestEff: number | null
  wpmFirstEff: number | null
  wpmDelta: number | null
}

export function summarizeProgress(rsvp: RsvpState, schulte: SchulteState, wpm: WpmTestState): ProgressSummary {
  const bestValues = Object.values(schulte.best)
  const results = wpm.results
  const latest = results.length ? results[results.length - 1].effectiveWpm : null
  const first = results.length ? results[0].effectiveWpm : null
  return {
    rsvpSessions: rsvp.sessions.length,
    rsvpLastWpm: rsvp.sessions.length ? rsvp.sessions[rsvp.sessions.length - 1].wpm : null,
    schulteBestMs: bestValues.length ? Math.min(...bestValues) : null,
    schulteSizes: Object.keys(schulte.best).map(Number).sort((a, b) => a - b),
    wpmCount: results.length,
    wpmLatestEff: latest,
    wpmFirstEff: first,
    wpmDelta: latest !== null && first !== null ? latest - first : null,
  }
}
