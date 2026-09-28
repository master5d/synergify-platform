import { describe, it, expect, vi, afterEach } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { runEmailChains, MAX_SENDS_PER_RUN } from './email-chain-cron'
import { signUnsubscribe } from '../lib/email-unsubscribe'
import type { Env } from '../lib/types'

const SECRET = 'test-secret-32-characters-minimum!!'
const NOW = 2_000_000_000
const H = 3600
const D = 24 * H

// D1 на настоящем SQLite: схема = все миграции по порядку (как stats.test.ts), meta.changes — как у D1.
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

function addUser(db: DatabaseSync, id: string, over: { created_at?: number; language?: string; telegram_id?: string | null; last_email_at?: number | null; email_optout?: number } = {}) {
  db.prepare('INSERT INTO users (id, email, created_at, language, telegram_id, last_email_at, email_optout) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, `${id}@x.test`, over.created_at ?? NOW - 2 * D - H, over.language ?? 'ru', over.telegram_id ?? null, over.last_email_at ?? null, over.email_optout ?? 0)
}

const TEMPLATES = [
  { id: 11, name: 'ts-start-1-ru', type: 'tx' },
  { id: 12, name: 'ts-milestone-ru', type: 'tx' },
  { id: 13, name: 'ts-finish-1-ru', type: 'tx' },
  { id: 99, name: 'ts-start-1-en', type: 'campaign' },   // не tx — не считается
]

type Sub = { status: string } | null
function listmonkFetch(opts: { sub?: Sub; txStatus?: number; templatesStatus?: number } = {}) {
  const sub = opts.sub === undefined ? { status: 'enabled' } : opts.sub
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any, init?: any) => {
    const url = String(input)
    if (url.includes('/api/templates')) {
      return new Response(JSON.stringify({ data: TEMPLATES }), { status: opts.templatesStatus ?? 200 })
    }
    if (url.includes('/api/subscribers?')) {
      return new Response(JSON.stringify({ data: { results: sub ? [sub] : [] } }), { status: 200 })
    }
    if (url.endsWith('/api/subscribers') && init?.method === 'POST') return new Response('{}', { status: 200 })
    if (url.endsWith('/api/tx')) return new Response('{"data":true}', { status: opts.txStatus ?? 200 })
    return new Response('nope', { status: 404 })
  })
}

function env(d1: D1Database, over: Partial<Env> = {}): Env {
  return {
    DB: d1,
    WORKER_JWT_SECRET: SECRET,
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

const txCalls = (spy: ReturnType<typeof listmonkFetch>) => spy.mock.calls.filter(c => String(c[0]).endsWith('/api/tx'))
const sends = (db: DatabaseSync) => db.prepare('SELECT user_id, course, step_key, sent_at FROM email_sends ORDER BY step_key').all()

afterEach(() => vi.restoreAllMocks())

describe('runEmailChains', () => {
  it('flag off → logs and exits without touching D1 or Listmonk', async () => {
    const spy = listmonkFetch()
    const prepare = vi.fn()
    const res = await runEmailChains(env({ prepare } as unknown as D1Database, { EMAIL_CHAINS_ENABLED: '0' }), NOW)
    expect(res).toEqual({ sent: 0, failed: 0, skipped: 'disabled' })
    expect(spy).not.toHaveBeenCalled()
    expect(prepare).not.toHaveBeenCalled()
  })

  it('sends start-1 via tx API with template id, data, unsubscribe headers; captures the step and stamps last_email_at', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1')
    const spy = listmonkFetch()
    const res = await runEmailChains(env(d1), NOW)
    expect(res).toEqual({ sent: 1, failed: 0, skipped: null })

    expect(spy.mock.calls.filter(c => String(c[0]).includes('/api/templates'))).toHaveLength(1)
    const [[url, init]] = txCalls(spy)
    expect(url).toBe('https://listmonk.test/api/tx')
    expect((init as any).headers.Authorization).toBe('token api:tok')
    const body = JSON.parse((init as any).body)
    const unsub = `https://ai.synergify.com/api/email/unsubscribe?u=u1&s=${await signUnsubscribe('u1', SECRET)}`
    expect(body).toEqual({
      subscriber_email: 'u1@x.test',
      template_id: 11,
      content_type: 'html',
      headers: [{ 'List-Unsubscribe': `<${unsub}>` }, { 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }],
      data: {
        course_name: 'Точка Сборки',
        home_url: 'https://ai.synergify.com/',
        start_url: 'https://ai.synergify.com/lessons/00-kickstart/u1-map/',
        unsubscribe_url: unsub,
      },
    })
    expect(sends(db)).toEqual([{ user_id: 'u1', course: 'tochka-sborki', step_key: 'start-1', sent_at: NOW }])
    expect(db.prepare('SELECT last_email_at FROM users WHERE id = ?').get('u1')).toEqual({ last_email_at: NOW })

    // Второй прогон в тот же день ничего не шлёт (лимит 20 ч + захват).
    expect((await runEmailChains(env(d1), NOW + H)).sent).toBe(0)
  })

  it('tx failure → capture rolled back, last_email_at untouched, counted as failed', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1')
    listmonkFetch({ txStatus: 500 })
    expect(await runEmailChains(env(d1), NOW)).toEqual({ sent: 0, failed: 1, skipped: null })
    expect(sends(db)).toEqual([])
    expect(db.prepare('SELECT last_email_at FROM users WHERE id = ?').get('u1')).toEqual({ last_email_at: null })
  })

  it('milestone collapse: marks the other pending events too, and rolls them all back on failure', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1', { created_at: NOW - 30 * D })
    const ev = db.prepare("INSERT INTO progress_events (user_id, course, kind, subject, created_at) VALUES ('u1', 'tochka-sborki', 'module', ?, ?)")
    ev.run('00-kickstart', NOW - 2 * D)
    ev.run('01-introduction', NOW - H)
    db.prepare("INSERT INTO progress (user_id, lesson_slug, viewed_at, completed_at, course) VALUES ('u1', '01-introduction/u9', ?, ?, 'tochka-sborki')").run(NOW - H, NOW - H)

    listmonkFetch({ txStatus: 502 })
    await runEmailChains(env(d1), NOW)
    expect(sends(db)).toEqual([])

    vi.restoreAllMocks()
    const spy = listmonkFetch()
    expect((await runEmailChains(env(d1), NOW)).sent).toBe(1)
    expect(JSON.parse((txCalls(spy)[0][1] as any).body).template_id).toBe(12)
    expect(sends(db).map((r: any) => r.step_key)).toEqual(['milestone@00-kickstart', 'milestone@01-introduction'])
  })

  it('blocklisted subscriber → no send, no capture, user opted out', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1')
    const spy = listmonkFetch({ sub: { status: 'blocklisted' } })
    expect((await runEmailChains(env(d1), NOW)).sent).toBe(0)
    expect(txCalls(spy)).toHaveLength(0)
    expect(sends(db)).toEqual([])
    expect(db.prepare('SELECT email_optout FROM users WHERE id = ?').get('u1')).toEqual({ email_optout: 1 })
  })

  it('subscriber missing in Listmonk → created in the CRM list with language, then sent', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1')
    const spy = listmonkFetch({ sub: null })
    expect((await runEmailChains(env(d1), NOW)).sent).toBe(1)
    const create = spy.mock.calls.find(c => String(c[0]).endsWith('/api/subscribers') && (c[1] as any)?.method === 'POST')!
    expect(JSON.parse((create[1] as any).body)).toMatchObject({ email: 'u1@x.test', lists: [7], attribs: { language: 'ru', source: 'email-chains' } })
  })

  it('template missing in Listmonk → no send and no capture', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1', { language: 'en' })  // ts-start-1-en есть только как campaign-шаблон
    const spy = listmonkFetch()
    expect((await runEmailChains(env(d1), NOW)).sent).toBe(0)
    expect(txCalls(spy)).toHaveLength(0)
    expect(spy.mock.calls.filter(c => String(c[0]).includes('/api/subscribers'))).toHaveLength(0)
    expect(sends(db)).toEqual([])
  })

  it('templates endpoint down → whole run skipped', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1')
    listmonkFetch({ templatesStatus: 503 })
    expect(await runEmailChains(env(d1), NOW)).toEqual({ sent: 0, failed: 0, skipped: 'templates-unavailable' })
  })

  it('SQL gates: opted-out, recently emailed and Telegram-linked learners get no reminders', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'optout', { email_optout: 1 })
    addUser(db, 'recent', { last_email_at: NOW - 5 * H })
    addUser(db, 'tg', { telegram_id: '500' })
    addUser(db, 'old', { created_at: NOW - 90 * D })
    const spy = listmonkFetch()
    expect((await runEmailChains(env(d1), NOW)).sent).toBe(0)
    expect(txCalls(spy)).toHaveLength(0)
  })

  it(`stops at MAX_SENDS_PER_RUN (${MAX_SENDS_PER_RUN})`, async () => {
    const { db, d1 } = sqliteD1()
    for (let n = 0; n < MAX_SENDS_PER_RUN + 3; n++) addUser(db, `u${n}`)
    listmonkFetch()
    expect((await runEmailChains(env(d1), NOW)).sent).toBe(MAX_SENDS_PER_RUN)
    expect(sends(db)).toHaveLength(MAX_SENDS_PER_RUN)
  })
})
