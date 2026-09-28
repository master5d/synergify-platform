import type { Locale } from '@/lib/intake/types'
import { WEEK_BUCKETS, WEEK_MAP_MAX_TASKS, WEEK_MAP_MIN_TASKS, type TaskKind, type WeekBucket } from './week-map'
import { WEEK_MAP } from '@/lib/course/week-map'

// Копия и таблица «тип работы → модуль» — course-data в pack'е (packs/<pack>/course/week-map.ts,
// intake LMS#17); этот builder и <WeekMapCard> — движок. Мирует automation-check-content.

export interface WeekMapBucketContent {
  label: string
  hint: string
  moduleLead: string
}

export interface WeekMapContent {
  moduleByKind: Record<TaskKind, string>
  eyebrow: string
  lead: string
  inputLabel: string
  placeholder: string
  addButton: string
  removeLabel: string
  /** Функция, а не строка: число задач меняется на лету. */
  countHint: (n: number) => string
  limitReached: string
  rejectedEmpty: string
  rejectedDuplicate: string
  unsortedHint: string
  tooFew: string
  empty: string
  routeHeading: string
  routeLead: string
  buckets: Record<WeekBucket, WeekMapBucketContent>
}

function fill(s: string, vars: Record<string, number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))
}

export function buildWeekMapContent(locale: Locale): WeekMapContent {
  const T = WEEK_MAP
  const limits = { min: WEEK_MAP_MIN_TASKS, max: WEEK_MAP_MAX_TASKS }
  const buckets = Object.fromEntries(
    WEEK_BUCKETS.map(b => [
      b,
      { label: T.buckets[b].label[locale], hint: T.buckets[b].hint[locale], moduleLead: T.buckets[b].moduleLead[locale] },
    ]),
  ) as Record<WeekBucket, WeekMapBucketContent>

  return {
    moduleByKind: T.moduleByKind,
    eyebrow: T.eyebrow[locale],
    lead: T.lead[locale],
    inputLabel: T.inputLabel[locale],
    placeholder: T.placeholder[locale],
    addButton: T.addButton[locale],
    removeLabel: T.removeLabel[locale],
    countHint: (n: number) => fill(T.countHint[locale], { n, ...limits }),
    limitReached: fill(T.limitReached[locale], limits),
    rejectedEmpty: T.rejectedEmpty[locale],
    rejectedDuplicate: T.rejectedDuplicate[locale],
    unsortedHint: T.unsortedHint[locale],
    tooFew: fill(T.tooFew[locale], limits),
    empty: T.empty[locale],
    routeHeading: T.routeHeading[locale],
    routeLead: T.routeLead[locale],
    buckets,
  }
}
