// Сертификат с уликами (intake LMS#17): публичная проверка без email и без миграции.
//   GET /api/certificate/code            — владельцу сертификата (сессия): { code, url }
//   GET /api/certificate/verify?c=<код>  — кому угодно: { valid: true, course, completedAt, modules }
// Завершённость — тот же критерий, что у допуска академии (lib/course-completion.ts): выданный
// допуск постоянен (его время = время завершения), иначе весь COURSE_CATALOG должен быть пройден.
// Ответ не несёт email и имени: имя на сертификате живёт только в браузере ученика.
import type { Env } from '../lib/types'
import { requireAuth } from '../middleware'
import { certificateVerifyUrl, parseCertificateCode, signCertificateCode, verifyCertificateCode } from '../lib/certificate-code'
import { COMPLETION_COURSE, completedCatalogModules, loadCompletedRows, missingCatalogModules } from '../lib/course-completion'

const NO_STORE = { 'Cache-Control': 'no-store' }

function invalid(status: 400 | 404): Response {
  return Response.json({ valid: false }, { status, headers: NO_STORE })
}

export async function handleCertificateCode(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth
  const code = await signCertificateCode(auth.sub, env.WORKER_JWT_SECRET)
  return Response.json({ code, url: certificateVerifyUrl(code) }, { headers: NO_STORE })
}

export async function handleCertificateVerify(request: Request, env: Env): Promise<Response> {
  const code = new URL(request.url).searchParams.get('c')
  if (!parseCertificateCode(code)) return invalid(400)
  const userId = await verifyCertificateCode(code, env.WORKER_JWT_SECRET)
  if (!userId) return invalid(404)

  const rows = await loadCompletedRows(env.DB, userId, COMPLETION_COURSE)
  const modules = completedCatalogModules(rows)

  const admission = await env.DB.prepare(
    'SELECT granted_at FROM admissions WHERE user_id = ? AND course = ?'
  ).bind(userId, COMPLETION_COURSE).first<{ granted_at: number }>()

  let completedAt: number
  if (admission) {
    completedAt = admission.granted_at
  } else if (missingCatalogModules(rows).length === 0) {
    completedAt = Math.max(...modules.map(m => m.completedAt))
  } else {
    return invalid(404)
  }

  return Response.json({
    valid: true,
    course: COMPLETION_COURSE,
    completedAt: new Date(completedAt * 1000).toISOString(),
    modules: modules.map(m => m.slug),
  }, { headers: NO_STORE })
}
