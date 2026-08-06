import type { Env } from '../lib/types'
import { requireAuth } from '../middleware'
import { COURSE_CATALOG } from '../lib/course-catalog'

const COURSE = 'tochka-sborki'

/** POST /api/academy/admission — server-verified grant: completed progress must
 *  cover every COURSE_CATALOG module slug. Idempotent (INSERT OR IGNORE). */
export async function handleAdmission(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  // Выданный admission постоянен: не пере-проверяем прогресс, иначе рост
  // COURSE_CATALOG ретроактивно закрывал бы дверь старым выпускникам.
  const existing = await env.DB.prepare(
    'SELECT granted_at FROM admissions WHERE user_id = ? AND course = ?'
  ).bind(auth.sub, COURSE).first<{ granted_at: number }>()
  if (existing) {
    return Response.json({ granted: true, course: COURSE, granted_at: existing.granted_at })
  }

  const { results } = await env.DB.prepare(
    'SELECT lesson_slug FROM progress WHERE user_id = ? AND course = ? AND completed_at IS NOT NULL'
  ).bind(auth.sub, COURSE).all<{ lesson_slug: string }>()

  const completed = new Set(results.map(r => r.lesson_slug))
  const missing = COURSE_CATALOG.map(m => m.slug).filter(slug => !completed.has(slug))
  if (missing.length > 0) {
    return Response.json({ error: 'course incomplete', missing }, { status: 403 })
  }

  const now = Math.floor(Date.now() / 1000)
  await env.DB.prepare(
    'INSERT OR IGNORE INTO admissions (user_id, course, granted_at) VALUES (?, ?, ?)'
  ).bind(auth.sub, COURSE, now).run()

  const row = await env.DB.prepare(
    'SELECT granted_at FROM admissions WHERE user_id = ? AND course = ?'
  ).bind(auth.sub, COURSE).first<{ granted_at: number }>()

  return Response.json({ granted: true, course: COURSE, granted_at: row?.granted_at ?? now })
}

/** GET /api/academy/me — unified academy profile: admissions + per-course progress summary. */
export async function handleAcademyMe(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  const admissions = await env.DB.prepare(
    'SELECT course, granted_at FROM admissions WHERE user_id = ?'
  ).bind(auth.sub).all<{ course: string; granted_at: number }>()

  const courses = await env.DB.prepare(
    `SELECT course, COUNT(*) AS viewed,
            SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) AS completed
     FROM progress WHERE user_id = ? GROUP BY course`
  ).bind(auth.sub).all<{ course: string; viewed: number; completed: number }>()

  return Response.json({ email: auth.email, admissions: admissions.results, courses: courses.results })
}
