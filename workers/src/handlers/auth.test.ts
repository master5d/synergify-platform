import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleSendLink, handleLogout } from './auth'
import type { Env } from '../lib/types'
import { sendEmailSES } from '../lib/ses'

vi.mock('../lib/ses', () => ({ sendEmailSES: vi.fn() }))

const sesMock = vi.mocked(sendEmailSES)

beforeEach(() => {
  sesMock.mockReset()
  sesMock.mockResolvedValue({ ok: true, status: 200 })
})

type DbCall = { sql: string; binds: unknown[] }

function makeEnv(opts: { existing?: boolean; calls?: DbCall[]; language?: string } = {}): Env {
  const DB = {
    prepare: (sql: string) => ({
      bind: (...binds: unknown[]) => {
        opts.calls?.push({ sql, binds })
        return {
          first: vi.fn().mockResolvedValue(opts.existing ? { id: 'existing-user-id', language: opts.language ?? 'ru' } : null),
          run: vi.fn().mockResolvedValue({ success: true }),
        }
      },
    }),
  } as unknown as D1Database
  return {
    DB,
    WORKER_JWT_SECRET: 'test-secret-32-characters-minimum!!',
    SES_ACCESS_KEY_ID: 'AKIATEST',
    SES_SECRET_ACCESS_KEY: 'secret',
    LISTMONK_URL: 'https://listmonk.mamaev.coach',
    LISTMONK_API_USER: 'user',
    LISTMONK_API_TOKEN: 'tok',
    CF_ACCESS_CLIENT_ID: 'cf-id',
    CF_ACCESS_CLIENT_SECRET: 'cf-secret',
    LISTMONK_CRM_LIST_ID: '3',
  } as Env
}

// waitUntil that simply lets the fire-and-forget promise run
const ctx = { waitUntil: (_p: Promise<unknown>) => {} } as unknown as ExecutionContext

function sendLinkReq(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Request('https://ai.synergify.com/api/auth/send-link', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

const usersInsert = (calls: DbCall[]) => calls.find(c => /INSERT INTO users/.test(c.sql))

describe('handleSendLink', () => {
  it('returns 400 for missing email', async () => {
    const res = await handleSendLink(sendLinkReq({}), makeEnv(), ctx)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid email format', async () => {
    const res = await handleSendLink(sendLinkReq({ email: 'not-an-email' }), makeEnv(), ctx)
    expect(res.status).toBe(400)
  })

  it('returns 200 and calls SES email for valid email', async () => {
    const res = await handleSendLink(sendLinkReq({ email: 'test@example.com' }), makeEnv(), ctx)
    expect(res.status).toBe(200)
    expect(sesMock).toHaveBeenCalled()
  })

  it('returns 502 if SES email send fails', async () => {
    sesMock.mockResolvedValue({ ok: false, status: 500, error: 'boom' })
    const res = await handleSendLink(sendLinkReq({ email: 'test@example.com' }), makeEnv(), ctx)
    expect(res.status).toBe(502)
  })
})

describe('handleSendLink enrichment (persisted to D1 users)', () => {
  it('persists detected language and stripped telegram handle for a new user', async () => {
    const calls: DbCall[] = []
    const req = sendLinkReq({ email: 'new@example.com', telegram_handle: '@sasha' }, { 'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8' })
    const res = await handleSendLink(req, makeEnv({ calls }), ctx)
    expect(res.status).toBe(200)
    const ins = usersInsert(calls)
    expect(ins).toBeDefined()
    // binds: id, email, created_at, language, source, telegram_handle
    expect(ins!.binds[3]).toBe('ru')
    expect(ins!.binds[5]).toBe('sasha') // stripped @
  })

  it('builds source from UTM params', async () => {
    const calls: DbCall[] = []
    const req = sendLinkReq({ email: 'utm@example.com', utm_source: 'telegram', utm_medium: 'post', utm_campaign: 'course1' })
    await handleSendLink(req, makeEnv({ calls }), ctx)
    expect(usersInsert(calls)!.binds[4]).toBe('telegram/post/course1')
  })
})

describe('handleSendLink listmonk CRM contact', () => {
  it('adds a new user as a listmonk contact', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    await handleSendLink(sendLinkReq({ email: 'new@example.com' }), makeEnv(), ctx)
    const contactCall = (fetchSpy.mock.calls as [string][]).find(([url]) => (url as string).endsWith('/api/subscribers'))
    expect(contactCall).toBeDefined()
    fetchSpy.mockRestore()
  })

  it('does not add an existing user as a contact', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    await handleSendLink(sendLinkReq({ email: 'existing@example.com' }), makeEnv({ existing: true }), ctx)
    const contactCall = (fetchSpy.mock.calls as [string][]).find(([url]) => (url as string).endsWith('/api/subscribers'))
    expect(contactCall).toBeUndefined()
    fetchSpy.mockRestore()
  })

  it('still returns 200 when the contact add fails', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if ((url as string).endsWith('/api/subscribers')) throw new Error('listmonk down')
      return new Response('{}', { status: 200 })
    })
    const res = await handleSendLink(sendLinkReq({ email: 'test@example.com' }), makeEnv(), ctx)
    expect(res.status).toBe(200)
    fetchSpy.mockRestore()
  })
})

describe('handleSendLink bilingual (по users.language)', () => {
  function magicLinkSubject(): string | undefined {
    const call = sesMock.mock.calls.find(([, msg]) => msg.headers?.['X-Entity-Ref-ID'])
    return call?.[1].subject
  }

  it('sends an English email for a new EN-locale user', async () => {
    await handleSendLink(sendLinkReq({ email: 'en-new@example.com' }, { 'Accept-Language': 'en-US,en;q=0.9' }), makeEnv(), ctx)
    expect(magicLinkSubject()).toBe('Your sign-in link')
  })

  it('sends a Russian email for a new RU-locale user', async () => {
    await handleSendLink(sendLinkReq({ email: 'ru-new@example.com' }, { 'Accept-Language': 'ru-RU,ru;q=0.9' }), makeEnv(), ctx)
    expect(magicLinkSubject()).toBe('Ваша ссылка для входа')
  })

  it('uses stored users.language for an existing user, ignoring the request header', async () => {
    // header говорит ru, но в БД у юзера language=en → письмо должно быть на EN
    await handleSendLink(sendLinkReq({ email: 'en-existing@example.com' }, { 'Accept-Language': 'ru-RU' }), makeEnv({ existing: true, language: 'en' }), ctx)
    expect(magicLinkSubject()).toBe('Your sign-in link')
  })
})

describe('handleLogout', () => {
  it('clears session cookie', async () => {
    const req = new Request('https://ai.synergify.com/api/auth/logout', { method: 'POST' })
    const res = await handleLogout(req, makeEnv())
    expect(res.status).toBe(200)
    expect(res.headers.get('Set-Cookie')).toContain('session=;')
  })
})

// collecting ctx: capture waitUntil promises so the queued welcome send actually runs
function makeCollectingCtx() {
  const promises: Promise<unknown>[] = []
  const ctx = { waitUntil: (p: Promise<unknown>) => { promises.push(p) } } as unknown as ExecutionContext
  return { ctx, settle: () => Promise.allSettled(promises) }
}

describe('welcome email trigger', () => {
  it('sends BOTH magic-link and welcome emails for a NEW user', async () => {
    const { ctx, settle } = makeCollectingCtx()
    const res = await handleSendLink(sendLinkReq({ email: 'new@example.com' }), makeEnv({ existing: false }), ctx)
    expect(res.status).toBe(200)
    await settle()
    const subjects = sesMock.mock.calls.map(([, msg]) => msg.subject)
    expect(subjects).toContain('Ваша ссылка для входа')              // magic-link
    expect(subjects).toContain('Добро пожаловать в Точку Сборки')    // welcome
    expect(subjects.length).toBe(2)
  })

  it('sends ONLY the magic-link email for an EXISTING user (idempotent)', async () => {
    const { ctx, settle } = makeCollectingCtx()
    const res = await handleSendLink(sendLinkReq({ email: 'old@example.com' }), makeEnv({ existing: true }), ctx)
    expect(res.status).toBe(200)
    await settle()
    const subjects = sesMock.mock.calls.map(([, msg]) => msg.subject)
    expect(subjects).toEqual(['Ваша ссылка для входа'])               // no welcome
  })
})
