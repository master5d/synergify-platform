import type { Env } from '../lib/types'
import { parseCookies } from '../middleware'
import { verifyJWT } from '../lib/jwt'
import { sendEmailSES } from '../lib/ses'
import { notifyOwnerCare } from '../lib/owner-notify'
import { validateCare, buildOwnerCareEmail, buildCareAutoreply, publicCareConfig } from '../lib/care'

// Служба заботы: POST /api/care — обращение с любого из трёх сайтов (Точка Сборки, академия,
// mamaev.coach; все ходят в /api/* своего домена, CORS — общий список воркера).
// Журнал — D1 care_requests (миграция 0020). Пока миграция не применена, приёмник НЕ падает:
// владелец всё равно получает письмо, человек — автоответ, а пропуск записи громко идёт в лог.

/** Антиспам: не больше N обращений с одного email / одного IP за окно (считается по журналу). */
export const CARE_RATE = { windowSec: 3600, perEmail: 3, perIp: 10 }

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

async function optionalUserId(request: Request, env: Env): Promise<string | null> {
  const token = parseCookies(request.headers.get('Cookie') ?? '')['session']
  if (!token || !env.WORKER_JWT_SECRET) return null
  const payload = await verifyJWT(token, env.WORKER_JWT_SECRET).catch(() => null)
  return payload?.sub ?? null
}

const isMissingTable = (e: unknown) => /no such table/i.test(e instanceof Error ? e.message : String(e))

/** GET /api/care — публичный конфиг (темы, срок ответа) для страниц без доступа к LMS/care.json. */
export function handleCareConfig(): Response {
  return Response.json(publicCareConfig(), { headers: { 'Cache-Control': 'public, max-age=300' } })
}

export async function handleCare(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: Record<string, unknown>
  try {
    body = await request.json()
    if (!body || typeof body !== 'object') throw new Error('not an object')
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot (как у /api/leads/capture): бот заполнил скрытое поле — отвечаем успехом, ничего не делаем.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return Response.json({ ok: true })
  }

  const v = validateCare(body, request.headers.get('Origin'))
  if (!v.ok) return Response.json({ error: v.error }, { status: 400 })
  const r = v.value

  const now = Math.floor(Date.now() / 1000)
  const ipHash = await sha256Hex(request.headers.get('CF-Connecting-IP') ?? 'unknown')
  const userId = await optionalUserId(request, env)
  const id = crypto.randomUUID()

  // Лимит частоты — по журналу. Нет таблицы → лимит не считается (громко), остаётся honeypot.
  let tableMissing = false
  try {
    const since = now - CARE_RATE.windowSec
    const row = await env.DB.prepare(
      `SELECT SUM(CASE WHEN email = ? THEN 1 ELSE 0 END) AS by_email,
              SUM(CASE WHEN ip_hash = ? THEN 1 ELSE 0 END) AS by_ip
         FROM care_requests WHERE created_at > ?`,
    ).bind(r.email, ipHash, since).first<{ by_email: number | null; by_ip: number | null }>()
    if ((row?.by_email ?? 0) >= CARE_RATE.perEmail || (row?.by_ip ?? 0) >= CARE_RATE.perIp) {
      return Response.json({ error: 'Too many requests' }, { status: 429 })
    }
  } catch (e) {
    tableMissing = isMissingTable(e)
    console.error(`care: RATE LIMIT SKIPPED — ${tableMissing ? 'table care_requests missing (apply migration 0020)' : 'D1 error'}`, e)
  }

  let stored = false
  if (!tableMissing) {
    try {
      await env.DB.prepare(
        `INSERT INTO care_requests (id, site, topic, message, email, page_url, locale, user_id, ip_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(id, r.site, r.topic, r.message, r.email, r.pageUrl, r.locale, userId, ipHash, now).run()
      stored = true
    } catch (e) {
      console.error(`care: JOURNAL WRITE SKIPPED for ${id} — ${isMissingTable(e) ? 'table care_requests missing (apply migration 0020)' : 'D1 error'}`, e)
    }
  } else {
    console.error(`care: JOURNAL WRITE SKIPPED for ${id} — table care_requests missing (apply migration 0020)`)
  }

  const notified = await notifyOwnerCare(env, buildOwnerCareEmail(r, { id, stored, userId }))

  // Обращение не легло ни в журнал, ни владельцу в почту — сказать «получили» было бы неправдой.
  if (!stored && !notified) {
    console.error(`care: request ${id} LOST — neither journal nor owner email`)
    return Response.json({ error: 'Not delivered' }, { status: 502 })
  }

  // Автоответ — best-effort, не задерживает ответ формы.
  const reply = buildCareAutoreply(r)
  ctx.waitUntil(
    sendEmailSES(env, { from: reply.from, to: r.email, subject: reply.subject, text: reply.text })
      .then(res => { if (!res.ok) console.error('care: autoreply non-OK', res.status, res.error) })
      .catch(e => console.error('care: autoreply threw', e)),
  )

  return Response.json({ ok: true, id })
}
