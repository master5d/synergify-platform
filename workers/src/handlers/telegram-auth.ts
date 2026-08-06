import type { Env } from '../lib/types'
import { signJWT } from '../lib/jwt'
import { verifyTelegramInitData } from '../lib/telegram-initdata'

const SESSION_MAX_AGE = 2592000 // 30 days, matches handleVerify

export async function handleTelegramAuth(request: Request, env: Env): Promise<Response> {
  let body: { initData?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!env.TELEGRAM_BOT_TOKEN) {
    return Response.json({ error: 'telegram_not_configured' }, { status: 503 })
  }

  const initData = body.initData?.trim() ?? ''
  const result = await verifyTelegramInitData(initData, env.TELEGRAM_BOT_TOKEN, { maxAgeSec: 300 })
  if (!result.ok) return Response.json({ error: 'invalid_initData' }, { status: 401 })

  const tgId = result.user.id
  const username = result.user.username
  const now = Math.floor(Date.now() / 1000)

  // 1) match by telegram_id
  let user = await env.DB.prepare('SELECT id, email FROM users WHERE telegram_id = ?')
    .bind(tgId).first<{ id: string; email: string }>()

  // 2) else match by handle (only unlinked rows), then backfill telegram_id
  if (!user && username) {
    const byHandle = await env.DB.prepare(
      'SELECT id, email FROM users WHERE telegram_handle = ? COLLATE NOCASE AND telegram_id IS NULL'
    ).bind(username).first<{ id: string; email: string }>()
    if (byHandle) {
      await env.DB.prepare('UPDATE users SET telegram_id = ? WHERE id = ?').bind(tgId, byHandle.id).run()
      user = byHandle
    }
  }

  // 3) else create a Telegram-native user (synthetic, never-emailed identity)
  if (!user) {
    const id = crypto.randomUUID()
    const email = `tg_${tgId}@telegram.local`
    const language = result.user.language_code ?? 'unknown'
    await env.DB.prepare(
      'INSERT INTO users (id, email, created_at, language, source, telegram_handle, telegram_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, email, now, language, 'telegram', username, tgId).run()
    user = { id, email }
  }

  const jwt = await signJWT(
    { sub: user.id, email: user.email, iat: now, exp: now + SESSION_MAX_AGE },
    env.WORKER_JWT_SECRET
  )
  const cookie = `session=${jwt}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}; Path=/`
  return new Response(JSON.stringify({ ok: true, email: user.email, telegram: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
  })
}
