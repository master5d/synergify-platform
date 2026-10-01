import type { Locale } from './types'
import { TASK_ROUTE_COPY, TASK_ROUTES, TASK_ROUTE_CLARIFY } from '@/lib/course/task-routes'
import { pagePath } from '@/lib/base-path'
import {
  fillOutcome, routesForRole, unitModule,
  type TaskRoute, type TaskRouteMatch,
} from './task-route'

// Копия шага «Русло задачи» — course-data pack'а (course/task-routes.ts); здесь — локализация, ссылки
// и клиент воркера. Мирует week-map-content.ts.

type Copy = typeof TASK_ROUTE_COPY
export type TaskRouteContent = { [K in keyof Copy]: string }

export function buildTaskRouteContent(locale: Locale): TaskRouteContent {
  return Object.fromEntries(
    Object.entries(TASK_ROUTE_COPY).map(([k, v]) => [k, v[locale]]),
  ) as TaskRouteContent
}

export function questStepLabel(n: number, locale: Locale): string {
  return TASK_ROUTE_COPY.questStepLabel[locale].replace('{n}', String(n))
}

/** Плашка на странице юнита: «Шаг N твоей задачи». */
export function unitStepLabel(n: number, locale: Locale): string {
  return TASK_ROUTE_COPY.unitStepLabel[locale].replace('{n}', String(n))
}

/** Где живёт «Личный план обучения» с руслом целиком — лист персонажа. */
export function taskPlanHref(locale: Locale): string {
  return pagePath(`${locale === 'en' ? '/en' : ''}/character/#learning-plan`)
}

/** Ссылка на юнит русла: '06-audio-pipeline/u3-build' → /lessons/06-audio-pipeline/u3-build/ (+ локаль, префикс курса). */
export function routeUnitHref(unit: string, locale: Locale): string {
  return pagePath(`${locale === 'en' ? '/en' : ''}/lessons/${unit}/`)
}

export function routeModuleHref(unit: string, locale: Locale): string {
  return pagePath(`${locale === 'en' ? '/en' : ''}/lessons/${unitModule(unit)}/`)
}

export function routeResultText(route: TaskRoute, outcome: string | null | undefined, locale: Locale): string {
  return fillOutcome(route.result[locale], outcome, locale)
}

/** Потолок ожидания ответа воркера: больше его 20 с до сервиса, чтобы отказ пришёл с причиной. */
export const TASK_ROUTE_CLIENT_TIMEOUT_MS = 25_000

/**
 * Спрашивает воркер (POST /api/intake/task-route). Любой сбой — сеть, таймаут, не-2xx, кривой ответ —
 * это `unavailable`: шаг переходит к ручному выбору из списка, анкета не блокируется. Ключи ответа ещё
 * раз сверяются с каталогом роли — вне каталога не выходит ничего даже при сломанном воркере.
 */
export async function requestTaskRoute(
  text: string, role: unknown, fetchImpl: typeof fetch = fetch,
): Promise<TaskRouteMatch> {
  const catalog = new Set(routesForRole(role, TASK_ROUTES).map(r => r.key))
  try {
    const res = await fetchImpl('/api/intake/task-route', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, role }),
      signal: AbortSignal.timeout(TASK_ROUTE_CLIENT_TIMEOUT_MS),
    })
    if (!res.ok) return { status: 'unavailable' }
    const d = await res.json() as Partial<{ status: string; route: unknown; candidates: unknown }>
    if (d?.status === 'matched' && typeof d.route === 'string' && catalog.has(d.route)) {
      return { status: 'matched', route: d.route }
    }
    if (d?.status === 'unsure') {
      const candidates = Array.isArray(d.candidates)
        ? d.candidates.filter((c): c is string => typeof c === 'string' && catalog.has(c))
        : []
      return { status: 'unsure', candidates }
    }
    return { status: 'unavailable' }
  } catch {
    return { status: 'unavailable' }
  }
}

export { TASK_ROUTES, TASK_ROUTE_CLARIFY }
