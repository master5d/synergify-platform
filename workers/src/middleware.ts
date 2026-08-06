import type { Env, JWTPayload } from './lib/types'
import { verifyJWT } from './lib/jwt'

export function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const key = part.slice(0, eq).trim()
    if (!key) continue
    result[key] = part.slice(eq + 1).trim()
  }
  return result
}

export async function requireAuth(
  request: Request,
  env: Env
): Promise<JWTPayload | Response> {
  const cookieHeader = request.headers.get('Cookie') ?? ''
  const cookies = parseCookies(cookieHeader)
  const token = cookies['session']
  if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  const payload = await verifyJWT(token, env.WORKER_JWT_SECRET)
  if (!payload) return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })
  return payload
}

export async function requireOwner(
  request: Request,
  env: Env
): Promise<JWTPayload | Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth
  if (!env.OWNER_EMAIL || auth.email !== env.OWNER_EMAIL) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }
  return auth
}
