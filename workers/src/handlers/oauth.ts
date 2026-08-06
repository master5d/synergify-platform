import type { Env } from '../lib/types'
import { signJWT, generateToken } from '../lib/jwt'
import { parseCookies } from '../middleware'
import { pkceChallenge, buildAuthorizeUrl, exchangeCode, fetchUserinfo, safeRedirectPath } from '../lib/oauth-google'

const SESSION_MAX_AGE = 2592000 // 30 days, matches handleVerify / handleTelegramAuth
const TEMP_COOKIE = 'HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/'

function unconfigured(env: Env): boolean {
  return !env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET
}

export async function handleOAuthStart(request: Request, env: Env): Promise<Response> {
  if (unconfigured(env)) return Response.json({ error: 'oauth_not_configured' }, { status: 503 })

  const url = new URL(request.url)
  const state = generateToken()
  const verifier = generateToken()
  const challenge = await pkceChallenge(verifier)
  const redirect = safeRedirectPath(url.searchParams.get('redirect'))
  const redirectUri = `${url.origin}/api/auth/oauth/google/callback`
  const authorize = buildAuthorizeUrl({ clientId: env.GOOGLE_OAUTH_CLIENT_ID, redirectUri, state, codeChallenge: challenge })

  const headers = new Headers({ Location: authorize })
  headers.append('Set-Cookie', `oauth_state=${state}; ${TEMP_COOKIE}`)
  headers.append('Set-Cookie', `oauth_verifier=${verifier}; ${TEMP_COOKIE}`)
  headers.append('Set-Cookie', `oauth_redirect=${encodeURIComponent(redirect)}; ${TEMP_COOKIE}`)
  return new Response(null, { status: 302, headers })
}

export async function handleOAuthCallback(request: Request, env: Env): Promise<Response> {
  if (unconfigured(env)) return Response.json({ error: 'oauth_not_configured' }, { status: 503 })

  const url = new URL(request.url)
  const fail = () => Response.redirect(`${url.origin}/login?error=oauth`, 302)

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookies = parseCookies(request.headers.get('Cookie') ?? '')
  // state-CSRF: query state must match the cookie set at /start
  if (!code || !state || !cookies['oauth_state'] || state !== cookies['oauth_state']) return fail()
  const verifier = cookies['oauth_verifier']
  if (!verifier) return fail()

  const redirectUri = `${url.origin}/api/auth/oauth/google/callback`
  const tok = await exchangeCode({ code, verifier, clientId: env.GOOGLE_OAUTH_CLIENT_ID, clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET, redirectUri })
  if (!tok.ok) return fail()
  const info = await fetchUserinfo(tok.accessToken)
  if (!info.ok) return fail()

  const now = Math.floor(Date.now() / 1000)

  // Linking (mirror telegram-auth): 1) by google_sub  2) verified-email link+backfill  3) create.
  let user = await env.DB.prepare('SELECT id, email FROM users WHERE google_sub = ?')
    .bind(info.sub).first<{ id: string; email: string }>()

  if (!user && info.emailVerified) {
    const byEmail = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?')
      .bind(info.email).first<{ id: string; email: string }>()
    if (byEmail) {
      await env.DB.prepare('UPDATE users SET google_sub = ? WHERE id = ?').bind(info.sub, byEmail.id).run()
      user = byEmail
    }
  }

  if (!user) {
    const id = crypto.randomUUID()
    await env.DB.prepare(
      'INSERT INTO users (id, email, created_at, language, source, google_sub) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, info.email, now, 'unknown', 'google', info.sub).run()
    user = { id, email: info.email }
  }

  const jwt = await signJWT({ sub: user.id, email: user.email, iat: now, exp: now + SESSION_MAX_AGE }, env.WORKER_JWT_SECRET)
  const redirect = safeRedirectPath(cookies['oauth_redirect'] ? decodeURIComponent(cookies['oauth_redirect']) : '/')

  const headers = new Headers({ Location: `${url.origin}${redirect}` })
  headers.append('Set-Cookie', `session=${jwt}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}; Path=/`)
  headers.append('Set-Cookie', 'oauth_state=; Max-Age=0; Path=/')
  headers.append('Set-Cookie', 'oauth_verifier=; Max-Age=0; Path=/')
  headers.append('Set-Cookie', 'oauth_redirect=; Max-Age=0; Path=/')
  return new Response(null, { status: 302, headers })
}
