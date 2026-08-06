import { describe, it, expect, vi, afterEach } from 'vitest'
import { handleOAuthStart, handleOAuthCallback } from './oauth'
import type { Env } from '../lib/types'

type DbCall = { sql: string; binds: unknown[] }

function makeEnv(opts: { bySub?: unknown; byEmail?: unknown; calls?: DbCall[]; unconfigured?: boolean } = {}): Env {
  const DB = {
    prepare: (sql: string) => ({
      bind: (...binds: unknown[]) => {
        opts.calls?.push({ sql, binds })
        return {
          first: vi.fn().mockImplementation(async () => {
            if (/WHERE google_sub = \?/.test(sql)) return opts.bySub ?? null
            if (/WHERE email = \?/.test(sql)) return opts.byEmail ?? null
            return null
          }),
          run: vi.fn().mockResolvedValue({ success: true }),
        }
      },
    }),
  } as unknown as D1Database
  return {
    DB,
    WORKER_JWT_SECRET: 'test-secret-32-characters-minimum!!',
    GOOGLE_OAUTH_CLIENT_ID: opts.unconfigured ? '' : 'cid',
    GOOGLE_OAUTH_CLIENT_SECRET: opts.unconfigured ? '' : 'csecret',
  } as Env
}

function startReq(redirect?: string): Request {
  const u = new URL('https://ai.synergify.com/api/auth/oauth/google/start')
  if (redirect) u.searchParams.set('redirect', redirect)
  return new Request(u.toString(), { method: 'GET' })
}

function callbackReq(query: Record<string, string>, cookie: string): Request {
  const u = new URL('https://ai.synergify.com/api/auth/oauth/google/callback')
  for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v)
  return new Request(u.toString(), { method: 'GET', headers: { Cookie: cookie } })
}

// Mock the two Google network calls: token exchange then userinfo.
function mockGoogle(userinfo: { sub: string; email: string; email_verified: boolean }) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any) => {
    const url = typeof input === 'string' ? input : input.url
    if (url.includes('oauth2.googleapis.com/token')) return new Response(JSON.stringify({ access_token: 'at' }), { status: 200 })
    if (url.includes('googleapis.com/oauth2/v3/userinfo')) return new Response(JSON.stringify(userinfo), { status: 200 })
    return new Response('{}', { status: 404 })
  })
}

const usersInsert = (calls: DbCall[]) => calls.find(c => /INSERT INTO users/.test(c.sql))
const usersUpdate = (calls: DbCall[]) => calls.find(c => /UPDATE users SET google_sub/.test(c.sql))

afterEach(() => vi.restoreAllMocks())

describe('handleOAuthStart', () => {
  it('returns 503 when unconfigured', async () => {
    expect((await handleOAuthStart(startReq(), makeEnv({ unconfigured: true }))).status).toBe(503)
  })

  it('302-redirects to Google and sets state/verifier/redirect cookies', async () => {
    const res = await handleOAuthStart(startReq('/course/'), makeEnv())
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')!).toContain('accounts.google.com/o/oauth2/v2/auth')
    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('Set-Cookie') ?? '']
    const joined = setCookies.join('\n')
    expect(joined).toContain('oauth_state=')
    expect(joined).toContain('oauth_verifier=')
    expect(joined).toContain('oauth_redirect=')
    expect(joined).toContain('SameSite=Lax')
  })
})

describe('handleOAuthCallback', () => {
  it('returns 503 when unconfigured', async () => {
    const res = await handleOAuthCallback(callbackReq({ code: 'c', state: 's' }, 'oauth_state=s'), makeEnv({ unconfigured: true }))
    expect(res.status).toBe(503)
  })

  it('rejects a state/cookie mismatch without setting a session', async () => {
    const res = await handleOAuthCallback(callbackReq({ code: 'c', state: 'x' }, 'oauth_state=y; oauth_verifier=v'), makeEnv())
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')!).toContain('/login?error=oauth')
    expect(res.headers.get('Set-Cookie') ?? '').not.toContain('session=')
  })

  it('logs in an existing user matched by google_sub (no insert), sets session', async () => {
    mockGoogle({ sub: 'g-1', email: 'a@example.com', email_verified: true })
    const calls: DbCall[] = []
    const res = await handleOAuthCallback(
      callbackReq({ code: 'c', state: 's' }, 'oauth_state=s; oauth_verifier=v; oauth_redirect=%2Fcourse%2F'),
      makeEnv({ bySub: { id: 'u-1', email: 'a@example.com' }, calls })
    )
    expect(res.status).toBe(302)
    const joined = (res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('Set-Cookie') ?? '']).join('\n')
    expect(joined).toContain('session=')
    expect(res.headers.get('Location')!).toBe('https://ai.synergify.com/course/')
    expect(usersInsert(calls)).toBeUndefined()
  })

  it('links a verified email to an existing email user and backfills google_sub', async () => {
    mockGoogle({ sub: 'g-2', email: 'known@example.com', email_verified: true })
    const calls: DbCall[] = []
    const res = await handleOAuthCallback(
      callbackReq({ code: 'c', state: 's' }, 'oauth_state=s; oauth_verifier=v'),
      makeEnv({ byEmail: { id: 'u-known', email: 'known@example.com' }, calls })
    )
    expect(res.status).toBe(302)
    const upd = usersUpdate(calls)
    expect(upd).toBeDefined()
    expect(upd!.binds[0]).toBe('g-2')      // google_sub
    expect(upd!.binds[1]).toBe('u-known')  // user id
    expect(usersInsert(calls)).toBeUndefined()
  })

  it('does NOT link an UNVERIFIED email to an existing email user — creates instead', async () => {
    mockGoogle({ sub: 'g-3', email: 'known@example.com', email_verified: false })
    const calls: DbCall[] = []
    const res = await handleOAuthCallback(
      callbackReq({ code: 'c', state: 's' }, 'oauth_state=s; oauth_verifier=v'),
      makeEnv({ byEmail: { id: 'u-known', email: 'known@example.com' }, calls })
    )
    expect(res.status).toBe(302)
    expect(usersUpdate(calls)).toBeUndefined()   // never backfilled onto the existing account
    expect(usersInsert(calls)).toBeDefined()      // a fresh row instead
  })

  it('creates a new user when no match exists', async () => {
    mockGoogle({ sub: 'g-4', email: 'new@example.com', email_verified: true })
    const calls: DbCall[] = []
    const res = await handleOAuthCallback(
      callbackReq({ code: 'c', state: 's' }, 'oauth_state=s; oauth_verifier=v'),
      makeEnv({ calls })
    )
    const ins = usersInsert(calls)
    expect(ins).toBeDefined()
    // binds: id, email, created_at, language, source, google_sub
    expect(ins!.binds[1]).toBe('new@example.com')
    expect(ins!.binds[4]).toBe('google')
    expect(ins!.binds[5]).toBe('g-4')
  })
})
