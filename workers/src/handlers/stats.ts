// Authoritative learner counts for the owner-gated admin + lesson drop-off funnel.
import { loadSpacedReviewStats } from '../lib/check-reviews'

// Сколько дней без активности в курсе считается «бросил»: последний завершённый
// урок такого ученика идёт в dropoff. Совпадает с LAPSE_SEC из lib/nudge-policy
// (14 дней) — там, где бот перестаёт напоминать, ученик и в статистике ушёл.
export const STALL_DAYS = 14

export interface FunnelRow { module: string; unit: string | null; reached: number; completed: number }
export interface DropoffRow { course: string; module: string | null; unit: string | null; stalled: number }

// lesson_slug — «модуль» или «модуль/юнит»; плоские уроки (cheatsheet…) — как модуль без юнита.
function splitSlug(slug: string): { module: string; unit: string | null } {
  const i = slug.indexOf('/')
  return i < 0 ? { module: slug, unit: null } : { module: slug.slice(0, i), unit: slug.slice(i + 1) }
}

// Порядок курса — из данных pack'а, без списка слагов в движке: модули и юниты
// в _meta.json пронумерованы префиксами (`03-…`, `u2-…`), и веб сортирует их так же.
// Сравнение посегментно и численно (u10 после u2); без номера — в конец, по алфавиту.
const collator = new Intl.Collator('en', { numeric: true })
function segKey(seg: string): [number, string] {
  return /^[a-z]*\d/i.test(seg) ? [0, seg] : [1, seg]
}
export function compareLessonSlugs(a: string, b: string): number {
  const as = a.split('/'), bs = b.split('/')
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    if (as[i] === undefined) return -1          // модуль раньше своих юнитов
    if (bs[i] === undefined) return 1
    const [ag, av] = segKey(as[i]), [bg, bv] = segKey(bs[i])
    if (ag !== bg) return ag - bg
    const c = collator.compare(av, bv)
    if (c !== 0) return c
  }
  return 0
}

export async function getStats(
  db: D1Database,
  nowSec = Math.floor(Date.now() / 1000),
  opts: { spacedReview?: boolean } = {},
): Promise<Response> {
  const count = async (sql: string): Promise<number> =>
    (await db.prepare(sql).first<{ c: number }>())?.c ?? 0

  const total = await count('SELECT COUNT(*) AS c FROM users')
  const learners = await count('SELECT COUNT(DISTINCT user_id) AS c FROM progress')
  const intakeCompleted = await count("SELECT COUNT(*) AS c FROM intake_profiles WHERE status = 'completed'")
  // Зарегистрированы, но ни одной строки прогресса (ни в одном курсе).
  const notStarted = await count(
    'SELECT COUNT(*) AS c FROM users u WHERE NOT EXISTS (SELECT 1 FROM progress p WHERE p.user_id = u.id)'
  )

  // Воронка: один проход по progress. PK (user_id, lesson_slug) → COUNT(*) = число учеников.
  const funnelRows = (await db.prepare(
    `SELECT course, lesson_slug, COUNT(*) AS reached,
            SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) AS completed
     FROM progress GROUP BY course, lesson_slug`
  ).all<{ course: string; lesson_slug: string; reached: number; completed: number }>()).results ?? []

  const bySlug: Record<string, { slug: string; row: FunnelRow }[]> = {}
  for (const r of funnelRows) {
    ;(bySlug[r.course] ??= []).push({
      slug: r.lesson_slug,
      row: { ...splitSlug(r.lesson_slug), reached: r.reached, completed: r.completed ?? 0 },
    })
  }
  const funnel: Record<string, FunnelRow[]> = {}
  for (const course of Object.keys(bySlug).sort()) {
    funnel[course] = bySlug[course].sort((a, b) => compareLessonSlugs(a.slug, b.slug)).map(x => x.row)
  }

  // Dropoff: ученики, неактивные в курсе дольше STALL_DAYS, сгруппированы по последнему
  // (по времени) завершённому уроку. NULL — начал, но ничего не завершил.
  // Ничья по completed_at разрешается детерминированно (больший слаг).
  const stallRows = (await db.prepare(
    `WITH per_user AS (
       SELECT user_id, course,
              MAX(MAX(viewed_at, COALESCE(completed_at, 0))) AS last_active,
              MAX(completed_at) AS last_done_at
       FROM progress GROUP BY user_id, course
     )
     SELECT u.course AS course,
            (SELECT p.lesson_slug FROM progress p
              WHERE p.user_id = u.user_id AND p.course = u.course AND p.completed_at = u.last_done_at
              ORDER BY p.lesson_slug DESC LIMIT 1) AS last_done,
            COUNT(*) AS stalled
     FROM per_user u
     WHERE u.last_active < ?
     GROUP BY u.course, last_done`
  ).bind(nowSec - STALL_DAYS * 24 * 60 * 60)
    .all<{ course: string; last_done: string | null; stalled: number }>()).results ?? []

  const dropoff: DropoffRow[] = stallRows
    .map(r => ({ r, ...(r.last_done == null ? { module: null, unit: null } : splitSlug(r.last_done)) }))
    .sort((a, b) =>
      b.r.stalled - a.r.stalled
      || a.r.course.localeCompare(b.r.course)
      || (a.r.last_done == null ? -1 : b.r.last_done == null ? 1 : compareLessonSlugs(a.r.last_done, b.r.last_done)))
    .map(({ r, module, unit }) => ({ course: r.course, module, unit, stalled: r.stalled }))

  // Стоп-критерий пилота интервального повтора — только при включённом флаге: до миграции 0022 таблицы нет.
  const spacedReview = opts.spacedReview ? await loadSpacedReviewStats(db, nowSec) : undefined

  return Response.json({ total, learners, intakeCompleted, notStarted, stallDays: STALL_DAYS, funnel, dropoff, spacedReview })
}
