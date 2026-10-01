// Сертификат с уликами (intake LMS#17): чистая логика перечня освоенного и страницы проверки.
//
// Уликой считается только то, что записано на платформе (D1 `progress` через /api/progress/list):
// модуль спайна пройден, если есть строка уровня модуля ЛИБО завершены все его юниты
// (`модуль/юнит`). Это тот же критерий, что у воркера (workers/src/lib/course-completion.ts),
// поэтому перечень на странице совпадает с тем, что увидит проверяющий.
// НЕ улики: локальные отметки юнитов (localStorage, lib/unit-progress.ts — живут в одном браузере)
// и ответы «Проверь себя» (lib/self-check.ts — ответ не хранится вовсе).
import { MODULE_SLUGS } from '@/lib/rpg/modules'
import { getTransformation } from '@/lib/rpg/transformations'
import type { CourseOutline } from '@/lib/progress-sync'
import type { Locale } from '@/lib/dictionaries'

export interface ProgressRow {
  lesson_slug: string
  completed_at: number | null
  course?: string
}

export interface EvidenceModule {
  slug: string
  from: string
  to: string
  /** Юниты модуля, завершённые на платформе; total = юнитов в курсе (null — структура неизвестна). */
  units: { done: number; total: number | null }
  /** Unix-секунды: строка модуля или последний из его юнитов. */
  completedAt: number
}

export const SPINE_TOTAL = MODULE_SLUGS.length

/** Пройденные модули спайна в порядке курса, с трансформацией «от → к». */
export function buildEvidence(
  rows: ProgressRow[],
  outline: CourseOutline,
  locale: Locale,
  course?: string,
): EvidenceModule[] {
  const done = new Map<string, number>()
  for (const r of rows) {
    if (r.completed_at == null) continue
    if (course && r.course && r.course !== course) continue
    done.set(r.lesson_slug, r.completed_at)
  }
  const out: EvidenceModule[] = []
  for (const slug of MODULE_SLUGS) {
    const t = getTransformation(slug, locale)
    if (!t) continue
    const units = outline[slug] ?? []
    const unitTimes = units.map(u => done.get(`${slug}/${u}`)).filter((x): x is number => x !== undefined)
    const own = done.get(slug)
    const allUnits = units.length > 0 && unitTimes.length === units.length
    if (own === undefined && !allUnits) continue
    out.push({
      slug,
      from: t.from,
      to: t.to,
      units: { done: unitTimes.length, total: units.length || null },
      completedAt: own ?? Math.max(...unitTimes),
    })
  }
  return out
}

/** Адрес страницы проверки: тот же, что отдаёт воркер (`/certificate/verify/?c=`), с префиксом локали. */
export function verifyPageUrl(origin: string, locale: Locale, code: string, basePath = ''): string {
  return `${origin.replace(/\/+$/, '')}${basePath}${locale === 'en' ? '/en' : ''}/certificate/verify/?c=${encodeURIComponent(code)}`
}

/** Код из query-строки страницы проверки; пусто/мусор → null (до сети не доходим). */
export function readVerifyCode(search: string): string | null {
  const c = new URLSearchParams(search).get('c')
  if (!c || c.length > 120 || !/^[A-Za-z0-9-]+\.[A-Za-z0-9_-]+$/.test(c)) return null
  return c
}

export type VerifyResult =
  | { state: 'valid'; course: string; completedAt: string; modules: string[] }
  | { state: 'invalid' }

/** Ответ воркера → состояние страницы. Всё, что не строгое `valid: true` нужной формы, — «не подтверждён». */
export function interpretVerify(status: number, body: unknown): VerifyResult {
  if (status !== 200 || !body || typeof body !== 'object') return { state: 'invalid' }
  const b = body as Record<string, unknown>
  if (b.valid !== true || typeof b.course !== 'string' || typeof b.completedAt !== 'string') return { state: 'invalid' }
  if (!Array.isArray(b.modules) || !b.modules.every(m => typeof m === 'string')) return { state: 'invalid' }
  return { state: 'valid', course: b.course, completedAt: b.completedAt, modules: b.modules as string[] }
}

/** Модули из ответа проверки → строки «от → к» (незнакомые слаги пропускаются, не выдумываются). */
export function verifiedTransformations(modules: string[], locale: Locale): { slug: string; from: string; to: string }[] {
  return modules.flatMap(slug => {
    const t = getTransformation(slug, locale)
    return t ? [{ slug, ...t }] : []
  })
}
