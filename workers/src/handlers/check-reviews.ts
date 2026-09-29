import type { Env } from '../lib/types'
import { requireAuth } from '../middleware'
import { parseAnswer, spacedReviewEnabled, storeAnswer } from '../lib/check-reviews'

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
