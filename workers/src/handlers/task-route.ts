// POST /api/intake/task-route — русло задачи онбординга (спека
// docs/superpowers/specs/2026-09-28-onboarding-fork-task-routes.md).
// Воркер берёт ЗАКРЫТЫЙ каталог русел роли из pack'а, сервис lms-llm только сопоставляет с ним текст.
// Ответ всегда 200 с исходом — клиент решает, что показать:
//   matched {route} · unsure {candidates} (уточняющие вопросы) · unavailable (ручной выбор из списка).
// Ключи ответа сервиса сверяются с каталогом ещё раз (toRouteMatch) — второй заслон после сервиса.
import {
  normalizeTaskText, routesForRole, toRouteMatch, type TaskRouteMatch,
} from '../../../LMS/tochka-sborki/web/lib/intake/task-route'
import { callLlm, type LlmEnv } from '../lib/llm-client'
import { hitRateLimit, type RateLimitCache, type RateLimitRule } from '../lib/rate-limit'

/** Классификация одной строки — как /skin (~2 с по замеру), свой короткий потолок: деградация наступает быстро. */
export const TASK_ROUTE_TIMEOUT_MS = 20_000

/** Потолок на пользователя (волна 19): за вызовом — LLM. Честный ученик зовёт 1–3 раза за анкету
 *  (правка текста, смена роли); 12 в час — запас на переписывания, но не на скрипт. */
export const TASK_ROUTE_RATE: RateLimitRule = { limit: 12, windowSec: 3600 }

export interface TaskRouteLimit {
  cache: RateLimitCache
  userId: string
  now?: number
}

export async function handleTaskRoute(
  body: { text?: unknown; role?: unknown },
  llm: LlmEnv,
  fetchImpl: typeof fetch = fetch,
  limit?: TaskRouteLimit,
): Promise<Response> {
  const text = normalizeTaskText(body?.text)
  if (!text) return Response.json({ error: 'bad_text' }, { status: 400 })

  const catalog = routesForRole(body?.role)
  // Каталог пуст (курс без русел) — классифицировать не с чем; честно отвечаем «недоступно».
  if (catalog.length === 0) return Response.json({ status: 'unavailable' } satisfies TaskRouteMatch)

  // Лимит считаем только по вызовам, которые дошли бы до модели (400 и пустой каталог — бесплатны).
  // 429 клиент (requestTaskRoute) читает как unavailable → ручной выбор русла; анкета не блокируется.
  if (limit) {
    const rl = await hitRateLimit(limit.cache, 'task-route', limit.userId, TASK_ROUTE_RATE, limit.now)
    if (!rl.allowed) {
      return Response.json(
        { error: 'rate_limited', retryAfterSec: rl.retryAfterSec, message: 'Too many task-route requests; pick the route manually.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
      )
    }
  }

  try {
    const raw = await callLlm<{ route?: unknown; confidence?: unknown; candidates?: unknown }>(
      '/task-route/classify',
      { text, catalog: catalog.map(r => ({ key: r.key, hint: r.classifierHint })) },
      llm, fetchImpl, TASK_ROUTE_TIMEOUT_MS,
    )
    return Response.json(toRouteMatch(raw, catalog))
  } catch (e) {
    // Без этой строки отказ сервиса не оставил бы в воркере ни следа (урок /skin, И-2).
    console.error('lms-llm /task-route/classify failed, falling back to manual route pick:', e)
    return Response.json({ status: 'unavailable' } satisfies TaskRouteMatch)
  }
}
