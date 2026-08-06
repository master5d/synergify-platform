import { describe, it, expect, vi } from 'vitest'
import { handleAdmission, handleAcademyMe } from './academy'
import { COURSE_CATALOG } from '../lib/course-catalog'
import type { Env } from '../lib/types'
import { signJWT } from '../lib/jwt'

const SECRET = 'test-secret-32-characters-minimum!!'

async function makeAuthRequest(url: string, method: string): Promise<Request> {
  const now = Math.floor(Date.now() / 1000)
  const jwt = await signJWT({ sub: 'user1', email: 'a@b.com', iat: now, exp: now + 3600 }, SECRET)
  return new Request(url, { method, headers: { 'Cookie': `session=${jwt}` } })
}

interface MockData {
  completedSlugs?: string[]
  /** Последовательные ответы SELECT admissions ... first(): [до INSERT, после INSERT] */
  admissionFirstSeq?: ({ granted_at: number } | null)[]
  admissions?: { course: string; granted_at: number }[]
  courses?: { course: string; viewed: number; completed: number }[]
}

function makeEnv(data: MockData = {}) {
  const run = vi.fn().mockResolvedValue({ success: true })
  const firstSeq = [...(data.admissionFirstSeq ?? [null])]
  const env = {
    DB: {
      prepare: (sql: string) => ({
        bind: (..._args: unknown[]) => ({
          run,
          first: vi.fn().mockImplementation(async () =>
            firstSeq.length > 1 ? firstSeq.shift() : firstSeq[0] ?? null),
          all: vi.fn().mockImplementation(async () => {
            if (sql.includes('GROUP BY course')) return { results: data.courses ?? [] }
            if (sql.includes('FROM admissions')) return { results: data.admissions ?? [] }
            if (sql.includes('FROM progress')) {
              return { results: (data.completedSlugs ?? []).map(s => ({ lesson_slug: s })) }
            }
            return { results: [] }
          }),
        }),
      }),
    } as unknown as D1Database,
    WORKER_JWT_SECRET: SECRET,
  } as unknown as Env
  return { env, run }
}

const ALL_SLUGS = COURSE_CATALOG.map(m => m.slug)

describe('handleAdmission', () => {
  it('returns 401 without auth', async () => {
    const req = new Request('https://ai.synergify.com/api/academy/admission', { method: 'POST' })
    const { env } = makeEnv()
    const res = await handleAdmission(req, env)
    expect(res.status).toBe(401)
  })

  it('returns 403 with the missing module list when incomplete', async () => {
    const req = await makeAuthRequest('https://ai.synergify.com/api/academy/admission', 'POST')
    const { env, run } = makeEnv({ completedSlugs: ['00-kickstart'] })
    const res = await handleAdmission(req, env)
    expect(res.status).toBe(403)
    const body = await res.json() as { missing: string[] }
    expect(body.missing).toHaveLength(ALL_SLUGS.length - 1)
    expect(body.missing).toContain('01-introduction')
    expect(run).not.toHaveBeenCalled()
  })

  it('grants when completed progress covers every catalog module', async () => {
    const req = await makeAuthRequest('https://ai.synergify.com/api/academy/admission', 'POST')
    const { env, run } = makeEnv({
      completedSlugs: ALL_SLUGS,
      admissionFirstSeq: [null, { granted_at: 12345 }], // до INSERT пусто, после — строка
    })
    const res = await handleAdmission(req, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { granted: boolean; course: string; granted_at: number }
    expect(body.granted).toBe(true)
    expect(body.course).toBe('tochka-sborki')
    expect(body.granted_at).toBe(12345) // read back — idempotent repeat returns the ORIGINAL grant time
    expect(run).toHaveBeenCalled() // INSERT OR IGNORE issued
  })

  it('an existing admission is permanent: granted without re-checking progress', async () => {
    // Рост COURSE_CATALOG не должен ретроактивно закрывать дверь выпускникам.
    const req = await makeAuthRequest('https://ai.synergify.com/api/academy/admission', 'POST')
    const { env, run } = makeEnv({
      completedSlugs: [], // прогресс «неполный» — и это не должно иметь значения
      admissionFirstSeq: [{ granted_at: 777 }],
    })
    const res = await handleAdmission(req, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { granted: boolean; granted_at: number }
    expect(body.granted).toBe(true)
    expect(body.granted_at).toBe(777)
    expect(run).not.toHaveBeenCalled() // ни INSERT, ни пере-проверки
  })
})

describe('handleAcademyMe', () => {
  it('returns 401 without auth', async () => {
    const req = new Request('https://ai.synergify.com/api/academy/me')
    const { env } = makeEnv()
    const res = await handleAcademyMe(req, env)
    expect(res.status).toBe(401)
  })

  it('returns the unified profile shape', async () => {
    const req = await makeAuthRequest('https://ai.synergify.com/api/academy/me', 'GET')
    const { env } = makeEnv({
      admissions: [{ course: 'tochka-sborki', granted_at: 111 }],
      courses: [{ course: 'tochka-sborki', viewed: 12, completed: 9 }],
    })
    const res = await handleAcademyMe(req, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { email: string; admissions: unknown[]; courses: unknown[] }
    expect(body.email).toBe('a@b.com')
    expect(body.admissions).toEqual([{ course: 'tochka-sborki', granted_at: 111 }])
    expect(body.courses).toEqual([{ course: 'tochka-sborki', viewed: 12, completed: 9 }])
  })
})
