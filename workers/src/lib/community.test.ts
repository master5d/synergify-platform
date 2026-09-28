import { describe, it, expect, vi, afterEach } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { maybeInviteToCommunity, mayInvite, inviteText, communityLinks, COMMUNITY_INVITES, ACADEMY_PLACE } from './community'
import { botCopy } from './bot-copy'
import { COMMUNITY as TS_PACK } from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/course/community'
import { COMMUNITY as LP_PACK } from '../../../LMS/tochka-sborki/web/packs/living-practice/course/community'
import type { Env } from './types'

const NOW = 2_000_000_000

// D1 на настоящем SQLite: схема = все миграции по порядку (как email-chain-cron.test.ts).
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
  return { db, d1 }
}

function addUser(db: DatabaseSync, id: string, over: { language?: string; telegram_id?: string | null; nudge_optout?: number } = {}) {
  db.prepare('INSERT INTO users (id, email, created_at, language, telegram_id, nudge_optout) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, `${id}@x.test`, NOW - 86400, over.language ?? 'ru', over.telegram_id === undefined ? '555' : over.telegram_id, over.nudge_optout ?? 0)
}
function complete(db: DatabaseSync, id: string, course: string, slug = '00-kickstart/u1') {
  db.prepare('INSERT INTO progress (user_id, lesson_slug, viewed_at, completed_at, course) VALUES (?, ?, ?, ?, ?)').run(id, slug, NOW, NOW, course)
}
const invites = (db: DatabaseSync) => db.prepare('SELECT user_id, place, trigger FROM community_invites ORDER BY place').all()

function env(d1: D1Database, over: Partial<Env> = {}): Env {
  return { DB: d1, TELEGRAM_BOT_TOKEN: 'BOT', COMMUNITY_INVITES_ENABLED: '1', ...over } as Env
}
function tg(status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status }))
}
const body = (spy: ReturnType<typeof tg>, i = 0) => JSON.parse((spy.mock.calls[i][1] as RequestInit).body as string)

afterEach(() => vi.restoreAllMocks())

const LP = 'living-practice'

describe('maybeInviteToCommunity', () => {
  it('flag off → no DB, no Telegram', async () => {
    const spy = tg()
    const prepare = vi.fn()
    const res = await maybeInviteToCommunity(env({ prepare } as unknown as D1Database, { COMMUNITY_INVITES_ENABLED: '0' }),
      { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW })
    expect(res).toEqual({ sent: false, reason: 'disabled' })
    expect(prepare).not.toHaveBeenCalled()
    expect(spy).not.toHaveBeenCalled()
  })

  it('flag unset behaves as off', async () => {
    const spy = tg()
    const res = await maybeInviteToCommunity(env({} as D1Database, { COMMUNITY_INVITES_ENABLED: undefined }),
      { userId: 'u1', place: LP, trigger: 'first-lesson' })
    expect(res.reason).toBe('disabled')
    expect(spy).not.toHaveBeenCalled()
  })

  it('empty place config (Точка Сборки before the owner gives the group) → silent', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1'); complete(db, 'u1', 'tochka-sborki')
    const spy = tg()
    const res = await maybeInviteToCommunity(env(d1), { userId: 'u1', place: 'tochka-sborki', trigger: 'first-lesson', nowSec: NOW })
    expect(res.reason).toBe('no-place')
    expect(spy).not.toHaveBeenCalled()
    expect(invites(db)).toEqual([])
  })

  it('after the first completed lesson: one invite with url + opt-out buttons, recorded', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1'); complete(db, 'u1', LP)
    const spy = tg()
    const res = await maybeInviteToCommunity(env(d1), { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW })
    expect(res).toEqual({ sent: true, reason: 'sent' })
    const b = body(spy)
    expect(b.chat_id).toBe(555)
    expect(b.text).toContain(botCopy('ru').communityInviteLesson)
    expect(b.reply_markup.inline_keyboard[0][0]).toEqual({ text: botCopy('ru').communityButton, url: 'https://t.me/kundaliniRUs/7823' })
    expect(b.reply_markup.inline_keyboard[1][0]).toEqual({ text: botCopy('ru').communityOffButton, callback_data: 'community_off' })
    expect(invites(db)).toEqual([{ user_id: 'u1', place: LP, trigger: 'first-lesson' }])
  })

  it('only once: the next completion does not invite again', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1'); complete(db, 'u1', LP)
    const spy = tg()
    await maybeInviteToCommunity(env(d1), { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW })
    complete(db, 'u1', LP, '01-living-practice/u2')
    const again = await maybeInviteToCommunity(env(d1), { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW + 60 })
    expect(again).toEqual({ sent: false, reason: 'already' })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('no completed lesson in THIS course → no invite (a lesson of another course does not count)', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1'); complete(db, 'u1', 'tochka-sborki')
    const spy = tg()
    const res = await maybeInviteToCommunity(env(d1), { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW })
    expect(res.reason).toBe('no-lesson')
    expect(spy).not.toHaveBeenCalled()
  })

  it('EN learner gets the EN text', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1', { language: 'en' }); complete(db, 'u1', LP)
    const spy = tg()
    await maybeInviteToCommunity(env(d1), { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW })
    expect(body(spy).text).toContain(botCopy('en').communityInviteLesson)
    expect(body(spy).reply_markup.inline_keyboard[0][0].text).toBe(botCopy('en').communityButton)
  })

  it('respects /stop (nudge_optout) and «Не присылать такое» (community_optout); no claim is taken', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'stop', { nudge_optout: 1 }); complete(db, 'stop', LP)
    addUser(db, 'off', { telegram_id: '777' }); complete(db, 'off', LP)
    db.prepare('UPDATE users SET community_optout = 1 WHERE id = ?').run('off')
    const spy = tg()
    for (const userId of ['stop', 'off']) {
      const res = await maybeInviteToCommunity(env(d1), { userId, place: LP, trigger: 'first-lesson', nowSec: NOW })
      expect(res.reason).toBe('not-eligible')
    }
    expect(spy).not.toHaveBeenCalled()
    expect(invites(db)).toEqual([])
  })

  it('no linked Telegram → nothing', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1', { telegram_id: null }); complete(db, 'u1', LP)
    const spy = tg()
    expect((await maybeInviteToCommunity(env(d1), { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW })).reason).toBe('not-eligible')
    expect(spy).not.toHaveBeenCalled()
  })

  it('Telegram rejects the message → claim is rolled back, next trigger retries', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1'); complete(db, 'u1', LP)
    tg(403)
    const res = await maybeInviteToCommunity(env(d1), { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW })
    expect(res).toEqual({ sent: false, reason: 'send-failed' })
    expect(invites(db)).toEqual([])
    vi.restoreAllMocks()
    tg(200)
    expect((await maybeInviteToCommunity(env(d1), { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW + 60 })).sent).toBe(true)
  })

  it('admission → academy chat invite, independent of the course invite', async () => {
    const { db, d1 } = sqliteD1()
    addUser(db, 'u1'); complete(db, 'u1', LP)
    const spy = tg()
    await maybeInviteToCommunity(env(d1), { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW })
    const res = await maybeInviteToCommunity(env(d1), { userId: 'u1', place: ACADEMY_PLACE, trigger: 'admission', nowSec: NOW })
    expect(res.sent).toBe(true)
    expect(body(spy, 1).text).toContain(botCopy('ru').communityInviteAdmission)
    expect(body(spy, 1).reply_markup.inline_keyboard[0][0].url).toBe('https://t.me/kundaliniRUs')
    expect(invites(db)).toEqual([
      { user_id: 'u1', place: ACADEMY_PLACE, trigger: 'admission' },
      { user_id: 'u1', place: LP, trigger: 'first-lesson' },
    ])
  })

  it('flag on but migration 0021 not applied → loud error, no throw, no message', async () => {
    const { db, d1 } = sqliteD1({ skip: '0021_community_invites.sql' })
    addUser(db, 'u1'); complete(db, 'u1', LP)
    const spy = tg()
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await maybeInviteToCommunity(env(d1), { userId: 'u1', place: LP, trigger: 'first-lesson', nowSec: NOW })
    expect(res).toEqual({ sent: false, reason: 'error' })
    expect(String(err.mock.calls[0][0])).toMatch(/migration 0021/)
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('policy and copy', () => {
  it('mayInvite guard chain', () => {
    const ok = { telegram_id: '1', language: 'ru', nudge_optout: 0, community_optout: 0 }
    expect(mayInvite(ok)).toBe(true)
    expect(mayInvite(null)).toBe(false)
    expect(mayInvite({ ...ok, telegram_id: null })).toBe(false)
    expect(mayInvite({ ...ok, nudge_optout: 1 })).toBe(false)
    expect(mayInvite({ ...ok, community_optout: 1 })).toBe(false)
  })

  it('invite text names the place in both locales and promises a single invite', () => {
    const place = COMMUNITY_INVITES[LP]
    expect(inviteText('ru', 'first-lesson', place)).toContain(place.name.ru)
    expect(inviteText('en', 'first-lesson', place)).toContain(place.name.en)
    for (const loc of ['ru', 'en'] as const) {
      const c = botCopy(loc)
      for (const k of ['communityInviteLesson', 'communityInviteAdmission', 'communityWhere', 'communityNote', 'communityButton',
        'communityOffButton', 'communityOffAck', 'communityListIntro', 'communityNone'] as const) expect(c[k].trim(), `${loc}.${k}`).not.toBe('')
    }
    expect(botCopy('ru').communityNote).not.toBe(botCopy('en').communityNote)
  })

  it('/community lists only configured places', () => {
    const urls = communityLinks('ru').map(l => l.url)
    expect(urls).toContain('https://t.me/kundaliniRUs/7823')
    expect(urls).not.toContain('')
  })
})

// Бот и сайт курса ведут в одно место: дрейф ссылок между воркером и pack'ом ловится здесь.
describe('worker places match pack data', () => {
  const packUrl = (p: { enabled: boolean; groupUrl: string; courseTopicUrl: string }) => (p.courseTopicUrl || p.groupUrl)
  it('tochka-sborki', () => {
    expect(COMMUNITY_INVITES['tochka-sborki'].url).toBe(packUrl(TS_PACK))
  })
  it('living-practice', () => {
    expect(COMMUNITY_INVITES[LP].url).toBe(packUrl(LP_PACK))
    expect(COMMUNITY_INVITES[ACADEMY_PLACE].url).toBe(LP_PACK.groupUrl)
  })
})
