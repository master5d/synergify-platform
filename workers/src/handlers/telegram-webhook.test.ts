import { describe, it, expect, vi, afterEach } from 'vitest'
import { handleTelegramWebhook } from './telegram-webhook'
import type { Env } from '../lib/types'

const SECRET = 'wh-secret'

type Row = Record<string, unknown>
type DbCall = { sql: string; binds: unknown[] }
function makeEnv(opts: { user?: Row | null; progress?: Row[]; calls?: DbCall[] } = {}): Env {
  const DB = {
    prepare: (sql: string) => ({
      bind: (...b: unknown[]) => {
        opts.calls?.push({ sql, binds: b })
        return {
          first: vi.fn().mockResolvedValue(/FROM users/.test(sql) ? (opts.user ?? null) : null),
          all: vi.fn().mockResolvedValue({ results: /FROM progress/.test(sql) ? (opts.progress ?? []) : [] }),
          run: vi.fn().mockResolvedValue({ success: true }),
        }
      },
    }),
  } as unknown as D1Database
  return { DB, TELEGRAM_BOT_TOKEN: 'BOT', TELEGRAM_WEBHOOK_SECRET: SECRET } as Env
}

function req(update: unknown, secret: string | null = SECRET): Request {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (secret !== null) headers['X-Telegram-Bot-Api-Secret-Token'] = secret
  return new Request('https://ai.synergify.com/api/telegram/webhook', {
    method: 'POST', body: JSON.stringify(update), headers,
  })
}

afterEach(() => vi.restoreAllMocks())

const lastBody = (spy: ReturnType<typeof vi.spyOn>) =>
  JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string)

describe('handleTelegramWebhook', () => {
  it('rejects a missing/wrong secret token with 403', async () => {
    const res = await handleTelegramWebhook(req({ message: { text: '/start' } }, 'wrong'), makeEnv())
    expect(res.status).toBe(403)
  })

  it('/start sends a greeting with an open-course button (unlinked ok)', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const res = await handleTelegramWebhook(
      req({ message: { text: '/start', from: { id: 100, language_code: 'ru' }, chat: { id: 100 } } }),
      makeEnv({ user: null })
    )
    expect(res.status).toBe(200)
    expect(lastBody(spy).reply_markup.inline_keyboard[0][0].web_app.url).toBe('https://ai.synergify.com/')
  })

  it('/continue from an unlinked user asks them to open the course first', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await handleTelegramWebhook(
      req({ message: { text: '/continue', from: { id: 200 }, chat: { id: 200 } } }),
      makeEnv({ user: null })
    )
    expect(lastBody(spy).reply_markup.inline_keyboard[0][0].web_app.url).toBe('https://ai.synergify.com/')
  })

  it('/continue from a linked user deep-links the next incomplete lesson', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await handleTelegramWebhook(
      req({ message: { text: '/continue', from: { id: 300, language_code: 'ru' }, chat: { id: 300 } } }),
      makeEnv({ user: { id: 'u-300', language: 'ru' }, progress: [{ lesson_slug: '00-kickstart', completed_at: 123 }] })
    )
    expect(lastBody(spy).reply_markup.inline_keyboard[0][0].web_app.url)
      .toBe('https://ai.synergify.com/lessons/01-introduction/')
  })

  it('returns 200 even when the update is junk', async () => {
    const res = await handleTelegramWebhook(req({ nonsense: true }), makeEnv())
    expect(res.status).toBe(200)
  })

  it('/stop from a linked user sets nudge_optout = 1 and acks', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const calls: DbCall[] = []
    await handleTelegramWebhook(
      req({ message: { text: '/stop', from: { id: 400 }, chat: { id: 400 } } }),
      makeEnv({ user: { id: 'u-400', language: 'ru', nudge_optout: 0 }, calls })
    )
    const upd = calls.find(c => /UPDATE users SET nudge_optout = 1/.test(c.sql))
    expect(upd).toBeDefined()
    expect(upd!.binds[0]).toBe('u-400')
  })

  it('/start from an opted-out user clears nudge_optout = 0', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const calls: DbCall[] = []
    await handleTelegramWebhook(
      req({ message: { text: '/start', from: { id: 401 }, chat: { id: 401 } } }),
      makeEnv({ user: { id: 'u-401', language: 'ru', nudge_optout: 1 }, calls })
    )
    expect(calls.find(c => /UPDATE users SET nudge_optout = 0/.test(c.sql))).toBeDefined()
  })

  it('bare /ask sends a force_reply prompt', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await handleTelegramWebhook(
      req({ message: { text: '/ask', from: { id: 600 }, chat: { id: 600 } } }),
      makeEnv({ user: { id: 'u-600', language: 'ru', nudge_optout: 0 } })
    )
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string)
    expect(body.reply_markup).toEqual({ force_reply: true })
  })

  it('/ask <question> from a linked user inserts a question and acks with a button', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const calls: DbCall[] = []
    await handleTelegramWebhook(
      req({ message: { text: '/ask how do I install?', from: { id: 601 }, chat: { id: 601 } } }),
      makeEnv({ user: { id: 'u-601', language: 'ru', nudge_optout: 0 }, calls })
    )
    const ins = calls.find(c => /INSERT INTO questions/.test(c.sql))
    expect(ins).toBeDefined()
    expect(ins!.binds[3]).toBe('how do I install?') // id, user_id, telegram_id, text, ...
    expect(ins!.binds[1]).toBe('u-601')             // user_id
    const tgCall = (spy.mock.calls as [string, RequestInit][]).find(([u]) => /api\.telegram\.org/.test(u) && /sendMessage/.test(u))
    const ackBody = JSON.parse(tgCall![1].body as string)
    expect(ackBody.reply_markup.inline_keyboard[0][0].web_app.url).toBe('https://ai.synergify.com/')
  })

  it('captures a question from an unlinked user with user_id null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const calls: DbCall[] = []
    await handleTelegramWebhook(
      req({ message: { text: '/ask anonymous q', from: { id: 602 }, chat: { id: 602 } } }),
      makeEnv({ user: null, calls })
    )
    const ins = calls.find(c => /INSERT INTO questions/.test(c.sql))
    expect(ins).toBeDefined()
    expect(ins!.binds[1]).toBeNull()            // user_id null
    expect(ins!.binds[2]).toBe('602')           // telegram_id
  })

  it('/support sends a button to the support page', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await handleTelegramWebhook(
      req({ message: { text: '/support', from: { id: 700 }, chat: { id: 700 } } }),
      makeEnv({ user: { id: 'u-700', language: 'ru', nudge_optout: 0 } })
    )
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string)
    expect(body.reply_markup.inline_keyboard[0][0].web_app.url).toBe('https://ai.synergify.com/support/')
  })

  it('/store sends a button to the store page', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await handleTelegramWebhook(
      req({ message: { text: '/store', from: { id: 701 }, chat: { id: 701 } } }),
      makeEnv({ user: { id: 'u-701', language: 'ru', nudge_optout: 0 } })
    )
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string)
    expect(body.reply_markup.inline_keyboard[0][0].web_app.url).toBe('https://mamaev.coach/store/')
  })
})
