import type { Env } from '../lib/types'
import { requireAuth, requireOwner } from '../middleware'
import { loadModuleCheckSummary, parseAnswer, spacedReviewEnabled, storeAnswer } from '../lib/check-reviews'

/**
 * POST /api/checks/answer — ответ вошедшего ученика на самопроверку → коробки интервального повтора.
 * Тело: { course, module, unit, check_id, correct, source?: 'lesson' | 'review' | 'card' }.
 * При SPACED_REVIEW_ENABLED != "1" отвечает { enabled: false } и НЕ трогает ни сессию, ни D1
 * (рубильник; миграция 0022 применена к prod 2026-09-29, флаг включён).
 */
export async function handleCheckAnswer(request: Request, env: Env, nowSec = Math.floor(Date.now() / 1000)): Promise<Response> {
  if (!spacedReviewEnabled(env)) return Response.json({ enabled: false })

  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let body: unknown
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const answer = parseAnswer(body)
  if (!answer) return Response.json({ error: 'course, module, unit, check_id, correct required' }, { status: 400 })

  const next = await storeAnswer(env.DB, auth.sub, answer, nowSec)
  return Response.json({ enabled: true, box: next.box, due_at: next.due_at })
}

const SLUG = /^[a-z0-9][a-z0-9-]{0,80}$/

/**
 * GET /api/admin/checks/summary?course=<курс>&module=<модуль> — только владельцу. Перед живой встречей: какие
 * самопроверки модуля чаще всего решены неверно (агрегат, без имён), чтобы разбирать на встрече именно их.
 * При выключенном SPACED_REVIEW_ENABLED данных нет — { enabled: false }, к D1 не ходит.
 */
export async function handleCheckSummary(request: Request, env: Env): Promise<Response> {
  const auth = await requireOwner(request, env)
  if (auth instanceof Response) return auth
  if (!spacedReviewEnabled(env)) return Response.json({ enabled: false })
  const url = new URL(request.url)
  const course = url.searchParams.get('course') ?? ''
  const module = url.searchParams.get('module') ?? ''
  if (!SLUG.test(course) || !SLUG.test(module)) return Response.json({ error: 'course and module required' }, { status: 400 })
  return Response.json({ enabled: true, course, module, checks: await loadModuleCheckSummary(env.DB, course, module) })
}
