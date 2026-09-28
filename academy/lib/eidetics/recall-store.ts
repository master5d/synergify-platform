// lib/eidetics/recall-store.ts
// Чистые редьюсеры + localStorage для «Запомни ряд» (форма — lib/speedreading/schulte-store.ts).
// Ряд хранится, чтобы отложенная проверка могла сверить ответ, но на экране его больше не
// показывают. Данные не покидают браузер.
import type { Locale } from '../dictionaries'
import { isDelayedDue, scorePercent, type RecallScore, type SeriesKind } from './recall'

export const RECALL_KEY = 'eidetics_ryad'
const SESSIONS_CAP = 50

export interface RecallSession {
  id: string
  date: string
  studiedAt: number
  kind: SeriesKind
  locale: Locale
  items: string[]
  immediate: RecallScore
  delayed: RecallScore | null
  delayedAt: number | null
}
export interface RecallState { sessions: RecallSession[] }

export function freshRecall(): RecallState {
  return { sessions: [] }
}

export function recordImmediate(state: RecallState, session: Omit<RecallSession, 'delayed' | 'delayedAt'>): RecallState {
  const sessions = [...state.sessions, { ...session, delayed: null, delayedAt: null }]
  return { sessions: sessions.length > SESSIONS_CAP ? sessions.slice(sessions.length - SESSIONS_CAP) : sessions }
}

/** Отложенная проверка: только одна на сессию и только после окна MIN_DELAY_MS. */
export function recordDelayed(state: RecallState, id: string, score: RecallScore, at: number): RecallState {
  return {
    sessions: state.sessions.map(s =>
      s.id === id && s.delayed === null && isDelayedDue(s.studiedAt, at) ? { ...s, delayed: score, delayedAt: at } : s,
    ),
  }
}

/** Сессии, ждущие отложенной проверки: окно открыто (due) или ещё нет (waiting). */
export function pendingDelayed(state: RecallState, now: number): { due: RecallSession[]; waiting: RecallSession[] } {
  const open = state.sessions.filter(s => s.delayed === null)
  return {
    due: open.filter(s => isDelayedDue(s.studiedAt, now)),
    waiting: open.filter(s => !isDelayedDue(s.studiedAt, now)),
  }
}

export interface RecallSummary {
  count: number
  /** «До»: первая сессия. «После»: последняя. Проценты; delayed — null, пока не проверено. */
  before: { immediate: number; delayed: number | null } | null
  after: { immediate: number; delayed: number | null } | null
}

function pct(s: RecallSession) {
  return {
    immediate: scorePercent(s.kind, s.immediate),
    delayed: s.delayed ? scorePercent(s.kind, s.delayed) : null,
  }
}

export function summarizeRecall(state: RecallState): RecallSummary {
  const n = state.sessions.length
  if (n === 0) return { count: 0, before: null, after: null }
  return { count: n, before: pct(state.sessions[0]), after: n > 1 ? pct(state.sessions[n - 1]) : null }
}

export function readRecall(): RecallState {
  try {
    const raw = localStorage.getItem(RECALL_KEY)
    if (!raw) return freshRecall()
    const p = JSON.parse(raw) as Partial<RecallState>
    return { sessions: Array.isArray(p.sessions) ? p.sessions : [] }
  } catch {
    return freshRecall()
  }
}

export function writeRecall(state: RecallState): void {
  try { localStorage.setItem(RECALL_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}
