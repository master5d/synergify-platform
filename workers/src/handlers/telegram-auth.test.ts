import { describe, it, expect, vi } from 'vitest'
import { createHmac } from 'node:crypto'
import { handleTelegramAuth } from './telegram-auth'
import type { Env } from '../lib/types'

const BOT = 'test-bot-token'

function buildInitData(user: Record<string, unknown>, authDate = Math.floor(Date.now() / 1000)): string {
  const params: Record<string, string> = { auth_date: String(authDate), user: JSON.stringify(user) }
  const dcs = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(BOT).digest()
  const hash = createHmac('sha256', secret).update(dcs).digest('hex')
  const usp = new URLSearchParams(params); usp.set('hash', hash)
  return usp.toString()
}

type DbCall = { sql: string; binds: unknown[] }

function makeEnv(opts: { byId?: unknown; byHandle?: unknown; calls?: DbCall[]; noToken?: boolean } = {}): Env {
  const DB = {
    prepare: (sql: string) => ({
      bind: (...binds: unknown[]) => {
        opts.calls?.push({ sql, binds })
        return {
          first: vi.fn().mockImplementation(async () => {
            if (/WHERE telegram_id = \?/.test(sql)) return opts.byId ?? null
            if (/WHERE telegram_handle = \?/.test(sql)) return opts.byHandle ?? null
            return null
          }),
          run: vi.fn().mockResolvedValue({ success: true }),
        }
      },
    }),
  } as unknown as D1Database
  return {
    DB,
    WORKER_JWT_SECRET: 'test-secret-32-characters-minimum!!',
    TELEGRAM_BOT_TOKEN: opts.noToken ? '' : BOT,
  } as Env
}

function req(body: unknown): Request {
  return new Request('https://ai.synergify.com/api/auth/telegram', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const usersInsert = (calls: DbCall[]) => calls.find(c => /INSERT INTO users/.test(c.sql))
const usersUpdate = (calls: DbCall[]) => calls.find(c => /UPDATE users SET telegram_id/.test(c.sql))

describe('handleTelegramAuth', () => {
  it('returns 503 when the bot token is not configured', async () => {
    const res = await handleTelegramAuth(req({ initData: buildInitData({ id: 1, username: 'x' }) }), makeEnv({ noToken: true }))
    expect(res.status).toBe(503)
  })

  it('returns 400 for invalid JSON', async () => {
    const bad = new Request('https://ai.synergify.com/api/auth/telegram', { method: 'POST', body: 'not json' })
    expect((await handleTelegramAuth(bad, makeEnv())).status).toBe(400)
  })

  it('returns 401 for invalid initData', async () => {
    const res = await handleTelegramAuth(req({ initData: 'auth_date=1&user=%7B%7D&hash=deadbeef' }), makeEnv())
    expect(res.status).toBe(401)
  })

  it('creates a Telegram-native user and sets a session cookie', async () => {
    const calls: DbCall[] = []
    const res = await handleTelegramAuth(req({ initData: buildInitData({ id: 777, username: 'newbie', language_code: 'en' }) }), makeEnv({ calls }))
    expect(res.status).toBe(200)
    expect(res.headers.get('Set-Cookie')).toContain('session=')
    const ins = usersInsert(calls)
    expect(ins).toBeDefined()
    // binds: id, email, created_at, language, source, telegram_handle, telegram_id
    expect(ins!.binds[1]).toBe('tg_777@telegram.local')
    expect(ins!.binds[3]).toBe('en')
    expect(ins!.binds[5]).toBe('newbie')
    expect(ins!.binds[6]).toBe('777')
    expect(usersUpdate(calls)).toBeUndefined()
  })

  it('logs in an existing user matched by telegram_id (no insert)', async () => {
    const calls: DbCall[] = []
    const res = await handleTelegramAuth(
      req({ initData: buildInitData({ id: 42, username: 'known' }) }),
      makeEnv({ byId: { id: 'user-42', email: 'known@example.com' }, calls })
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('Set-Cookie')).toContain('session=')
    expect(usersInsert(calls)).toBeUndefined()
  })

  it('backfills telegram_id when matched by handle', async () => {
    const calls: DbCall[] = []
    const res = await handleTelegramAuth(
      req({ initData: buildInitData({ id: 99, username: 'sasha' }) }),
      makeEnv({ byHandle: { id: 'user-sasha', email: 'sasha@example.com' }, calls })
    )
    expect(res.status).toBe(200)
    const upd = usersUpdate(calls)
    expect(upd).toBeDefined()
    expect(upd!.binds[0]).toBe('99')          // telegram_id
    expect(upd!.binds[1]).toBe('user-sasha')  // user id
    expect(usersInsert(calls)).toBeUndefined()
  })
})
