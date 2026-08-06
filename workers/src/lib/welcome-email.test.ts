import { describe, it, expect } from 'vitest'
import { buildWelcomeEmail } from './welcome-email'

const ctx = { verifyUrl: 'https://ai.synergify.com/auth/verify?token=TOK', ownerEmail: 'owner@example.com' }

describe('buildWelcomeEmail ru', () => {
  const m = buildWelcomeEmail('ru', ctx)
  it('has the name-less RU subject', () => {
    expect(m.subject).toBe('Добро пожаловать в Точку Сборки')
  })
  it('resolves every placeholder (no {{ left) in text and html', () => {
    expect(m.text).not.toContain('{{')
    expect(m.html).not.toContain('{{')
  })
  it('embeds verify, intake and cheatsheet urls (ru, no /en prefix)', () => {
    for (const body of [m.text, m.html]) {
      expect(body).toContain('https://ai.synergify.com/auth/verify?token=TOK')
      expect(body).toContain('https://ai.synergify.com/quest-intake/')
      expect(body).toContain('https://ai.synergify.com/cheatsheet/')
    }
  })
  it('keeps the anti-fluff block and omits a community step', () => {
    expect(m.text).toContain('НЕ будет')
    expect(m.text).not.toContain('сообществ')
  })
  it('builds the List-Unsubscribe value pointing at the owner mailbox', () => {
    expect(m.listUnsubscribe).toBe('<mailto:owner@example.com?subject=unsubscribe>')
  })
})

describe('buildWelcomeEmail en', () => {
  const m = buildWelcomeEmail('en', ctx)
  it('has the name-less EN subject', () => {
    expect(m.subject).toBe('Welcome to Tochka Sborki')
  })
  it('uses the /en prefix on intake and cheatsheet urls', () => {
    expect(m.text).toContain('https://ai.synergify.com/en/quest-intake/')
    expect(m.text).toContain('https://ai.synergify.com/en/cheatsheet/')
  })
  it('has the EN founder note and anti-fluff block, no {{', () => {
    expect(m.text).toContain("won't get")
    expect(m.text).not.toContain('{{')
  })
})

import { vi, afterEach, beforeEach } from 'vitest'
import { sendWelcomeEmail } from './welcome-email'
import { sendEmailSES } from './ses'
import type { Env } from './types'

vi.mock('./ses', () => ({ sendEmailSES: vi.fn() }))
const sesMock = vi.mocked(sendEmailSES)

afterEach(() => vi.restoreAllMocks())
beforeEach(() => sesMock.mockReset())

const env = {
  SES_ACCESS_KEY_ID: 'AKIATEST',
  SES_SECRET_ACCESS_KEY: 'secret',
  OWNER_EMAIL: 'owner@example.com',
} as Env
const p = { email: 'b@e.com', lang: 'ru', verifyUrl: 'https://ai.synergify.com/auth/verify?token=T' }

describe('sendWelcomeEmail', () => {
  it('sends via SES with the welcome subject and List-Unsubscribe header, returns true', async () => {
    sesMock.mockResolvedValue({ ok: true, status: 200 })
    const ok = await sendWelcomeEmail(env, p)
    expect(ok).toBe(true)
    const [, msg] = sesMock.mock.calls[0]
    expect(msg.from).toBe('Точка Сборки <noreply@synergify.com>')
    expect(msg.to).toBe('b@e.com')
    expect(msg.subject).toBe('Добро пожаловать в Точку Сборки')
    expect(msg.headers?.['List-Unsubscribe']).toBe('<mailto:owner@example.com?subject=unsubscribe>')
  })
  it('is a no-op (false) when SES_ACCESS_KEY_ID is unset', async () => {
    const ok = await sendWelcomeEmail({ OWNER_EMAIL: 'o@e.com' } as Env, p)
    expect(ok).toBe(false)
    expect(sesMock).not.toHaveBeenCalled()
  })
  it('returns false (never throws) when SES responds non-OK', async () => {
    sesMock.mockResolvedValue({ ok: false, status: 422, error: 'err' })
    const ok = await sendWelcomeEmail(env, p)
    expect(ok).toBe(false)
  })
})
