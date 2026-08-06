import type { Env } from '../lib/types'
import { addCrmContact } from '../lib/crm'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LeadCaptureBody {
  name?: string
  email?: string
  phone?: string
  city?: string
  event?: string
  message?: string
  consent?: boolean
  company?: string // honeypot — real users never fill this
  locale?: string
}

export async function handleLeadCapture(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: LeadCaptureBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot: a bot filled the hidden field. Look successful, write nothing.
  if (body.company && body.company.trim() !== '') {
    return Response.json({ ok: true })
  }

  const email = body.email?.trim().toLowerCase() ?? ''
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (body.consent !== true) {
    return Response.json({ error: 'Consent required' }, { status: 400 })
  }

  const now = Math.floor(Date.now() / 1000)
  const event = body.event?.trim() || null
  const source = 'capture:' + (event ?? 'general')
  const language = body.locale === 'en' ? 'en' : 'ru'

  await env.DB.prepare(
    `INSERT INTO event_leads
       (id, name, email, phone, city, event, message, consent_at, source, language, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    crypto.randomUUID(),
    body.name?.trim() || null,
    email,
    body.phone?.trim() || null,
    body.city?.trim() || null,
    event,
    body.message?.trim() || null,
    now,
    source,
    language,
    now,
  ).run()

  // Upsert into users (CRM source of truth) — new row only; never overwrite an account holder.
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email).first<{ id: string }>()
  if (!existing) {
    await env.DB.prepare(
      'INSERT INTO users (id, email, created_at, language, source, telegram_handle) VALUES (?, ?, ?, ?, ?, ?)',
    ).bind(crypto.randomUUID(), email, now, language, source, null).run()
  }

  // listmonk mirror is best-effort (it swallows its own errors and no-ops without config).
  ctx.waitUntil(addCrmContact(env, { email, language, source }))

  return Response.json({ ok: true })
}
