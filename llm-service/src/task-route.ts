// Русло задачи онбординга (спека docs/superpowers/specs/2026-09-28-onboarding-fork-task-routes.md).
// Модель ТОЛЬКО сопоставляет свободный текст задачи ученика с закрытым каталогом русел, присланным
// воркером (как /demand/classify с catalog). Никакой генерации шагов: русло — статические данные курса.
// Ключ вне каталога = bad_shape: выдуманное русло не должно доехать до ученика.
import { chatJson, type GatewayEnv } from './gateway.js'
import { LlmError, BadRequestError } from './errors.js'

export interface TaskRouteEnv extends GatewayEnv { POOL_TASK_ROUTE: string }

export interface TaskRouteCatalogEntry { key: string; hint: string }

export interface TaskRouteClassification {
  route: string | null
  confidence: 'high' | 'low'
  candidates: string[]
}

export const TASK_ROUTE_MAX_TEXT = 600
export const TASK_ROUTE_MAX_CANDIDATES = 3
const MAX_CATALOG = 20

export function buildTaskRoutePrompt(text: string, catalog: TaskRouteCatalogEntry[]): string {
  const catalogText = catalog.map(c => `- ${c.key}: ${c.hint}`).join('\n')
  return [
    `You match a learner's task to ONE technical route of an agentic-AI course. You do not invent routes.`,
    `Routes (key: what belongs there):\n${catalogText}`,
    `Learner task (any language): """${text}"""`,
    `Pick the route by HOW the task is actually built, not by the words the learner uses:`,
    `a fixed recurring sequence of steps is a pipeline even if the learner says "agents" or "a system".`,
    `Return STRICT JSON {"route","confidence","candidates"}:`,
    `route — exactly one key from the list above, or null if none fits;`,
    `confidence — "high" only if one route clearly fits, otherwise "low";`,
    `candidates — up to ${TASK_ROUTE_MAX_CANDIDATES} keys from the list that could fit, best first (may be empty).`,
    `Use ONLY keys from the list. No other fields.`,
  ].join('\n')
}

/** Проверка тела запроса: ошибка вызывающего (400), а не сбой апстрима. */
export function parseTaskRouteBody(body: any): { text: string; catalog: TaskRouteCatalogEntry[] } {
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, TASK_ROUTE_MAX_TEXT) : ''
  if (!text) throw new BadRequestError('text must be a non-empty string')
  const catalog = body?.catalog
  if (!Array.isArray(catalog) || catalog.length === 0 || catalog.length > MAX_CATALOG) {
    throw new BadRequestError(`catalog must be a non-empty array of at most ${MAX_CATALOG} entries`)
  }
  for (const [i, c] of catalog.entries()) {
    if (typeof c?.key !== 'string' || !c.key.trim() || typeof c?.hint !== 'string') {
      throw new BadRequestError(`catalog[${i}] must be {key: string, hint: string}`)
    }
  }
  return { text, catalog: catalog.map((c: any) => ({ key: c.key, hint: c.hint })) }
}

export async function classifyTaskRoute(
  text: string, catalog: TaskRouteCatalogEntry[], env: TaskRouteEnv, fetchImpl?: typeof fetch,
): Promise<TaskRouteClassification> {
  const raw = await chatJson({
    pool: env.POOL_TASK_ROUTE, prompt: buildTaskRoutePrompt(text, catalog), env, fetchImpl,
  }) as Record<string, unknown>
  const keys = new Set(catalog.map(c => c.key))

  const route = raw?.route ?? null
  if (route !== null && (typeof route !== 'string' || !keys.has(route))) {
    throw new LlmError('bad_shape', `route "${String(route)}" is not in the catalog`)
  }
  const confidence = raw?.confidence
  if (confidence !== 'high' && confidence !== 'low') {
    throw new LlmError('bad_shape', `confidence "${String(confidence)}" is not in [high|low]`)
  }
  const candidatesRaw = raw?.candidates ?? []
  if (!Array.isArray(candidatesRaw)) throw new LlmError('bad_shape', 'candidates must be an array')
  for (const c of candidatesRaw) {
    if (typeof c !== 'string' || !keys.has(c)) {
      throw new LlmError('bad_shape', `candidate "${String(c)}" is not in the catalog`)
    }
  }
  const candidates = [...new Set(candidatesRaw as string[])].slice(0, TASK_ROUTE_MAX_CANDIDATES)
  // «Уверенно» без русла — противоречие; понижаем, а не выдумываем русло.
  return { route: route as string | null, confidence: route === null ? 'low' : confidence, candidates }
}
