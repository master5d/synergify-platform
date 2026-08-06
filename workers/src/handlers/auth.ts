import type { Env } from '../lib/types'
import { signJWT, generateToken } from '../lib/jwt'
import { requireAuth } from '../middleware'
import { addCrmContact } from '../lib/crm'
import { sendWelcomeEmail } from '../lib/welcome-email'
import { sendEmailSES } from '../lib/ses'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function parseLanguage(header: string | null): string {
  if (!header) return 'unknown'
  const first = header.split(',')[0].split(';')[0].trim()
  const code = first.split('-')[0].toLowerCase()
  return code || 'unknown'
}

function sanitizeTelegram(handle: string | undefined | null): string | null {
  if (!handle) return null
  const cleaned = handle.replace(/^@/, '').trim().slice(0, 32)
  return cleaned || null
}

function buildSource(body: { utm_source?: string; utm_medium?: string; utm_campaign?: string }): string {
  const parts = [body.utm_source, body.utm_medium, body.utm_campaign].filter(Boolean)
  return parts.length > 0 ? parts.join('/') : 'direct'
}

// Письмо magic-link на языке юзера (users.language). RU — дефолт; EN только для language === 'en'.
function buildMagicLinkEmail(lang: string, verifyUrl: string): { subject: string; text: string; html: string } {
  if (lang === 'en') {
    return {
      subject: 'Your sign-in link',
      text: `Hi!\n\nYour sign-in link for the "Точка Сборки" course (valid for 15 minutes):\n${verifyUrl}\n\nIf you didn't request this, just ignore this email.`,
      html: `<p>Hi!</p>
<p>Your sign-in link for the "Точка Сборки" course (valid for 15 minutes):</p>
<p><a href="${verifyUrl}">Sign in to the course</a></p>
<p>If you didn't request this, just ignore this email.</p>`,
    }
  }
  return {
    subject: 'Ваша ссылка для входа',
    text: `Здравствуйте!\n\nВаша ссылка для входа в курс «Точка Сборки» (действует 15 минут):\n${verifyUrl}\n\nЕсли вы не запрашивали вход — просто проигнорируйте это письмо.`,
    html: `<p>Здравствуйте!</p>
<p>Ваша ссылка для входа в курс «Точка Сборки» (действует 15 минут):</p>
<p><a href="${verifyUrl}">Войти в курс</a></p>
<p>Если вы не запрашивали вход — просто проигнорируйте это письмо.</p>`,
  }
}

export async function handleSendLink(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: { email?: string; telegram_handle?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const email = body.email?.trim().toLowerCase() ?? ''
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  let user = await env.DB.prepare('SELECT id, language FROM users WHERE email = ?').bind(email).first<{ id: string; language: string }>()
  const isNewUser = !user

  // язык письма — по users.language; для нового юзера = свежедетектированный (он же и сохраняется)
  let lang = user?.language ?? 'unknown'

  // лид для CRM-контакта (listmonk) добавляем ПОСЛЕ отправки письма (best-effort, не должен гонять с критичным письмом)
  let newLead: { email: string; language: string; source: string } | null = null
  if (isNewUser) {
    const id = crypto.randomUUID()
    const language = parseLanguage(request.headers.get('Accept-Language'))
    lang = language
    const source = buildSource(body)
    const telegramHandle = sanitizeTelegram(body.telegram_handle)
    await env.DB.prepare(
      'INSERT INTO users (id, email, created_at, language, source, telegram_handle) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, email, Math.floor(Date.now() / 1000), language, source, telegramHandle).run()
    user = { id, language }
    newLead = { email, language, source }
  }

  const token = generateToken()
  const expiresAt = Math.floor(Date.now() / 1000) + 900
  await env.DB.prepare('INSERT INTO magic_links (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, user!.id, expiresAt).run()

  const verifyUrl = `https://ai.synergify.com/auth/verify?token=${token}`
  const mail = buildMagicLinkEmail(lang, verifyUrl)

  // Транзакционное письмо: plain-text + минимальный HTML, одна ссылка, без маркетинговых стилей —
  // чтобы Gmail клал его в Inbox/Primary, а не в Promotions.
  const sendRes = await sendEmailSES(env, {
    from: 'Точка Сборки <noreply@synergify.com>',
    to: email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    // уникальный ref → Gmail не группирует/не обрезает одноразовые письма
    headers: { 'X-Entity-Ref-ID': token },
  })
  if (!sendRes.ok) {
    console.error('magic-link SES send failed', sendRes.status, sendRes.error)
    return Response.json({ error: 'Failed to send email', status: sendRes.status, details: sendRes.error }, { status: 502 })
  }

  // observability: письмо принято SES
  console.log('magic-link email accepted', JSON.stringify({ email, new_user: isNewUser }))

  // CRM-контакт — best-effort, после критичного письма; waitUntil чтобы рантайм не оборвал после ответа
  if (newLead) {
    ctx.waitUntil(
      addCrmContact(env, newLead)
        .catch(e => console.error('listmonk contact add failed', e))
    )
    ctx.waitUntil(
      sendWelcomeEmail(env, { email, lang, verifyUrl })
        .catch(e => console.error('welcome email failed', e))
    )
  }

  return Response.json({ ok: true })
}

export async function handleVerify(request: Request, env: Env): Promise<Response> {
  let body: { token?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const token = body.token?.trim() ?? ''
  if (!token) return Response.json({ error: 'Token required' }, { status: 400 })

  const now = Math.floor(Date.now() / 1000)
  const link = await env.DB.prepare(
    'SELECT token, user_id, expires_at, used_at FROM magic_links WHERE token = ?'
  ).bind(token).first<{ token: string; user_id: string; expires_at: number; used_at: number | null }>()

  if (!link) return Response.json({ error: 'Invalid token' }, { status: 401 })
  if (link.used_at !== null) return Response.json({ error: 'Token already used' }, { status: 401 })
  if (link.expires_at < now) return Response.json({ error: 'Token expired' }, { status: 401 })

  await env.DB.prepare('UPDATE magic_links SET used_at = ? WHERE token = ?').bind(now, token).run()

  const userRow = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(link.user_id).first<{ email: string }>()
  if (!userRow) return Response.json({ error: 'Internal error' }, { status: 500 })
  const email = userRow.email

  const jwt = await signJWT(
    { sub: link.user_id, email, iat: now, exp: now + 2592000 },
    env.WORKER_JWT_SECRET
  )

  const cookie = `session=${jwt}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/`
  return new Response(JSON.stringify({ ok: true, email }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
  })
}

export async function handleMe(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth
  return Response.json({ id: auth.sub, email: auth.email })
}

export async function handleLogout(_request: Request, _env: Env): Promise<Response> {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    },
  })
}
