// Слой сообщества: приглашение ботом приходит в нужный момент (первый урок курса / новый допуск в академию)
// и только раз — проверка через настоящие обработчики на SQLite со схемой всех миграций.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { handleComplete } from './progress'
import { handleAdmission } from './academy'
import { COURSE_CATALOG } from '../lib/course-catalog'
import { signJWT } from '../lib/jwt'
import type { Env } from '../lib/types'

const SECRET = 'test-secret-32-characters-minimum!!'
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
  db.prepare("INSERT INTO users (id, email, created_at, language, telegram_id) VALUES ('user1', 'a@b.com', 1, 'ru', '555')").run()
  return { db, d1 }
}

async function authed(url: string, body?: unknown): Promise<Request> {
  const now = Math.floor(Date.now() / 1000)
  const jwt = await signJWT({ sub: 'user1', email: 'a@b.com', iat: now, exp: now + 3600 }, SECRET)
  return new Request(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json', Cookie: `session=${jwt}` },
  })
}

const env = (d1: D1Database, flag: string) => ({ DB: d1, WORKER_JWT_SECRET: SECRET, TELEGRAM_BOT_TOKEN: 'BOT', COMMUNITY_INVITES_ENABLED: flag }) as Env
const tgCalls = (spy: ReturnType<typeof vi.spyOn>) => spy.mock.calls.filter(c => String(c[0]).includes('api.telegram.org'))

afterEach(() => vi.restoreAllMocks())

describe('community invite hooks', () => {
  it('handleComplete: first lesson of the course → exactly one invite across completions', async () => {
    const { d1 } = sqliteD1()
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    for (const slug of ['01-living-practice/u1', '01-living-practice/u2', '01-living-practice/u2']) {
      const res = await handleComplete(await authed('https://academy.synergify.com/api/progress/complete', { lesson_slug: slug, course: 'living-practice' }), env(d1, '1'))
      expect(res.status).toBe(200)
    }
    const calls = tgCalls(spy)
    expect(calls).toHaveLength(1)
    expect(JSON.parse((calls[0][1] as RequestInit).body as string).reply_markup.inline_keyboard[0][0].url).toBe('https://t.me/kundaliniRUs/7823')
  })

  it('handleComplete with the flag off → no Telegram, no invite row', async () => {
    const { db, d1 } = sqliteD1()
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await handleComplete(await authed('https://academy.synergify.com/api/progress/complete', { lesson_slug: '01-living-practice/u1', course: 'living-practice' }), env(d1, '0'))
    expect(tgCalls(spy)).toHaveLength(0)
    expect(db.prepare('SELECT COUNT(*) AS n FROM community_invites').get()).toEqual({ n: 0 })
  })

  it('handleAdmission: new grant → academy chat invite; repeat call → nothing more', async () => {
    const { db, d1 } = sqliteD1()
    for (const m of COURSE_CATALOG) {
      db.prepare("INSERT INTO progress (user_id, lesson_slug, viewed_at, completed_at, course) VALUES ('user1', ?, 1, 1, 'tochka-sborki')").run(m.slug)
    }
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    expect((await handleAdmission(await authed('https://ai.synergify.com/api/academy/admission'), env(d1, '1'))).status).toBe(200)
    expect((await handleAdmission(await authed('https://ai.synergify.com/api/academy/admission'), env(d1, '1'))).status).toBe(200)
    const calls = tgCalls(spy)
    expect(calls).toHaveLength(1)
    expect(JSON.parse((calls[0][1] as RequestInit).body as string).reply_markup.inline_keyboard[0][0].url).toBe('https://t.me/kundaliniRUs')
  })
})
