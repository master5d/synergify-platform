import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import worker from '../index'
import { handleCare, CARE_RATE } from './care'
import { sendEmailSES } from '../lib/ses'
import { validateCare, buildCareAutoreply, CARE } from '../lib/care'
import type { Env } from '../lib/types'

vi.mock('../lib/ses', () => ({ sendEmailSES: vi.fn() }))
const ses = vi.mocked(sendEmailSES)

type DbCall = { sql: string; binds: unknown[] }

function makeDb(opts: { calls?: DbCall[]; missingTable?: boolean; counts?: { by_email: number; by_ip: number } } = {}) {
  const fail = () => { throw new Error('D1_ERROR: no such table: care_requests: SQLITE_ERROR') }
  return {
    prepare: (sql: string) => ({
      bind: (...binds: unknown[]) => {
        opts.calls?.push({ sql, binds })
        return {
          first: async () => { if (opts.missingTable) fail(); return opts.counts ?? { by_email: 0, by_ip: 0 } },
          run: async () => { if (opts.missingTable) fail(); return { success: true } },
        }
      },
    }),
  } as unknown as D1Database
}

const baseEnv = { WORKER_JWT_SECRET: 's', SES_ACCESS_KEY_ID: 'AKIATEST', SES_SECRET_ACCESS_KEY: 'x', OWNER_EMAIL: 'owner@example.com' }
const env = (db: D1Database, over: Partial<Env> = {}) => ({ DB: db, ...baseEnv, ...over }) as Env

function ctx() {
  const waits: Promise<unknown>[] = []
  return { waits, c: { waitUntil: (p: Promise<unknown>) => waits.push(p), passThroughOnException: () => {} } as unknown as ExecutionContext }
}

const good = { site: 'tochka-sborki', topic: 'stuck', message: 'Не открывается юнит u2 после входа', email: 'Learner@Example.com', pageUrl: 'https://ai.synergify.com/lessons/01-introduction/u2/', locale: 'ru' }

function req(body: unknown, headers: Record<string, string> = {}, method = 'POST') {
  return new Request('https://ai.synergify.com/api/care', {
    method,
    body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.7', ...headers },
  })
}

const insertOf = (calls: DbCall[]) => calls.find(c => /INSERT INTO care_requests/.test(c.sql))

let errSpy: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  ses.mockReset()
  ses.mockResolvedValue({ ok: true, status: 200 })
  errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => errSpy.mockRestore())

describe('validateCare', () => {
  it('accepts the closed topic list and lowercases email', () => {
    const v = validateCare(good, null)
    expect(v.ok && v.value.email).toBe('learner@example.com')
  })
  it.each([
    [{ ...good, topic: 'billing' }, 'Unknown topic'],
    [{ ...good, message: 'hi' }, 'Message too short'],
    [{ ...good, message: 'x'.repeat(CARE.limits.messageMax + 1) }, 'Message too long'],
    [{ ...good, email: 'not-an-email' }, 'Valid email required'],
    [{ ...good, pageUrl: 'javascript:alert(1)' }, 'Invalid page URL'],
    [{ ...good, site: 'evil.example' }, 'Unknown site'],
  ])('rejects %j → %s', (body, error) => {
    const v = validateCare(body as Record<string, unknown>, null)
    expect(v).toEqual({ ok: false, error })
  })
  it('falls back to the Origin when site is absent', () => {
    const { site: _drop, ...noSite } = good
    const v = validateCare(noSite, 'https://mamaev.coach')
    expect(v.ok && v.value.site).toBe('mamaev-coach')
  })
  it('page URL is optional', () => {
    const v = validateCare({ ...good, pageUrl: '' }, null)
    expect(v.ok && v.value.pageUrl).toBeNull()
  })
})

describe('POST /api/care', () => {
  it('400 on invalid JSON and on a bad topic — nothing written, nothing sent', async () => {
    const calls: DbCall[] = []
    const { c } = ctx()
    expect((await handleCare(req('{nope'), env(makeDb({ calls })), c)).status).toBe(400)
    expect((await handleCare(req({ ...good, topic: 'x' }), env(makeDb({ calls })), c)).status).toBe(400)
    expect(insertOf(calls)).toBeUndefined()
    expect(ses).not.toHaveBeenCalled()
  })

  it('honeypot: a filled hidden field looks successful but writes and sends nothing', async () => {
    const calls: DbCall[] = []
    const { c, waits } = ctx()
    const res = await handleCare(req({ ...good, company: 'Acme' }), env(makeDb({ calls })), c)
    expect(res.status).toBe(200)
    expect(calls).toEqual([])
    expect(ses).not.toHaveBeenCalled()
    expect(waits).toEqual([])
  })

  it('writes the journal row, notifies the owner and auto-replies to the sender', async () => {
    const calls: DbCall[] = []
    const { c, waits } = ctx()
    const res = await handleCare(req(good), env(makeDb({ calls })), c)
    await Promise.all(waits)
    expect(res.status).toBe(200)
    const body = await res.json() as { ok: boolean; id: string }
    expect(body.ok).toBe(true)

    const ins = insertOf(calls)!
    expect(ins.binds).toEqual(expect.arrayContaining([body.id, 'tochka-sborki', 'stuck', good.message, 'learner@example.com', good.pageUrl, 'ru']))
    expect(ins.binds).not.toContain('203.0.113.7') // IP хранится только хэшем

    const [owner, reply] = ses.mock.calls.map(([, m]) => m)
    expect(owner.to).toBe('owner@example.com')
    expect(owner.subject).toContain('Застрял в уроке')
    for (const part of ['Точка Сборки', 'learner@example.com', good.pageUrl, good.message]) expect(owner.text).toContain(part)
    expect(owner.text).not.toContain('НЕ ЗАПИСАНО')

    expect(reply.to).toBe('learner@example.com')
    expect(reply.text).toContain(CARE.responseTime.ru)
    expect(reply.text).not.toContain(good.message) // автоответ не ретранслирует текст обращения
  })

  it('no care_requests table yet (migration 0020 not applied): still notifies + auto-replies, logs the skip loudly', async () => {
    const { c, waits } = ctx()
    const res = await handleCare(req(good), env(makeDb({ missingTable: true })), c)
    await Promise.all(waits)
    expect(res.status).toBe(200)
    expect(ses).toHaveBeenCalledTimes(2)
    expect(ses.mock.calls[0][1].text).toContain('В ЖУРНАЛ НЕ ЗАПИСАНО')
    const logged = errSpy.mock.calls.map(a => String(a[0])).join('\n')
    expect(logged).toMatch(/JOURNAL WRITE SKIPPED.*migration 0020/)
    expect(logged).toMatch(/RATE LIMIT SKIPPED/)
  })

  it('no table AND owner email failed → 502, not a false «received»; no auto-reply', async () => {
    ses.mockResolvedValue({ ok: false, status: 500, error: 'boom' })
    const { c, waits } = ctx()
    const res = await handleCare(req(good), env(makeDb({ missingTable: true })), c)
    expect(res.status).toBe(502)
    expect(waits).toEqual([])
    expect(ses).toHaveBeenCalledTimes(1)
  })

  it('journal written but SES down → still 200 (the request is in the journal)', async () => {
    ses.mockResolvedValue({ ok: false, status: 500, error: 'boom' })
    const calls: DbCall[] = []
    const { c } = ctx()
    const res = await handleCare(req(good), env(makeDb({ calls })), c)
    expect(res.status).toBe(200)
    expect(insertOf(calls)).toBeDefined()
  })

  it('rate limit: too many requests from one email or one IP within the window → 429', async () => {
    const { c } = ctx()
    for (const counts of [{ by_email: CARE_RATE.perEmail, by_ip: 0 }, { by_email: 0, by_ip: CARE_RATE.perIp }]) {
      const calls: DbCall[] = []
      const res = await handleCare(req(good), env(makeDb({ calls, counts })), c)
      expect(res.status).toBe(429)
      expect(insertOf(calls)).toBeUndefined()
    }
    expect(ses).not.toHaveBeenCalled()
  })

  it('English sender gets an English auto-reply with the configured response time', () => {
    const v = validateCare({ ...good, locale: 'en', site: 'academy' }, null)
    if (!v.ok) throw new Error('invalid')
    const r = buildCareAutoreply(v.value)
    expect(r.text).toContain(CARE.responseTime.en)
    expect(r.from).toMatch(/<noreply@synergify\.com>$/)
  })
})

describe('/api/care routing + CORS', () => {
  it.each(['https://ai.synergify.com', 'https://academy.synergify.com', 'https://mamaev.coach'])('allows origin %s', async (origin) => {
    const { c } = ctx()
    const pre = await worker.fetch(new Request('https://ai.synergify.com/api/care', { method: 'OPTIONS', headers: { Origin: origin } }), env(makeDb()), c)
    expect(pre.status).toBe(204)
    expect(pre.headers.get('Access-Control-Allow-Origin')).toBe(origin)
    const res = await worker.fetch(req(good, { Origin: origin }), env(makeDb()), c)
    expect(res.status).toBe(200)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(origin)
  })

  it('a foreign origin is not echoed back', async () => {
    const { c } = ctx()
    const res = await worker.fetch(req(good, { Origin: 'https://evil.example' }), env(makeDb()), c)
    expect(res.headers.get('Access-Control-Allow-Origin')).not.toBe('https://evil.example')
  })

  it('GET /api/care serves the public config (topics + response time) for pages without LMS/care.json', async () => {
    const { c } = ctx()
    const res = await worker.fetch(req(null, {}, 'GET'), env(makeDb()), c)
    const cfg = await res.json() as { responseTime: { ru: string }; topics: { key: string }[] }
    expect(cfg.responseTime.ru).toBe(CARE.responseTime.ru)
    expect(cfg.topics.map(t => t.key)).toEqual(['access', 'stuck', 'content', 'tech', 'idea', 'other'])
  })
})
