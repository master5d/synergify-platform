import { describe, expect, it } from 'vitest'
import { ADMISSION_COURSE, checkAdmission, gateCopy, isAdmitted } from './gate'

const ok = (body: unknown): Response => new Response(JSON.stringify(body), { status: 200 })
const status = (code: number): Response => new Response('{}', { status: code })

describe('admission gate', () => {
  it('isAdmitted only for the admission course', () => {
    expect(isAdmitted({ admissions: [{ course: ADMISSION_COURSE, granted_at: 1 }] })).toBe(true)
    expect(isAdmitted({ admissions: [{ course: 'other', granted_at: 1 }] })).toBe(false)
    expect(isAdmitted({ admissions: [] })).toBe(false)
    expect(isAdmitted(null)).toBe(false)
  })

  it('gate copy carries both locales with CTA to the course', () => {
    for (const locale of ['ru', 'en'] as const) {
      const c = gateCopy(locale)
      expect(c.heading).toBeTruthy()
      expect(c.body.length).toBeGreaterThan(0)
      expect(c.ctaHref).toContain('ai.synergify.com')
    }
  })

  it('admitted via /me', async () => {
    const fetchFn = (async (url: RequestInfo | URL) => {
      expect(String(url)).toContain('/api/academy/me')
      return ok({ admissions: [{ course: ADMISSION_COURSE, granted_at: 1 }] })
    }) as typeof fetch
    expect(await checkAdmission(fetchFn)).toBe('admitted')
  })

  it('self-heals: no admission in /me but POST grants', async () => {
    const calls: string[] = []
    const fetchFn = (async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push(`${init?.method ?? 'GET'} ${String(url)}`)
      if (String(url).endsWith('/me')) return ok({ admissions: [] })
      return ok({ granted: true })
    }) as typeof fetch
    expect(await checkAdmission(fetchFn)).toBe('admitted')
    expect(calls[1]).toContain('POST')
    expect(calls[1]).toContain('/api/academy/admission')
  })

  it('gated when unauthenticated (401 on both)', async () => {
    const fetchFn = (async () => status(401)) as typeof fetch
    expect(await checkAdmission(fetchFn)).toBe('gated')
  })

  it('gated when course incomplete (grant 403)', async () => {
    const fetchFn = (async (url: RequestInfo | URL) =>
      String(url).endsWith('/me') ? ok({ admissions: [] }) : status(403)) as typeof fetch
    expect(await checkAdmission(fetchFn)).toBe('gated')
  })

  it('fail-closed on network error and on 5xx', async () => {
    const boom = (async () => { throw new Error('offline') }) as unknown as typeof fetch
    expect(await checkAdmission(boom)).toBe('gated')
    const fiveHundred = (async () => status(500)) as typeof fetch
    expect(await checkAdmission(fiveHundred)).toBe('gated')
  })
})
