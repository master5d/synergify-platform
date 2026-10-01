import { describe, it, expect, vi } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import {
  INTERVAL_DAYS, scheduleNext, dueToday, loadDue, parseAnswer, storeAnswer, loadSpacedReviewStats,
  spacedReviewEnabled, reviewEmailData, type ReviewRow,
} from './check-reviews'
import * as web from '../../../LMS/tochka-sborki/web/lib/spaced-review'
import { handleCheckAnswer } from '../handlers/check-reviews'
import { getStats } from '../handlers/stats'
import { signJWT } from './jwt'
import type { Env } from './types'

const NOW = 2_000_000_000
const DAY = 86_400
const SECRET = 'test-secret-32-characters-minimum!!'

// D1 на настоящем SQLite: схема = все миграции по порядку (как community.test.ts).
const MIGRATIONS = fileURLToPath(new URL('../../migrations/', import.meta.url))
function sqliteD1(opts: { skip?: string } = {}) {
  const db = new DatabaseSync(':memory:')
  for (const f of readdirSync(MIGRATIONS).filter(f => f.endsWith('.sql') && f !== opts.skip).sort()) db.exec(readFileSync(MIGRATIONS + f, 'utf8'))
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
  db.prepare('INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)').run('u1', 'u1@x.test', NOW - 30 * DAY)
  db.prepare('INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)').run('u2', 'u2@x.test', NOW - 30 * DAY)
  return { db, d1 }
}

describe('scheduleNext — тот же Лейтнер, что в web/lib/spaced-review.ts', () => {
  it('те же интервалы', () => {
    expect([...INTERVAL_DAYS]).toEqual([...web.INTERVAL_DAYS])
  })
  it('те же переходы на таблице случаев (секунды против миллисекунд)', () => {
    const cases: [{ box: number; dueOffsetDays: number } | null, boolean, number][] = [
      [null, true, 0], [null, false, 0],
      [{ box: 0, dueOffsetDays: 0 }, true, 0], [{ box: 1, dueOffsetDays: -2 }, true, 0], [{ box: 3, dueOffsetDays: 0 }, true, 0],
      [{ box: 2, dueOffsetDays: 4 }, true, 0], [{ box: 2, dueOffsetDays: 4 }, false, 0], [{ box: 3, dueOffsetDays: -1 }, false, 0],
    ]
    for (const [prev, correct] of cases) {
      const s = scheduleNext(prev && { box: prev.box, due_at: NOW + prev.dueOffsetDays * DAY }, correct, NOW)
      const w = web.scheduleNext(prev && { box: prev.box, due: (NOW + prev.dueOffsetDays * DAY) * 1000 }, correct, NOW * 1000)
      expect(s).toEqual({ box: w.box, due_at: w.due / 1000 })
    }
  })
})

describe('dueToday — «что повторить сегодня» для письма', () => {
  const row = (check_id: string, due_at: number, box = 0): ReviewRow => ({ module: 'm1', unit: 'u1', check_id, box, due_at })
  it('только подошедшие, самые просроченные первыми, при равенстве — нижняя коробка, лимит 2', () => {
    const rows = [row('a', NOW - DAY, 2), row('b', NOW + DAY), row('c', NOW - 3 * DAY), row('d', NOW - DAY, 0)]
    expect(dueToday(rows, NOW).map(r => r.check_id)).toEqual(['c', 'd'])
    expect(dueToday(rows, NOW, 5).map(r => r.check_id)).toEqual(['c', 'd', 'a'])
  })
  it('пусто — пусто, и письма нет', () => {
    expect(dueToday([], NOW)).toEqual([])
    expect(dueToday([row('b', NOW + DAY)], NOW)).toEqual([])
    expect(reviewEmailData([], 'https://x')).toBeNull()
    expect(reviewEmailData([row('a', NOW)], 'https://x')).toEqual({ review_count: 1, review_url: 'https://x' })
  })
})

describe('parseAnswer', () => {
  const ok = { course: 'tochka-sborki', module: '01-introduction', unit: 'u2-four-shifts', check_id: 'c1', correct: true }
  it('годное тело; source по умолчанию lesson', () => {
    expect(parseAnswer(ok)).toEqual({ ...ok, source: 'lesson' })
    expect(parseAnswer({ ...ok, source: 'review' })?.source).toBe('review')
    expect(parseAnswer({ ...ok, source: 'hack' })?.source).toBe('lesson')
  })
  it('негодное — null', () => {
    for (const b of [null, 'x', {}, { ...ok, correct: 'yes' }, { ...ok, module: '../etc' }, { ...ok, check_id: '' }, { ...ok, course: 'a b' }]) {
      expect(parseAnswer(b)).toBeNull()
    }
  })
})

describe('миграция 0022 + storeAnswer / loadDue / статистика', () => {
  const a = (over: Partial<Parameters<typeof storeAnswer>[2]> = {}) =>
    ({ course: 'tochka-sborki', module: 'm1', unit: 'u1', check_id: 'c1', correct: true, source: 'lesson' as const, ...over })

  it('без 0022 таблицы нет (additive: остальная схема цела)', () => {
    const { db } = sqliteD1({ skip: '0022_check_reviews.sql' })
    expect(() => db.prepare('SELECT 1 FROM check_reviews').all()).toThrow()
  })

  it('первый ответ — коробка 0; повтор в срок — выше; неверный — в начало; answers копятся', async () => {
    const { db, d1 } = sqliteD1()
    expect(await storeAnswer(d1, 'u1', a(), NOW)).toEqual({ box: 0, due_at: NOW + DAY })
    expect(await storeAnswer(d1, 'u1', a({ source: 'review' }), NOW + DAY)).toEqual({ box: 1, due_at: NOW + 4 * DAY })
    expect(await storeAnswer(d1, 'u1', a({ correct: false }), NOW + 2 * DAY)).toEqual({ box: 0, due_at: NOW + 3 * DAY })
    const r = db.prepare('SELECT box, answers, last_correct, reviewed_at FROM check_reviews').get() as any
    expect(r).toEqual({ box: 0, answers: 3, last_correct: 0, reviewed_at: NOW + DAY })   // reviewed_at не стёрт ответом из урока
  })

  it('loadDue — по ученику и курсу, только подошедшие', async () => {
    const { d1 } = sqliteD1()
    await storeAnswer(d1, 'u1', a({ check_id: 'c1' }), NOW - 5 * DAY)
    await storeAnswer(d1, 'u1', a({ check_id: 'c2' }), NOW)
    await storeAnswer(d1, 'u1', a({ check_id: 'c3', course: 'living-practice' }), NOW - 5 * DAY)
    await storeAnswer(d1, 'u2', a({ check_id: 'c4' }), NOW - 5 * DAY)
    expect((await loadDue(d1, 'u1', 'tochka-sborki', NOW)).map(r => r.check_id)).toEqual(['c1'])
  })

  it('стоп-критерий: из учеников с наступившим сроком — сколько ответили на повтор', async () => {
    const { d1 } = sqliteD1()
    await storeAnswer(d1, 'u1', a(), NOW - 5 * DAY)
    await storeAnswer(d1, 'u1', a({ source: 'review' }), NOW - 3 * DAY)
    await storeAnswer(d1, 'u2', a(), NOW - 5 * DAY)
    expect(await loadSpacedReviewStats(d1, NOW)).toEqual([{ course: 'tochka-sborki', eligible: 2, answered: 1 }])
  })

  it('getStats: флаг выключен — к check_reviews не ходит (таблицы в prod нет); включён — отдаёт долю', async () => {
    const { d1 } = sqliteD1({ skip: '0022_check_reviews.sql' })
    const off = await (await getStats(d1, NOW)).json() as any
    expect(off.spacedReview).toBeUndefined()
    const { d1: on } = sqliteD1()
    await storeAnswer(on, 'u1', a({ source: 'review' }), NOW)
    expect((await (await getStats(on, NOW, { spacedReview: true })).json() as any).spacedReview)
      .toEqual([{ course: 'tochka-sborki', eligible: 1, answered: 1 }])
  })
})

describe('POST /api/checks/answer', () => {
  async function req(body: unknown, auth = true) {
    const now = Math.floor(Date.now() / 1000)
    const jwt = await signJWT({ sub: 'u1', email: 'u1@x.test', iat: now, exp: now + 3600 }, SECRET)
    return new Request('https://ai.synergify.com/api/checks/answer', {
      method: 'POST', body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...(auth ? { Cookie: `session=${jwt}` } : {}) },
    })
  }
  const body = { course: 'tochka-sborki', module: 'm1', unit: 'u1', check_id: 'c1', correct: true, source: 'review' }

  it('флаг: по умолчанию выключен', () => {
    expect(spacedReviewEnabled({})).toBe(false)
    expect(spacedReviewEnabled({ SPACED_REVIEW_ENABLED: '0' })).toBe(false)
    expect(spacedReviewEnabled({ SPACED_REVIEW_ENABLED: '1' })).toBe(true)
  })

  it('wrangler.toml держит флаг включённым (миграция 0022 применена 2026-09-29)', () => {
    const toml = readFileSync(fileURLToPath(new URL('../../wrangler.toml', import.meta.url)), 'utf8')
    expect(toml).toMatch(/^SPACED_REVIEW_ENABLED = "1"/m)
  })

  it('флаг выключен — { enabled:false }, ни сессии, ни D1', async () => {
    const prepare = vi.fn()
    const res = await handleCheckAnswer(await req(body, false), { DB: { prepare }, WORKER_JWT_SECRET: SECRET } as unknown as Env, NOW)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ enabled: false })
    expect(prepare).not.toHaveBeenCalled()
  })

  it('флаг включён: без входа 401, битое тело 400, годное — пишет строку', async () => {
    const { db, d1 } = sqliteD1()
    const env = { DB: d1, WORKER_JWT_SECRET: SECRET, SPACED_REVIEW_ENABLED: '1' } as unknown as Env
    expect((await handleCheckAnswer(await req(body, false), env, NOW)).status).toBe(401)
    expect((await handleCheckAnswer(await req({ ...body, correct: 'y' }), env, NOW)).status).toBe(400)
    const res = await handleCheckAnswer(await req(body), env, NOW)
    expect(await res.json()).toEqual({ enabled: true, box: 0, due_at: NOW + DAY })
    expect(db.prepare('SELECT user_id, module, check_id, reviewed_at FROM check_reviews').get())
      .toEqual({ user_id: 'u1', module: 'm1', check_id: 'c1', reviewed_at: NOW })
  })
})
