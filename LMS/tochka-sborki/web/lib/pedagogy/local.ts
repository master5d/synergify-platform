// Локальное состояние педагогических приёмов (LMS#20): догадки pretest и свои мысли «сначала сам».
// Живёт только в браузере ученика (localStorage), на сервер не уходит. Хранилище может отсутствовать
// или бросать (приватное окно, запрет сайта) — тогда приём работает в пределах просмотра страницы.

export const pretestKey = (course: string, unitKey: string) => `lms:pretest:${course}:${unitKey}`
export const thinkKey = (course: string, unitKey: string) => `lms:think-first:${course}:${unitKey}`

export function readJson(key: string): unknown {
  try {
    const raw = globalThis.localStorage?.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function writeJson(key: string, value: unknown): void {
  try { globalThis.localStorage?.setItem(key, JSON.stringify(value)) } catch { /* без хранилища — только этот просмотр */ }
}

/** Догадки pretest: { id вопроса: индекс варианта }. Мусор отбрасывается. */
export function parseGuesses(v: unknown): Record<string, number> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const out: Record<string, number> = {}
  for (const [k, n] of Object.entries(v as Record<string, unknown>)) if (Number.isInteger(n) && (n as number) >= 0) out[k] = n as number
  return out
}

// ── «Сначала сам» (Педагогика 3; ICAP, self-explanation) ──────────────────────────────────────────
export const THINK_SLOTS = 3
export const THINK_MIN = 2
export const THINK_MIN_CHARS = 3

export type ThinkStatus = 'locked' | 'written' | 'skipped'
export interface ThinkState { thoughts: string[]; status: ThinkStatus }

export const THINK_LOCKED: ThinkState = { thoughts: Array(THINK_SLOTS).fill(''), status: 'locked' }

/** Мысли, которые считаются: непустые, не короче трёх знаков. */
export function filledThoughts(thoughts: string[]): string[] {
  return thoughts.map(t => t.trim()).filter(t => t.length >= THINK_MIN_CHARS)
}

export const canOpen = (s: ThinkState) => filledThoughts(s.thoughts).length >= THINK_MIN

/** «Открыть конспект»: только при 2+ мыслях; иначе состояние не меняется. */
export function thinkSubmit(s: ThinkState): ThinkState {
  return canOpen(s) ? { thoughts: s.thoughts, status: 'written' } : s
}

/** «Пропустить»: вкладки открываются, записанное (если было) не показывается как «мои мысли». */
export function thinkSkip(s: ThinkState): ThinkState {
  return { thoughts: s.thoughts, status: 'skipped' }
}

export function thinkEdit(s: ThinkState, i: number, text: string): ThinkState {
  const thoughts = s.thoughts.slice()
  thoughts[i] = text
  return { ...s, thoughts }
}

export function parseThink(v: unknown): ThinkState | null {
  if (!v || typeof v !== 'object') return null
  const o = v as { thoughts?: unknown; status?: unknown }
  if (!Array.isArray(o.thoughts) || !['locked', 'written', 'skipped'].includes(o.status as string)) return null
  const thoughts = o.thoughts.filter((t): t is string => typeof t === 'string').slice(0, THINK_SLOTS)
  while (thoughts.length < THINK_SLOTS) thoughts.push('')
  const s: ThinkState = { thoughts, status: o.status as ThinkStatus }
  // «written» без двух мыслей — порченая запись: снова закрыто.
  return s.status === 'written' && !canOpen(s) ? { thoughts, status: 'locked' } : s
}
