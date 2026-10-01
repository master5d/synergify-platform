import { describe, it, expect, vi } from 'vitest'
import { handleEmailUnsubscribe } from './email-unsubscribe'
import { signUnsubscribe, verifyUnsubscribe, unsubscribeUrl } from '../lib/email-unsubscribe'
import type { Env } from '../lib/types'

const SECRET = 'test-secret-32-characters-minimum!!'

describe('unsubscribe signature', () => {
  it('valid signature verifies; forged, foreign-user and wrong-secret ones do not', async () => {
    const sig = await signUnsubscribe('user-1', SECRET)
    expect(sig).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(await verifyUnsubscribe('user-1', sig, SECRET)).toBe(true)
    expect(await verifyUnsubscribe('user-2', sig, SECRET)).toBe(false)
    expect(await verifyUnsubscribe('user-1', sig, 'another-secret-another-secret!!')).toBe(false)
    const flipped = (sig[0] === 'A' ? 'B' : 'A') + sig.slice(1)
    expect(await verifyUnsubscribe('user-1', flipped, SECRET)).toBe(false)
    expect(await verifyUnsubscribe('user-1', '', SECRET)).toBe(false)
    expect(await verifyUnsubscribe('user-1', 'not base64 !!', SECRET)).toBe(false)
    expect(await verifyUnsubscribe('', sig, SECRET)).toBe(false)
  })

  it('builds an absolute URL on the course domain', async () => {
    const url = await unsubscribeUrl('user-1', SECRET)
    const sig = await signUnsubscribe('user-1', SECRET)
    expect(url).toBe(`https://ai.synergify.com/api/email/unsubscribe?u=user-1&s=${sig}`)
  })
})

function makeEnv(language: string | null = 'en') {
  const calls: { sql: string; binds: unknown[] }[] = []
  const env = {
    WORKER_JWT_SECRET: SECRET,
    DB: {
      prepare: (sql: string) => ({
        bind: (...binds: unknown[]) => {
          calls.push({ sql, binds })
          return {
            first: vi.fn().mockResolvedValue(/SELECT language/.test(sql) ? { language } : null),
            run: vi.fn().mockResolvedValue({ success: true }),
          }
        },
      }),
    },
  } as unknown as Env
  return { env, calls }
}

const optouts = (calls: { sql: string; binds: unknown[] }[]) => calls.filter(c => /email_optout = 1/.test(c.sql))

describe('handleEmailUnsubscribe', () => {
  it('GET shows a page with a POST button and does NOT opt out (link scanners)', async () => {
    const { env, calls } = makeEnv('en')
    const sig = await signUnsubscribe('user-1', SECRET)
    const res = await handleEmailUnsubscribe(new Request(`https://ai.synergify.com/api/email/unsubscribe?u=user-1&s=${sig}`), env)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toMatch(/text\/html/)
    const html = await res.text()
    expect(html).toContain('<form method="post"')
    expect(html).toContain('Unsubscribe')
    expect(optouts(calls)).toHaveLength(0)
  })

  it('GET page is Russian for ru users', async () => {
    const { env } = makeEnv('ru')
    const sig = await signUnsubscribe('user-1', SECRET)
    const html = await (await handleEmailUnsubscribe(new Request(`https://x.test/api/email/unsubscribe?u=user-1&s=${sig}`), env)).text()
    expect(html).toContain('Отписаться')
  })

  it('one-click POST (RFC 8058) sets email_optout and returns 200', async () => {
    const { env, calls } = makeEnv()
    const sig = await signUnsubscribe('user-1', SECRET)
    const res = await handleEmailUnsubscribe(new Request(`https://ai.synergify.com/api/email/unsubscribe?u=user-1&s=${sig}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'List-Unsubscribe=One-Click',
    }), env)
    expect(res.status).toBe(200)
    expect(optouts(calls)).toEqual([{ sql: 'UPDATE users SET email_optout = 1 WHERE id = ?', binds: ['user-1'] }])
  })

  it('bad signature → 400 without details, nothing written', async () => {
    const { env, calls } = makeEnv()
    const sig = await signUnsubscribe('user-1', SECRET)
    for (const req of [
      new Request(`https://x.test/api/email/unsubscribe?u=user-2&s=${sig}`, { method: 'POST' }),
      new Request('https://x.test/api/email/unsubscribe?u=user-1&s=forged', { method: 'POST' }),
      new Request('https://x.test/api/email/unsubscribe'),
    ]) {
      const res = await handleEmailUnsubscribe(req, env)
      expect(res.status).toBe(400)
      expect(await res.text()).toBe('Invalid link')
    }
    expect(calls).toHaveLength(0)
  })
})
