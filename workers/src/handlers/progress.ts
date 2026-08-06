import type { Env } from '../lib/types'
import { requireAuth } from '../middleware'

export async function handleView(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let body: { lesson_slug?: string; course?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.lesson_slug) return Response.json({ error: 'lesson_slug required' }, { status: 400 })

  const now = Math.floor(Date.now() / 1000)
  const course = body.course ?? 'tochka-sborki'
  await env.DB.prepare(
    'INSERT OR IGNORE INTO progress (user_id, lesson_slug, viewed_at, course) VALUES (?, ?, ?, ?)'
  ).bind(auth.sub, body.lesson_slug, now, course).run()

  return Response.json({ ok: true })
}

export async function handleComplete(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let body: { lesson_slug?: string; course?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.lesson_slug) return Response.json({ error: 'lesson_slug required' }, { status: 400 })

  const now = Math.floor(Date.now() / 1000)
  const course = body.course ?? 'tochka-sborki'
  await env.DB.prepare(`
    INSERT INTO progress (user_id, lesson_slug, viewed_at, completed_at, course) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (user_id, lesson_slug) DO UPDATE SET completed_at = excluded.completed_at
  `).bind(auth.sub, body.lesson_slug, now, now, course).run()

  return Response.json({ ok: true })
}

export async function handleList(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  const { results } = await env.DB.prepare(
    'SELECT lesson_slug, viewed_at, completed_at, course FROM progress WHERE user_id = ?'
  ).bind(auth.sub).all<{ lesson_slug: string; viewed_at: number; completed_at: number | null; course: string }>()

  return Response.json(results)
}
