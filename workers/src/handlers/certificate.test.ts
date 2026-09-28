import { describe, it, expect } from 'vitest'
import { handleCertificateCode, handleCertificateVerify } from './certificate'
import { signCertificateCode, verifyCertificateCode, parseCertificateCode, certificateVerifyUrl } from '../lib/certificate-code'
import { COURSE_CATALOG } from '../lib/course-catalog'
import { CATALOG_UNITS } from '../lib/course-completion'
import { signJWT } from '../lib/jwt'
import type { Env } from '../lib/types'

const SECRET = 'test-secret-32-characters-minimum!!'
const USER = '3f2b8a1e-1111-4c2d-9e0f-123456789abc'
const OTHER = '9a9a9a9a-2222-4c2d-9e0f-cbadcbadcbad'
const ALL = COURSE_CATALOG.map(m => m.slug)

interface Data {
  /** Завершённые строки progress пользователя USER: [lesson_slug, completed_at]. */
  rows?: [string, number][]
  admission?: { granted_at: number } | null
}

function makeEnv(data: Data = {}): { env: Env; binds: unknown[][] } {
  const binds: unknown[][] = []
  const env = {
    DB: {
      prepare: (sql: string) => ({
        bind: (...args: unknown[]) => {
          binds.push(args)
          const mine = args[0] === USER
          return {
            first: async () => (sql.includes('FROM admissions') && mine ? data.admission ?? null : null),
            all: async () => ({
              results: sql.includes('FROM progress') && mine
                ? (data.rows ?? []).map(([lesson_slug, completed_at]) => ({ lesson_slug, completed_at }))
                : [],
            }),
          }
        },
      }),
    } as unknown as D1Database,
    WORKER_JWT_SECRET: SECRET,
  } as unknown as Env
  return { env, binds }
}

const verifyReq = (c: string | null) =>
  new Request(`https://ai.synergify.com/api/certificate/verify${c === null ? '' : `?c=${encodeURIComponent(c)}`}`)

async function body(res: Response) {
  return res.json() as Promise<Record<string, unknown>>
}

describe('certificate code (HMAC)', () => {
  it('round-trips: signed code verifies to its userId', async () => {
    const code = await signCertificateCode(USER, SECRET)
    expect(code.startsWith(`${USER}.`)).toBe(true)
    expect(parseCertificateCode(code)).not.toBeNull()
    expect(await verifyCertificateCode(code, SECRET)).toBe(USER)
  })

  it('a forged signature, another secret or a swapped userId do not verify', async () => {
    const code = await signCertificateCode(USER, SECRET)
    const sig = code.split('.')[1]
    const flipped = sig[0] === 'A' ? `B${sig.slice(1)}` : `A${sig.slice(1)}`
    expect(await verifyCertificateCode(`${USER}.${flipped}`, SECRET)).toBeNull()
    expect(await verifyCertificateCode(code, 'another-secret-32-characters-min!!')).toBeNull()
    // Чужой userId с подписью от USER — подпись привязана к userId.
    expect(await verifyCertificateCode(`${OTHER}.${sig}`, SECRET)).toBeNull()
  })

  it('does not share a signature with the unsubscribe link (different prefix)', async () => {
    const { signUnsubscribe } = await import('../lib/email-unsubscribe')
    const unsub = await signUnsubscribe(USER, SECRET)
    expect(await verifyCertificateCode(`${USER}.${unsub}`, SECRET)).toBeNull()
  })

  it('rejects malformed codes before crypto', () => {
    for (const bad of ['', 'nodot', '.abc', `${USER}.`, `${USER}.short`, `bad id!.${'A'.repeat(43)}`, 'x'.repeat(200)]) {
      expect(parseCertificateCode(bad)).toBeNull()
    }
  })

  it('builds the verify URL on the course domain, per locale', () => {
    expect(certificateVerifyUrl('u.s')).toBe('https://ai.synergify.com/certificate/verify/?c=u.s')
    expect(certificateVerifyUrl('u.s', 'en')).toBe('https://ai.synergify.com/en/certificate/verify/?c=u.s')
  })
})

describe('GET /api/certificate/verify', () => {
  it('valid signature + completed course (module rows) → valid:true without email/name', async () => {
    const code = await signCertificateCode(USER, SECRET)
    const { env } = makeEnv({ rows: ALL.map((s, i) => [s, 1_700_000_000 + i] as [string, number]) })
    const res = await handleCertificateVerify(verifyReq(code), env)
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    const b = await body(res)
    expect(Object.keys(b).sort()).toEqual(['completedAt', 'course', 'modules', 'valid'])
    expect(b.valid).toBe(true)
    expect(b.course).toBe('tochka-sborki')
    expect(b.modules).toEqual(ALL)
    expect(b.completedAt).toBe(new Date((1_700_000_000 + ALL.length - 1) * 1000).toISOString())
    expect(JSON.stringify(b)).not.toMatch(/@|email|name/i)
  })

  it('unit-level progress closes a module too (all units of every catalog module)', async () => {
    const code = await signCertificateCode(USER, SECRET)
    const rows: [string, number][] = []
    for (const s of ALL) for (const u of CATALOG_UNITS[s]) rows.push([`${s}/${u}`, 1_700_000_100])
    const { env } = makeEnv({ rows })
    const b = await body(await handleCertificateVerify(verifyReq(code), env))
    expect(b.valid).toBe(true)
    expect(b.modules).toEqual(ALL)
  })

  it('an existing admission is the completion record: its time, modules from progress', async () => {
    const code = await signCertificateCode(USER, SECRET)
    const { env } = makeEnv({ admission: { granted_at: 1_750_000_000 }, rows: [['00-kickstart', 1]] })
    const b = await body(await handleCertificateVerify(verifyReq(code), env))
    expect(b.valid).toBe(true)
    expect(b.completedAt).toBe(new Date(1_750_000_000 * 1000).toISOString())
    expect(b.modules).toEqual(['00-kickstart'])
  })

  it('incomplete course → 404 valid:false, no details', async () => {
    const code = await signCertificateCode(USER, SECRET)
    // Модуль 08 закрыт не всеми юнитами — курс не завершён.
    const rows: [string, number][] = ALL.slice(0, -1).map(s => [s, 1] as [string, number])
    rows.push([`08-agent-engineering/${CATALOG_UNITS['08-agent-engineering'][0]}`, 2])
    const { env } = makeEnv({ rows })
    const res = await handleCertificateVerify(verifyReq(code), env)
    expect(res.status).toBe(404)
    expect(await body(res)).toEqual({ valid: false })
  })

  it('forged signature → 404 valid:false and D1 is not touched', async () => {
    const code = await signCertificateCode(USER, SECRET)
    const forged = `${USER}.${'A'.repeat(43)}`
    const { env, binds } = makeEnv({ rows: ALL.map(s => [s, 1] as [string, number]) })
    const res = await handleCertificateVerify(verifyReq(forged), env)
    expect(res.status).toBe(404)
    expect(await body(res)).toEqual({ valid: false })
    expect(binds).toHaveLength(0)
    expect(code).not.toBe(forged)
  })

  it("someone else's userId under a valid-looking signature → 404", async () => {
    const sig = (await signCertificateCode(USER, SECRET)).split('.')[1]
    const { env } = makeEnv({ rows: ALL.map(s => [s, 1] as [string, number]) })
    const res = await handleCertificateVerify(verifyReq(`${OTHER}.${sig}`), env)
    expect(res.status).toBe(404)
    expect(await body(res)).toEqual({ valid: false })
  })

  it('missing or malformed code → 400 valid:false', async () => {
    const { env } = makeEnv()
    for (const c of [null, '', 'garbage']) {
      const res = await handleCertificateVerify(verifyReq(c), env)
      expect(res.status).toBe(400)
      expect(await body(res)).toEqual({ valid: false })
    }
  })
})

describe('GET /api/certificate/code', () => {
  it('401 without a session', async () => {
    const { env } = makeEnv()
    const res = await handleCertificateCode(new Request('https://ai.synergify.com/api/certificate/code'), env)
    expect(res.status).toBe(401)
  })

  it('returns the signed code of the session user and its verify URL', async () => {
    const now = Math.floor(Date.now() / 1000)
    const jwt = await signJWT({ sub: USER, email: 'a@b.com', iat: now, exp: now + 3600 }, SECRET)
    const { env } = makeEnv()
    const res = await handleCertificateCode(
      new Request('https://ai.synergify.com/api/certificate/code', { headers: { Cookie: `session=${jwt}` } }), env)
    expect(res.status).toBe(200)
    const b = await body(res) as { code: string; url: string }
    expect(b.code).toBe(await signCertificateCode(USER, SECRET))
    expect(b.url).toBe(`https://ai.synergify.com/certificate/verify/?c=${encodeURIComponent(b.code)}`)
    expect(JSON.stringify(b)).not.toContain('a@b.com')
  })
})
