// Досылка прогресса, накопленного без входа (курс с gates.auth: false — открытый, «Ретрит с двух сторон»).
//
// Юнит-прогресс пишется в localStorage всегда (lib/unit-progress.ts), а на сервер уходит best-effort
// (lib/progress-sync.ts): без сессии /api/progress/complete отвечает 401, и ученик этого не замечает.
// После логина сервер о пройденном раньше не знал. Здесь — один раз за сессию вкладки, если сессия есть
// (/api/progress/list → 200): шлём на сервер завершения, которые есть локально и которых нет на сервере.
//
// Только юниты из outline ЭТОГО курса: курсы школы живут на одном origin (/praktika, /retrit) и делят
// ключ unit_progress — без фильтра чужие юниты ушли бы на сервер с course этого курса.
import { parseProgress, type UnitProgressMap } from './unit-progress'
import { reportUnitCompleted, type CourseOutline } from './progress-sync'

/** Досылка только у открытых курсов (gates.auth: false) и не на зеркале. У курсов с входом юниты читают
 *  только вошедшие, отчёт уходит сразу; досылка там подняла бы давний локальный прогресс (до серверного
 *  учёта) разом — с событиями «модуль/курс завершён» и письмами за старое. */
export function backfillEnabled(gates: { auth: boolean }, isMirror: boolean): boolean {
  return !isMirror && !gates.auth
}

export interface PendingUnit { moduleSlug: string; unitSlug: string }

/** Юниты, пройденные локально, которых нет среди завершённых на сервере, — в порядке курса. */
export function pendingCompletions(local: UnitProgressMap, serverDone: Set<string>, outline: CourseOutline): PendingUnit[] {
  const out: PendingUnit[] = []
  for (const [moduleSlug, units] of Object.entries(outline)) {
    for (const unitSlug of units) {
      if (local[moduleSlug]?.[unitSlug] === true && !serverDone.has(`${moduleSlug}/${unitSlug}`)) {
        out.push({ moduleSlug, unitSlug })
      }
    }
  }
  return out
}

interface ProgressRow { lesson_slug: string; completed_at: number | null }

export interface BackfillDeps {
  course: string
  outline: CourseOutline
  /** Сырое значение localStorage[unit_progress] (null — пусто или хранилище недоступно). */
  readLocal: () => string | null
  fetchFn?: typeof fetch
}

/** Сколько юнитов дослано (0 — досылать нечего); null — сессии нет или сеть/ответ сломаны. Никогда не бросает. */
export async function backfillCompletions({ course, outline, readLocal, fetchFn = fetch }: BackfillDeps): Promise<number | null> {
  let rows: ProgressRow[]
  try {
    const r = await fetchFn('/api/progress/list', { credentials: 'include' })
    if (!r.ok) return null
    rows = (await r.json()) as ProgressRow[]
    if (!Array.isArray(rows)) return null
  } catch {
    return null
  }
  const serverDone = new Set(rows.filter((row) => row.completed_at).map((row) => row.lesson_slug))
  const pending = pendingCompletions(parseProgress(readLocal()), serverDone, outline)
  for (const { moduleSlug, unitSlug } of pending) {
    await reportUnitCompleted({ course, moduleSlug, unitSlug, outline }, fetchFn)
  }
  return pending.length
}

/** Ключ «уже досылали в этой вкладке» — ставится только после ответа сессии (не null), чтобы вход
 *  в той же вкладке (Google OAuth) ещё дал досылку; и чтобы не звать list на каждом уроке. */
export const backfillSessionKey = (course: string) => `lms:progress-backfill:${course}`
