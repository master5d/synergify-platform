// Завершённость курса по данным D1 — один критерий для допуска академии (handlers/academy.ts)
// и для проверки сертификата (handlers/certificate.ts).
//
// Модуль из COURSE_CATALOG считается пройденным, если в `progress` есть ЛИБО строка уровня
// модуля (`00-kickstart`, старый формат и LessonLayout), ЛИБО завершены все его юниты
// (`00-kickstart/u0-azbuka`…, формат юнитов с intake LMS#3). До этого допуск смотрел только
// строки уровня модуля, а интерфейс юнитов их не пишет — дверь для новых учеников не
// открывалась. Список юнитов берётся из `_meta.json` pack'а (тот же приём, что registry.json
// в return-base.ts): копии нет, расходиться нечему.
import { COURSE_CATALOG } from './course-catalog'
import m00 from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/ru/00-kickstart/_meta.json'
import m01 from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/ru/01-introduction/_meta.json'
import m02 from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/ru/02-setup-guide/_meta.json'
import m03 from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/ru/03-stack-selection/_meta.json'
import m04 from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/ru/04-prompt-engineering/_meta.json'
import m05 from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/ru/05-context-memory/_meta.json'
import m06 from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/ru/06-audio-pipeline/_meta.json'
import m07 from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/ru/07-tools/_meta.json'
import m08 from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/ru/08-agent-engineering/_meta.json'

export const COMPLETION_COURSE = 'tochka-sborki'

type Meta = { units: { slug: string }[] }
const METAS: Record<string, Meta> = {
  '00-kickstart': m00, '01-introduction': m01, '02-setup-guide': m02, '03-stack-selection': m03,
  '04-prompt-engineering': m04, '05-context-memory': m05, '06-audio-pipeline': m06, '07-tools': m07,
  '08-agent-engineering': m08,
}

/** Модуль каталога → слаги его юнитов (порядок pack'а). */
export const CATALOG_UNITS: Record<string, string[]> = Object.fromEntries(
  COURSE_CATALOG.map(m => [m.slug, (METAS[m.slug]?.units ?? []).map(u => u.slug)]),
)

export interface ProgressRow { lesson_slug: string; completed_at?: number | null }

export interface ModuleCompletion { slug: string; completedAt: number }

/** Пройденные модули каталога в порядке каталога; время — когда модуль закрылся
 *  (строка модуля или последний из его юнитов). */
export function completedCatalogModules(rows: ProgressRow[]): ModuleCompletion[] {
  const done = new Map<string, number>()
  // Строки приходят уже отфильтрованными (`completed_at IS NOT NULL`, loadCompletedRows).
  for (const r of rows) done.set(r.lesson_slug, Number(r.completed_at ?? 0))
  const out: ModuleCompletion[] = []
  for (const { slug } of COURSE_CATALOG) {
    const own = done.get(slug)
    if (own != null) { out.push({ slug, completedAt: own }); continue }
    const units = CATALOG_UNITS[slug] ?? []
    if (units.length === 0) continue
    const times = units.map(u => done.get(`${slug}/${u}`))
    if (times.every((t): t is number => t !== undefined)) out.push({ slug, completedAt: Math.max(...times) })
  }
  return out
}

/** Модули каталога, которых не хватает до завершения курса. */
export function missingCatalogModules(rows: ProgressRow[]): string[] {
  const done = new Set(completedCatalogModules(rows).map(m => m.slug))
  return COURSE_CATALOG.map(m => m.slug).filter(s => !done.has(s))
}

export async function loadCompletedRows(db: D1Database, userId: string, course: string): Promise<ProgressRow[]> {
  const { results } = await db.prepare(
    'SELECT lesson_slug, completed_at FROM progress WHERE user_id = ? AND course = ? AND completed_at IS NOT NULL'
  ).bind(userId, course).all<ProgressRow>()
  return results ?? []
}
