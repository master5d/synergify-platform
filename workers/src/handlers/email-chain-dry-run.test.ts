import { describe, it, expect, vi, afterEach } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import worker from '../index'
import { runEmailChains, dryRunEmailChains } from './email-chain-cron'
import { handleEmailChainDryRun, parseAt } from './email-chain-dry-run'
import { signJWT } from '../lib/jwt'
import { TOCHKA_SBORKI, type Step } from '../lib/email-chains'
import type { Env } from '../lib/types'

const SECRET = 'test-secret-32-characters-minimum!!'
const OWNER = 'owner@x.test'
const NOW = 2_000_000_000
const H = 3600
const D = 24 * H

// D1 на настоящем SQLite: схема = все миграции по порядку (как email-chain-cron.test.ts).
const MIGRATIONS = fileURLToPath(new URL('../../migrations/', import.meta.url))
function sqliteD1() {
  const db = new DatabaseSync(':memory:')
  for (const f of readdirSync(MIGRATIONS).filter(f => f.endsWith('.sql')).sort()) db.exec(readFileSync(MIGRATIONS + f, 'utf8'))
  const d1 = {
    prepare(sql: string) {
      let args: any[] = []
      const stmt = {
        bind: (...a: any[]) => { args = a; return stmt },
        first: async () => (db.prepare(sql).get(...args) as any) ?? null,
        all: async () => ({ results: db.prepare(sql).all(...args) as any[] }),
        run: async () => ({ success: true, meta: { changes: Number(db.prepare(sql).run(...args).changes) } }),
      }
      return stmt
    },
  } as unknown as D1Database
  return { db, d1 }
}

// id длиннее 8 символов — чтобы проверить, что полный id наружу не выходит.
const uid = (tag: string) => `${tag.padEnd(8, '_')}-0123456789abcdef`

function addUser(db: DatabaseSync, id: string, over: { created_at?: number; language?: string; telegram_id?: string | null; last_email_at?: number | null; email_optout?: number } = {}) {
  db.prepare('INSERT INTO users (id, email, created_at, language, telegram_id, last_email_at, email_optout) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, `${id}@x.test`, over.created_at ?? NOW - 2 * D - H, over.language ?? 'ru', over.telegram_id ?? null, over.last_email_at ?? null, over.email_optout ?? 0)
}
const view = (db: DatabaseSync, id: string, slug: string, at: number) =>
  db.prepare("INSERT INTO progress (user_id, lesson_slug, viewed_at, completed_at, course) VALUES (?, ?, ?, NULL, 'tochka-sborki')").run(id, slug, at)
const sent = (db: DatabaseSync, id: string, key: string, at: number) =>
  db.prepare("INSERT INTO email_sends (user_id, course, step_key, sent_at) VALUES (?, 'tochka-sborki', ?, ?)").run(id, key, at)
const event = (db: DatabaseSync, id: string, kind: string, subject: string, at: number) =>
  db.prepare("INSERT INTO progress_events (user_id, course, kind, subject, created_at) VALUES (?, 'tochka-sborki', ?, ?, ?)").run(id, kind, subject, at)

/** Все гейты и несколько шагов разом. */
function seed(db: DatabaseSync) {
  addUser(db, uid('start'))                                               // start-1
  addUser(db, uid('start2'), { language: 'en', created_at: NOW - 6 * D })  // start-2 (en)
  addUser(db, uid('lapse'), { created_at: NOW - 30 * D })                  // lapse-1
  view(db, uid('lapse'), '01-introduction/u2', NOW - 4 * D)
  addUser(db, uid('mile'), { created_at: NOW - 30 * D })                   // milestone
  event(db, uid('mile'), 'module', '00-kickstart', NOW - D)
  view(db, uid('mile'), '01-introduction/u1', NOW - D)
  addUser(db, uid('optout'), { email_optout: 1 })
  addUser(db, uid('thrott'), { last_email_at: NOW - H })
  addUser(db, uid('tg'), { telegram_id: '500', created_at: NOW - 30 * D })
  view(db, uid('tg'), '01-introduction/u2', NOW - 4 * D)
  addUser(db, uid('quiet'), { created_at: NOW - 30 * D })
  view(db, uid('quiet'), '01-introduction/u2', NOW - H)
  addUser(db, uid('early'), { created_at: NOW - D })                        // окна start ещё не открылись
  addUser(db, uid('done'), { created_at: NOW - 3 * D })                     // start-1 уже ушёл
  sent(db, uid('done'), 'start-1', NOW - D)
}

const ALL_STEPS: Step[] = ['start-1', 'start-2', 'lapse-1', 'lapse-2', 'lapse-3', 'milestone', 'finish-1', 'finish-2', 'update']
const TEMPLATES = ALL_STEPS.flatMap((s, n) => (['ru', 'en'] as const).map((l, k) => ({ id: 100 + 2 * n + k, name: `ts-${s}-${l}`, type: 'tx' })))
function listmonkFetch() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any) => {
    const url = String(input)
    if (url.includes('/api/templates')) return new Response(JSON.stringify({ data: TEMPLATES }), { status: 200 })
    if (url.includes('/api/subscribers?')) return new Response(JSON.stringify({ data: { results: [{ status: 'enabled' }] } }), { status: 200 })
    if (url.endsWith('/api/tx')) return new Response('{"data":true}', { status: 200 })
    return new Response('nope', { status: 404 })
  })
}

function env(d1: D1Database, over: Partial<Env> = {}): Env {
  return {
    DB: d1,
    WORKER_JWT_SECRET: SECRET,
    OWNER_EMAIL: OWNER,
    EMAIL_CHAINS_ENABLED: '1',
    LISTMONK_URL: 'https://listmonk.test',
    LISTMONK_API_USER: 'api',
    LISTMONK_API_TOKEN: 'tok',
    CF_ACCESS_CLIENT_ID: 'cf-id',
    CF_ACCESS_CLIENT_SECRET: 'cf-secret',
    LISTMONK_CRM_LIST_ID: '7',
    ...over,
  } as Env
}

function snapshot(db: DatabaseSync) {
  return {
    users: db.prepare('SELECT * FROM users ORDER BY id').all(),
    sends: db.prepare('SELECT * FROM email_sends ORDER BY user_id, step_key').all(),
    counts: ['users', 'email_sends', 'progress', 'progress_events']
      .map(t => (db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get() as any).c),
  }
}

afterEach(() => vi.restoreAllMocks())

describe('dryRunEmailChains', () => {
  it('counts steps and skip reasons by the same gates, without writing to D1 or calling fetch', async () => {
    const { db, d1 } = sqliteD1()
    seed(db)
    const before = snapshot(db)
    const spy = vi.spyOn(globalThis, 'fetch')

    const r = await dryRunEmailChains(env(d1), NOW)

    expect(spy).not.toHaveBeenCalled()
    expect(snapshot(db)).toEqual(before)
    expect(r.at).toBe(NOW)
    expect(r.enabled).toBe(true)
    expect(r.byStep).toEqual({ 'start-1': 1, 'start-2': 1, 'lapse-1': 1, milestone: 1 })
    expect(r.skipped).toEqual({ optout: 1, throttle: 1, telegram: 1, quiet: 1, 'out-of-window': 1, 'no-step': 1 })
    expect(r.candidates).toBe(10)
    expect(r.items.find(i => i.step === 'start-2')).toEqual(
      { user: uid('start2').slice(0, 8), course: 'tochka-sborki', step: 'start-2', stepKey: 'start-2', locale: 'en' })
    expect(r.items.find(i => i.step === 'milestone')?.stepKey).toBe('milestone@00-kickstart')
  })

  it('never exposes email or the full user id', async () => {
    const { db, d1 } = sqliteD1()
    seed(db)
    const text = JSON.stringify(await dryRunEmailChains(env(d1), NOW))
    expect(text).not.toContain('x.test')
    expect(text).not.toContain('0123456789abcdef')
    for (const i of (JSON.parse(text).items as { user: string }[])) expect(i.user).toHaveLength(8)
  })

  it('picks exactly what the cron would send on the same data', async () => {
    const a = sqliteD1(), b = sqliteD1()
    seed(a.db); seed(b.db)
    const dry = await dryRunEmailChains(env(a.d1), NOW)

    listmonkFetch()
    const run = await runEmailChains(env(b.d1), NOW)
    expect(run.sent).toBe(dry.items.length)
    const cronPicks = (b.db.prepare('SELECT user_id, step_key FROM email_sends WHERE sent_at = ?').all(NOW) as any[])
      .map(r => `${r.user_id.slice(0, 8)} ${r.step_key}`).sort()
    expect(cronPicks).toEqual(dry.items.map(i => `${i.user} ${i.stepKey}`).sort())
  })

  it('reports enabled=false but still previews when the cron flag is off', async () => {
    const { db, d1 } = sqliteD1()
    seed(db)
    const r = await dryRunEmailChains(env(d1, { EMAIL_CHAINS_ENABLED: '0' }), NOW)
    expect(r.enabled).toBe(false)
    expect(r.items.length).toBe(4)
  })

  it('a second course treats an already-picked learner as throttled, like the cron does', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, uid('start'))
    const r = await dryRunEmailChains(env(d1), NOW, [TOCHKA_SBORKI, { ...TOCHKA_SBORKI, key: 'second' }])
    expect(r.byStep).toEqual({ 'start-1': 1 })
    expect(r.skipped).toEqual({ throttle: 1 })
  })
})

describe('GET /api/admin/email-chains/dry-run', () => {
  const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext
  const req = (qs = '', cookie?: string) => new Request(`https://ai.synergify.com/api/admin/email-chains/dry-run${qs}`,
    { headers: cookie ? { Cookie: cookie } : {} })
  const session = async (email: string) =>
    `session=${await signJWT({ sub: 'x', email, iat: NOW, exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET)}`

  it('requires the owner, like /api/admin/stats', async () => {
    const { d1 } = sqliteD1()
    expect((await worker.fetch(req(), env(d1), ctx)).status).toBe(401)
    expect((await worker.fetch(req('', await session('someone@x.test')), env(d1), ctx)).status).toBe(403)
    const ok = await worker.fetch(req('', await session(OWNER)), env(d1), ctx)
    expect(ok.status).toBe(200)
    expect(await ok.json()).toMatchObject({ candidates: 0, byStep: {}, skipped: {}, items: [] })
  })

  it('at shifts the windows: unix seconds and ISO date', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, uid('early'), { created_at: NOW - D })
    const at = async (qs: string) => (await (await handleEmailChainDryRun(env(d1), new URL(`https://x/?${qs}`), NOW)).json()) as any

    expect((await at('')).skipped).toEqual({ 'out-of-window': 1 })
    const later = await at(`at=${NOW + D + H}`)
    expect(later.at).toBe(NOW + D + H)
    expect(later.byStep).toEqual({ 'start-1': 1 })
    const iso = new Date((NOW + D + H) * 1000).toISOString()
    expect((await at(`at=${encodeURIComponent(iso)}`)).byStep).toEqual({ 'start-1': 1 })
  })

  it('rejects an unparseable at', async () => {
    const { d1 } = sqliteD1()
    const res = await handleEmailChainDryRun(env(d1), new URL('https://x/?at=yesterday-ish'), NOW)
    expect(res.status).toBe(400)
    expect(parseAt(null, NOW)).toBe(NOW)
    expect(parseAt('1700000000', NOW)).toBe(1_700_000_000)
    expect(parseAt('2026-09-28T00:00:00Z', NOW)).toBe(Math.floor(Date.parse('2026-09-28T00:00:00Z') / 1000))
  })
})
