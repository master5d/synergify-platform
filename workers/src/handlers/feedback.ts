import type { Env } from '../lib/types'

interface FeedbackBody {
  lesson: string
  recommend?: string
  impact?: string
  apply?: string
  unclear?: string
  other?: string
  locale?: string
}

export async function handleFeedback(request: Request, env: Env): Promise<Response> {
  let body: FeedbackBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.lesson) {
    return Response.json({ error: 'Missing required field: lesson' }, { status: 400 })
  }

  await env.DB.prepare(
    `INSERT INTO course_feedback (id, lesson, recommend, impact, apply, unclear, other, locale, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    crypto.randomUUID(),
    body.lesson,
    body.recommend ?? null,
    body.impact ?? null,
    body.apply ?? null,
    body.unclear ?? null,
    body.other ?? null,
    body.locale ?? null,
    Math.floor(Date.now() / 1000),
  ).run()

  return Response.json({ ok: true })
}
