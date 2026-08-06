import { describe, it, expect, vi, afterEach } from 'vitest'
import { runDailyNudge } from './nudge-cron'
import { MODULE_ORDER } from '../lib/course-order'
import { NUDGE_VARIANTS } from '../lib/bot-copy'
import type { Env } from '../lib/types'

const NOW = 1_800_000_000
const TWO_DAYS = 2 * 24 * 3600

type Row = Record<string, unknown>
type DbCall = { sql: string; binds: unknown[] }

function makeEnv(opts: { candidates?: Row[]; progress?: Row[]; calls?: DbCall[] } = {}): Env {
  const DB = {
    prepare: (sql: string) => ({
      bind: (...b: unknown[]) => {
        opts.calls?.push({ sql, binds: b })
        return {
          all: vi.fn().mockResolvedValue({
            results: /FROM users/.test(sql) ? (opts.candidates ?? [])
              : /FROM progress/.test(sql) ? (opts.progress ?? []) : [],
          }),
          run: vi.fn().mockResolvedValue({ success: true }),
        }
      },
    }),
  } as unknown as D1Database
  return { DB, TELEGRAM_BOT_TOKEN: 'BOT' } as Env
}

const candidate = (over: Row = {}): Row => ({ id: 'u1', telegram_id: '500', language: 'ru', created_at: NOW - 10 * 24 * 3600, last_nudge_at: null, ...over })

afterEach(() => vi.restoreAllMocks())

describe('runDailyNudge', () => {
  it('nudges an eligible learner with a button to the next lesson and stamps last_nudge_at', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const calls: DbCall[] = []
    const res = await runDailyNudge(
      makeEnv({ candidates: [candidate()], progress: [{ lesson_slug: '00-kickstart', viewed_at: NOW - TWO_DAYS, completed_at: NOW - TWO_DAYS }], calls }),
      NOW
    )
    expect(res.sent).toBe(1)
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string)
    expect(body.chat_id).toBe(500)
    expect(body.reply_markup.inline_keyboard[0][0].web_app.url).toBe('https://ai.synergify.com/lessons/01-introduction/')
    expect(calls.find(c => /UPDATE users SET last_nudge_at/.test(c.sql))).toBeDefined()
  })

  it('skips a just-active learner', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const res = await runDailyNudge(
      makeEnv({ candidates: [candidate()], progress: [{ lesson_slug: '00-kickstart', viewed_at: NOW - 600, completed_at: null }] }),
      NOW
    )
    expect(res.sent).toBe(0)
    expect(spy).not.toHaveBeenCalled()
  })

  it('skips a finished learner', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const progress = MODULE_ORDER.map(slug => ({ lesson_slug: slug, viewed_at: NOW - TWO_DAYS, completed_at: NOW - TWO_DAYS }))
    const res = await runDailyNudge(makeEnv({ candidates: [candidate()], progress }), NOW)
    expect(res.sent).toBe(0)
    expect(spy).not.toHaveBeenCalled()
  })

  it('does not abort the batch when a send throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('telegram down'))
    const res = await runDailyNudge(
      makeEnv({ candidates: [candidate()], progress: [{ lesson_slug: '00-kickstart', viewed_at: NOW - TWO_DAYS, completed_at: NOW - TWO_DAYS }] }),
      NOW
    )
    expect(res.sent).toBe(0)
  })

  it('sends one of the de-guru nudge variants as the message text', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const res = await runDailyNudge(
      makeEnv({ candidates: [candidate()], progress: [{ lesson_slug: '00-kickstart', viewed_at: NOW - TWO_DAYS, completed_at: NOW - TWO_DAYS }] }),
      NOW
    )
    expect(res.sent).toBe(1)
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string)
    const { pickNudge } = await import('../lib/bot-copy')
    expect(body.text).toBe(pickNudge('ru', NOW))
    expect(NUDGE_VARIANTS.ru).toContain(body.text)
  })
})
