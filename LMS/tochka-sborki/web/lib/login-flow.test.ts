import { describe, expect, it } from 'vitest'
import { mapSendLinkError, sendLoginLink } from './login-flow'
import type { Dictionary } from './dictionaries'

const t: Dictionary['login'] = {
  label: '⬡ Вход',
  heading: 'Войти\nв курс',
  emailLabel: 'Email',
  telegramLabel: 'Telegram (необязательно)',
  telegramHint: 'Бот напомнит про курс в Telegram, если пропустишь урок.',
  emailPlaceholder: 'твой@email.com',
  telegramPlaceholder: '@telegram',
  submit: 'Получить ссылку →',
  sending: 'Отправляем...',
  resend: 'Отправить ещё раз',
  changeEmail: '← Изменить email',
  sentConfirm: (email: string) => `✓ Ссылка отправлена на ${email}. Проверь почту.`,
  defaultError: 'DEFAULT',
  networkError: 'NETWORK',
  invalidEmail: 'INVALID_EMAIL',
  sendFailed: 'SEND_FAILED',
  rateLimited: 'RATE_LIMITED',
  redirectHint: 'Войди, и урок откроется.',
  footnote: 'Без паролей.',
  pageTitle: 'Вход',
  google: 'Войти через Google',
  or: 'или',
}

describe('mapSendLinkError', () => {
  it('maps the known 400 code', () => {
    expect(mapSendLinkError(400, { error: 'Valid email required' }, t)).toBe('INVALID_EMAIL')
  })
  it('maps the known 502 code', () => {
    expect(mapSendLinkError(502, { error: 'Failed to send email' }, t)).toBe('SEND_FAILED')
  })
  it('maps a 429 regardless of body', () => {
    expect(mapSendLinkError(429, {}, t)).toBe('RATE_LIMITED')
  })
  it('falls back to defaultError for an unknown code', () => {
    expect(mapSendLinkError(400, { error: 'Invalid JSON' }, t)).toBe('DEFAULT')
    expect(mapSendLinkError(500, {}, t)).toBe('DEFAULT')
  })
})

describe('sendLoginLink', () => {
  it('resolves ok on a 200 response', async () => {
    const fakeFetch = (async () => new Response(JSON.stringify({ ok: true }), { status: 200 })) as typeof fetch
    const res = await sendLoginLink(fakeFetch, { email: 'a@b.com' }, t)
    expect(res).toEqual({ ok: true })
  })

  it('a rejected fetch (network failure) shows t.networkError, never the exception text', async () => {
    const fakeFetch = (async () => { throw new TypeError('Failed to fetch') }) as unknown as typeof fetch
    const res = await sendLoginLink(fakeFetch, { email: 'a@b.com' }, t)
    expect(res).toEqual({ ok: false, message: 'NETWORK' })
  })

  it('an unknown server error code maps to defaultError, not the raw message', async () => {
    const fakeFetch = (async () =>
      new Response(JSON.stringify({ error: 'Failed to send email', status: 554, details: 'SES 554 5.7.1 raw SMTP reason' }), { status: 502 })
    ) as typeof fetch
    const res = await sendLoginLink(fakeFetch, { email: 'a@b.com' }, t)
    expect(res).toEqual({ ok: false, message: 'SEND_FAILED' })
  })

  it('a genuinely unknown code falls back to defaultError', async () => {
    const fakeFetch = (async () =>
      new Response(JSON.stringify({ error: 'some-new-code-we-never-heard-of' }), { status: 400 })
    ) as typeof fetch
    const res = await sendLoginLink(fakeFetch, { email: 'a@b.com' }, t)
    expect(res).toEqual({ ok: false, message: 'DEFAULT' })
  })
})
