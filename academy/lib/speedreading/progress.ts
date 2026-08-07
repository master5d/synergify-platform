// lib/speedreading/progress.ts
// Aggregates the three trainer stores for the /trenazhery hub.
// В LMS здесь жил односторонний мост к кошельку Cognitive Shards (@/lib/cs);
// в академии кошелька нет — при переезде мост отрезан, остался только
// localStorage-прогресс (summarizeProgress).
import type { RsvpState } from './rsvp-types'
import type { SchulteState } from './schulte-types'
import type { WpmTestState } from './wpm-test-types'

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
