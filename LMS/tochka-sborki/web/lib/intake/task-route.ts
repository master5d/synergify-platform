// web/lib/intake/task-route.ts
//
// «Русло задачи» — развилка онбординга «криэйтор / предприниматель» + сквозная задача через курс
// (BACKLOG.md, решение владельца 2026-09-14; спека docs/superpowers/specs/2026-09-28-onboarding-fork-task-routes.md).
//
// Единственное недетерминированное звено — сопоставление свободного текста задачи (V_OUTCOME) с ЗАКРЫТЫМ
// каталогом русел (модель через воркер → llm-service). Всё остальное здесь детерминировано: русло — статические
// данные pack'а (course/task-routes.ts), уточнение при низкой уверенности — голосование по готовым вариантам,
// деградация — ручной выбор из списка. Тот же ключ русла → то же русло.
//
// Воркер импортирует этот файл (каталог для классификатора) — только ОТНОСИТЕЛЬНЫЕ импорты (Gotcha 2, lib/course/README.md).
import type { AnswerValue, Answers, Locale } from './types'
import { TASK_ROUTES, TASK_ROUTE_CLARIFY } from '../course/task-routes'

type L = Record<Locale, string>

export const TASK_ROLES = ['creator', 'entrepreneur'] as const
export type TaskRole = (typeof TASK_ROLES)[number]

export const ROLE_ANSWER_KEY = 'V_ROLE'
export const TASK_MODE_ANSWER_KEY = 'V_TASK_MODE'
export const TASK_ROUTE_ANSWER_KEY = 'V_TASK_ROUTE'
/** Текст задачи — прежний V_OUTCOME (его уже читают проза листа, устав и подземелье). */
export const TASK_TEXT_ANSWER_KEY = 'V_OUTCOME'

export const TASK_TEXT_MIN_CHARS = 3
export const TASK_TEXT_MAX_CHARS = 600
export const MAX_CANDIDATES = 3

export interface RouteStep {
  /** '<слаг модуля>/<слаг юнита>' — гвард проверяет, что юнит есть в контенте pack'а. */
  unit: string
  title: L
  /** Что сделать для СВОЕЙ задачи в этом юните. */
  action: L
}

export interface TaskRoute {
  key: string
  roles: TaskRole[]
  title: L
  summary: L
  /** EN, для классификатора: какие задачи сюда, какие — нет. В интерфейсе не показывается. */
  classifierHint: string
  /** Шаг 0 любого русла — «Стоит ли автоматизировать?» (LMS#10): вердикт анкеты + юнит, где это разобрано. */
  check: { unit: string }
  steps: RouteStep[]
  /** «Ложная дорога» — куда тянет, и почему не туда. */
  falseRoad: { title: L; why: L }
  /** Рабочий результат в конце. {outcome} — текст задачи ученика. */
  result: L
}

export interface ClarifyOption {
  value: string
  label: L
  /** Ключи каталога, за которые голосует ответ. */
  routes: string[]
}

export interface ClarifyQuestion {
  id: string
  prompt: L
  /** Вес голоса: «что на выходе» решает больше, чем «что запускает». */
  weight: number
  options: ClarifyOption[]
}

export type RouteSource = 'llm' | 'clarify' | 'manual'
const SOURCES = new Set<string>(['llm', 'clarify', 'manual'])

export interface TaskRouteAnswer {
  key: string
  source: RouteSource
  /** Снимок текста, по которому русло выбрано: тот же текст → классификатор не переспрашиваем. */
  text: string
}

/** Ответ воркера POST /api/intake/task-route. */
export type TaskRouteMatch =
  | { status: 'matched'; route: string }
  | { status: 'unsure'; candidates: string[] }
  | { status: 'unavailable' }

export function isTaskRole(v: unknown): v is TaskRole {
  return typeof v === 'string' && (TASK_ROLES as readonly string[]).includes(v)
}

/** Каталог роли; роль не выбрана/неизвестна — весь каталог. Порядок — как в pack'е. */
export function routesForRole(role: unknown, catalog: TaskRoute[] = TASK_ROUTES): TaskRoute[] {
  if (!isTaskRole(role)) return catalog
  return catalog.filter(r => r.roles.includes(role))
}

export function findRoute(key: unknown, catalog: TaskRoute[] = TASK_ROUTES): TaskRoute | null {
  if (typeof key !== 'string') return null
  return catalog.find(r => r.key === key) ?? null
}

/** Модуль юнита: '06-audio-pipeline/u3-build' → '06-audio-pipeline'. */
export function unitModule(unit: string): string {
  return unit.split('/')[0]
}

/** Чистит текст задачи для классификатора; null — слишком коротко/не строка. */
export function normalizeTaskText(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const text = raw.replace(/\s+/g, ' ').trim().slice(0, TASK_TEXT_MAX_CHARS).trim()
  const letters = text.match(/\p{L}/gu)
  if (!letters || letters.length < TASK_TEXT_MIN_CHARS) return null
  return text
}

/**
 * Приводит сырой ответ классификатора (уже прошедший llm-service) к ответу воркера, ещё раз сверяя
 * ключи с каталогом: ключ вне каталога не проходит ни как русло, ни как кандидат (второй заслон
 * после сервиса). Высокая уверенность + русло из каталога → matched; иначе → unsure.
 */
export function toRouteMatch(
  raw: { route?: unknown; confidence?: unknown; candidates?: unknown } | null | undefined,
  catalog: TaskRoute[],
): TaskRouteMatch {
  const keys = new Set(catalog.map(r => r.key))
  const route = typeof raw?.route === 'string' && keys.has(raw.route) ? raw.route : null
  const candidates = Array.isArray(raw?.candidates)
    ? [...new Set(raw.candidates.filter((c): c is string => typeof c === 'string' && keys.has(c)))].slice(0, MAX_CANDIDATES)
    : []
  if (route && raw?.confidence === 'high') return { status: 'matched', route }
  const withRoute = route && !candidates.includes(route) ? [route, ...candidates].slice(0, MAX_CANDIDATES) : candidates
  return { status: 'unsure', candidates: withRoute }
}

export interface ClarifyResult {
  /** Единственный лидер — русло; null — ничья или голосов нет (тогда ручной список). */
  route: string | null
  /** Лидеры (для подсветки в ручном списке), в порядке каталога. */
  leaders: string[]
}

/**
 * Детерминированное уточнение: голос опции = вес вопроса, кандидат модели = +1. Считаются только
 * ключи каталога роли — вне каталога ничего не выходит. Единственный максимум → русло.
 */
export function resolveClarify(
  picks: Record<string, string>,
  candidates: string[],
  catalog: TaskRoute[],
  questions: ClarifyQuestion[] = TASK_ROUTE_CLARIFY,
): ClarifyResult {
  const score = new Map<string, number>(catalog.map(r => [r.key, 0]))
  for (const q of questions) {
    const opt = q.options.find(o => o.value === picks[q.id])
    if (!opt) continue
    for (const k of opt.routes) if (score.has(k)) score.set(k, score.get(k)! + q.weight)
  }
  for (const k of candidates) if (score.has(k)) score.set(k, score.get(k)! + 1)
  const max = Math.max(0, ...score.values())
  if (max === 0) return { route: null, leaders: [] }
  const leaders = catalog.map(r => r.key).filter(k => score.get(k) === max)
  return { route: leaders.length === 1 ? leaders[0] : null, leaders }
}

export function encodeTaskRouteAnswer(a: TaskRouteAnswer): string[] {
  return [a.key, a.source, a.text]
}

export function decodeTaskRouteAnswer(value: AnswerValue | undefined, catalog: TaskRoute[] = TASK_ROUTES): TaskRouteAnswer | null {
  if (!Array.isArray(value) || value.length < 2) return null
  const [key, source, text] = value
  if (!findRoute(key, catalog)) return null
  return {
    key: key as string,
    source: typeof source === 'string' && SOURCES.has(source) ? (source as RouteSource) : 'manual',
    text: typeof text === 'string' ? text : '',
  }
}

/** Русло ученика: только в режиме «есть задача» и только ключ из каталога; иначе null (курс по порядку). */
export function taskRouteFromAnswers(answers: Answers | null | undefined, catalog: TaskRoute[] = TASK_ROUTES): TaskRoute | null {
  if (!answers || answers[TASK_MODE_ANSWER_KEY] !== 'task') return null
  const a = decodeTaskRouteAnswer(answers[TASK_ROUTE_ANSWER_KEY], catalog)
  return a ? findRoute(a.key, catalog) : null
}

/** То же из профиля /api/intake/me (`answers` — JSON-строка или объект). */
export function profileTaskRoute(profile: { answers?: unknown } | null | undefined, catalog: TaskRoute[] = TASK_ROUTES): TaskRoute | null {
  try {
    const raw = profile?.answers
    const answers = typeof raw === 'string' ? JSON.parse(raw) : raw
    return answers && typeof answers === 'object' ? taskRouteFromAnswers(answers as Answers, catalog) : null
  } catch {
    return null
  }
}

/**
 * Текст задачи для подстановки {outcome} в русло: V_OUTCOME (parseOutcome читает только v1-ключ F3).
 * null — текста нет (fillOutcome подставит «твоя задача»).
 */
export function profileTaskText(profile: { answers?: unknown } | null | undefined): string | null {
  try {
    const raw = profile?.answers
    const a = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Record<string, unknown> | null | undefined
    const t = normalizeTaskText(a?.[TASK_TEXT_ANSWER_KEY])
    return t
  } catch {
    return null
  }
}

/** Модуль → шаги русла в нём (с номером шага, 1-based). Для квест-лога: «в каждом модуле его шаг». */
export function routeStepsByModule(route: TaskRoute): Record<string, { index: number; step: RouteStep }[]> {
  const out: Record<string, { index: number; step: RouteStep }[]> = {}
  route.steps.forEach((step, i) => {
    const m = unitModule(step.unit)
    ;(out[m] ??= []).push({ index: i + 1, step })
  })
  return out
}

/** Модуль «босса» русла — там, где стоит последний шаг (рабочий результат). */
export function routeFinalModule(route: TaskRoute): string {
  return unitModule(route.steps[route.steps.length - 1].unit)
}

export function fillOutcome(template: string, outcome: string | null | undefined, locale: Locale): string {
  const fallback = locale === 'en' ? 'your task' : 'твоя задача'
  const o = outcome && outcome.trim() ? outcome.trim() : fallback
  return template.replaceAll('{outcome}', o)
}
