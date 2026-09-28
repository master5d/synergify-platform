// Учебные цепочки писем — ЧИСТАЯ политика «какой шаг слать сегодня» (контракт:
// workers/email-templates/README.md). I/O (D1, Listmonk tx) — в handlers/email-chain-cron.ts.
// Как nudge-policy.ts: всё, что решает, — здесь и под тестом; обработчик только собирает вход.
import {
  MODULE_ORDER, MODULE_META,
  lessonUrl, homeUrl, supportUrl, certificateUrl, academyUrl,
} from './course-order'
export { pickLocale } from './bot-copy'   // users.language → 'en' | 'ru', как у Telegram-бота

const HOUR = 60 * 60
const DAY = 24 * HOUR

export const EMAIL_THROTTLE_SEC = 20 * HOUR   // не больше одного учебного письма за 20 ч (≈ раз в день)
export const QUIET_SEC = 20 * HOUR            // напоминания молчат, если ученик был активен за 20 ч

// Окна [от, до) в днях. Верхняя граница — чтобы включение флага (или пропущенный cron) не разослал
// давно устаревшие шаги всей базе: не успели в окно — шаг пропущен, а не отправлен с опозданием.
export const WINDOWS = {
  'start-1': [2, 5],
  'start-2': [5, 12],
  'lapse-1': [3, 7],
  'lapse-2': [7, 14],
  'lapse-3': [14, 21],
  milestone: [0, 7],       // от события progress_events
  'finish-1': [0, 14],     // от события kind='course'
  'finish-2': [7, 14],     // от отправки finish-1
} as const

export type Step = 'start-1' | 'start-2' | 'lapse-1' | 'lapse-2' | 'lapse-3' | 'milestone' | 'finish-1' | 'finish-2'
export type Locale = 'ru' | 'en'
type Bi = { ru: string; en: string }

/** Курс, по которому идут цепочки. Второй курс = ещё одна запись в CHAIN_COURSES
 *  (+ его шаблоны `<templatePrefix>-<step>-<lang>` в Listmonk). */
export interface ChainCourse {
  key: string                // progress.course / progress_events.course / email_sends.course
  templatePrefix: string     // префикс имени tx-шаблона
  name: Bi                   // course_name в письме
  spine: readonly string[]   // обязательные модули по порядку (done/total, next)
  startUnit: string          // start-1 → start_url
  azbukaUnit: string         // start-2 → start_url
}

export const TOCHKA_SBORKI: ChainCourse = {
  key: 'tochka-sborki',
  templatePrefix: 'ts',
  name: { ru: 'Точка Сборки', en: 'Tochka Sborki' },
  spine: MODULE_ORDER,
  // «Первый юнит модуля 00» — первый содержательный: u0-azbuka стоит раньше, но это отдельный
  // шаг start-2 («шесть слов до старта»), и две одинаковые ссылки подряд бессмысленны.
  startUnit: '00-kickstart/u1-map',
  azbukaUnit: '00-kickstart/u0-azbuka',
}

export const CHAIN_COURSES: readonly ChainCourse[] = [TOCHKA_SBORKI]

export interface ProgressRow { lesson_slug: string; viewed_at: number; completed_at: number | null }
export interface ModuleEvent { subject: string; created_at: number }

export interface ChainInput {
  nowSec: number
  locale: Locale
  course: ChainCourse
  createdAt: number              // users.created_at — день регистрации
  emailOptout: boolean
  lastEmailAt: number | null
  telegramNudges: boolean        // telegram_id IS NOT NULL AND nudge_optout = 0 → напоминания идут в Telegram
  progress: ProgressRow[]        // progress этого курса
  moduleEvents: ModuleEvent[]    // progress_events kind='module' этого курса
  courseEventAt: number | null   // progress_events kind='course'
  sent: Map<string, number>      // email_sends: step_key → sent_at
}

export type ChainData = Record<string, string | number>

export interface ChainPick {
  step: Step
  stepKey: string
  data: ChainData
  /** Ключи, которые надо пометить отправленными вместе с этим шагом (схлопнутые milestone). */
  alsoMark: string[]
}

export function templateName(course: ChainCourse, step: Step, locale: Locale): string {
  return `${course.templatePrefix}-${step}-${locale}`
}

const utcDay = (sec: number) => new Date(sec * 1000).toISOString().slice(0, 10)
const within = (ageSec: number, [from, to]: readonly [number, number]) => ageSec >= from * DAY && ageSec < to * DAY
const moduleOf = (slug: string) => slug.split('/')[0]
const titleOf = (mod: string, l: Locale) => MODULE_META[mod]?.title[l] ?? mod
export const milestoneKey = (mod: string) => `milestone@${mod}`

export function pickStep(i: ChainInput): ChainPick | null {
  if (i.emailOptout) return null
  if (i.lastEmailAt != null && i.nowSec - i.lastEmailAt < EMAIL_THROTTLE_SEC) return null

  const l = i.locale
  const base: ChainData = { course_name: i.course.name[l], home_url: homeUrl(l) }
  const done = doneModules(i)
  const unsentMilestones = i.moduleEvents
    .filter(e => !i.sent.has(milestoneKey(e.subject)))
    .sort((a, b) => b.created_at - a.created_at || i.course.spine.indexOf(b.subject) - i.course.spine.indexOf(a.subject))
  const allMilestoneKeys = unsentMilestones.map(e => milestoneKey(e.subject))
  const pick = (step: Step, stepKey: string, data: ChainData, alsoMark: string[] = []): ChainPick =>
    ({ step, stepKey, data: { ...base, ...data }, alsoMark })

  // 1. finish — курс закрыт. Висящие milestone схлопываются в него.
  if (i.courseEventAt != null) {
    if (!i.sent.has('finish-1') && within(i.nowSec - i.courseEventAt, WINDOWS['finish-1'])) {
      return pick('finish-1', 'finish-1', { certificate_url: certificateUrl(l) }, allMilestoneKeys)
    }
    const f1 = i.sent.get('finish-1')
    if (f1 != null && !i.sent.has('finish-2') && within(i.nowSec - f1, WINDOWS['finish-2'])) {
      return pick('finish-2', 'finish-2', {
        academy_url: academyUrl(l),   // решение владельца 2026-09-28: приглашение в академию
        support_url: supportUrl(l),
      }, allMilestoneKeys)
    }
  }

  // 2. milestone — самое свежее непосланное событие; остальные помечаются, чтобы не копились.
  const fresh = unsentMilestones.find(e => within(i.nowSec - e.created_at, WINDOWS.milestone))
  if (fresh) {
    const mod = fresh.subject
    const idx = i.course.spine.indexOf(mod)
    const next = idx < 0 ? undefined : i.course.spine.slice(idx + 1).find(m => !done.has(m))
    const t = MODULE_META[mod]
    return pick('milestone', milestoneKey(mod), {
      module_title: titleOf(mod, l),
      next_title: next ? titleOf(next, l) : '',
      next_url: next ? lessonUrl(next, l) : '',
      done_modules: countSpine(i.course, done),
      total_modules: i.course.spine.length,
      from: t?.from[l] ?? '',
      to: t?.to[l] ?? '',
    }, allMilestoneKeys.filter(k => k !== milestoneKey(mod)))
  }

  // 3–4. Напоминания: канал один (Telegram важнее), и не сразу после активности.
  if (i.telegramNudges) return null
  const lastActivityAt = i.progress.reduce<number | null>(
    (m, r) => Math.max(m ?? 0, r.viewed_at ?? 0, r.completed_at ?? 0), null)
  if (lastActivityAt != null && i.nowSec - lastActivityAt < QUIET_SEC) return null

  // 3. lapse — курс начат и не закончен.
  if (lastActivityAt != null) {
    if (i.courseEventAt != null) return null
    const resume = resumeTarget(i, done)
    if (!resume) return null
    const idle = i.nowSec - lastActivityAt
    const episode = utcDay(lastActivityAt)
    for (const step of ['lapse-3', 'lapse-2', 'lapse-1'] as const) {
      if (!within(idle, WINDOWS[step])) continue
      const key = `${step}@${episode}`
      if (i.sent.has(key)) return null
      const resumeUrl = lessonUrl(resume.slug, l)
      const data: ChainData =
        step === 'lapse-1' ? { module_title: titleOf(resume.module, l), resume_url: resumeUrl, done_modules: countSpine(i.course, done), total_modules: i.course.spine.length }
        : step === 'lapse-2' ? { module_title: titleOf(resume.module, l), resume_url: resumeUrl, support_url: supportUrl(l) }
        : { resume_url: resumeUrl }
      return pick(step, key, data)
    }
    return null
  }

  // 4. start — курс не начат.
  const age = i.nowSec - i.createdAt
  for (const step of ['start-2', 'start-1'] as const) {
    if (!within(age, WINDOWS[step]) || i.sent.has(step)) continue
    const unit = step === 'start-1' ? i.course.startUnit : i.course.azbukaUnit
    return pick(step, step, { start_url: lessonUrl(unit, l) })
  }
  return null
}

/** Закрытые модули: событие progress_events или старая запись прогресса целым модулем. */
function doneModules(i: ChainInput): Set<string> {
  const done = new Set(i.moduleEvents.map(e => e.subject))
  for (const r of i.progress) if (r.completed_at && !r.lesson_slug.includes('/')) done.add(r.lesson_slug)
  return done
}

const countSpine = (c: ChainCourse, done: Set<string>) => c.spine.filter(m => done.has(m)).length

/** Куда вернуть: последний открытый и не завершённый урок; иначе первый незакрытый модуль спайна. */
function resumeTarget(i: ChainInput, done: Set<string>): { slug: string; module: string } | null {
  const open = i.progress
    .filter(r => !r.completed_at && !done.has(moduleOf(r.lesson_slug)))
    .sort((a, b) => b.viewed_at - a.viewed_at)[0]
  if (open) return { slug: open.lesson_slug, module: moduleOf(open.lesson_slug) }
  const next = i.course.spine.find(m => !done.has(m))
  return next ? { slug: next, module: next } : null
}
