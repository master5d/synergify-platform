import type { Env } from '../lib/types'
import { addCrmContact } from '../lib/crm'

export async function listLeads(
  db: D1Database,
  opts: { q?: string; limit?: number; offset?: number },
): Promise<Response> {
  const limit = opts.limit && opts.limit > 0 ? Math.min(opts.limit, 2000) : 500
  const offset = opts.offset && opts.offset > 0 ? opts.offset : 0
  const cols = 'id, email, created_at, language, source, telegram_handle'
  const stmt = opts.q
    ? db.prepare(`SELECT ${cols} FROM users WHERE email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`)
        .bind(`%${opts.q}%`, limit, offset)
    : db.prepare(`SELECT ${cols} FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`)
        .bind(limit, offset)
  const rows = (await stmt.all()).results ?? []
  return Response.json(rows)
}

export async function syncContacts(env: Env): Promise<Response> {
  const rows = (await env.DB.prepare('SELECT email, language, source FROM users').all()).results ?? []
  let ok = 0, failed = 0
  for (const r of rows as any[]) {
    try { await addCrmContact(env, { email: r.email, language: r.language, source: r.source }); ok++ }
    catch { failed++ }
  }
  return Response.json({ synced: ok, failed, total: rows.length })
}
