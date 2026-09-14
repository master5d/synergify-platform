// Вариант A (intake LMS#16): ссылка из письма ведёт на сайт курса, с которого просили вход,
// а сессия — одна на школу. Отдельный файл, чтобы не трогать сценарии auth.test.ts.
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

function makeEnv(): Env {
  const DB = {
    prepare: () => ({
      bind: () => ({
        first: vi.fn().mockResolvedValue({ id: 'existing-user-id', language: 'ru' }),
        run: vi.fn().mockResolvedValue({ success: true }),
      }),
    }),
  } as unknown as D1Database
  return { DB, WORKER_JWT_SECRET: 'test-secret-32-characters-minimum!!' } as Env
}

const ctx = { waitUntil: (_p: Promise<unknown>) => {} } as unknown as ExecutionContext

function sendLink(host: string, body: Record<string, unknown>) {
  return new Request(`https://${host}/api/auth/send-link`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const magicMail = () => sesMock.mock.calls.map(([, msg]) => msg).find((m) => m.subject === 'Ваша ссылка для входа')!

describe('magic link returns to the course site it was requested from', () => {
  it('a request from «Тишина» links to the academy and names that course', async () => {
    const res = await handleSendLink(sendLink('academy.synergify.com', { email: 'a@example.com', return_to: 'https://academy.synergify.com/praktika' }), makeEnv(), ctx)
    expect(res.status).toBe(200)
    const m = magicMail()
    expect(m.html).toContain('https://academy.synergify.com/praktika/auth/verify?token=')
    expect(m.text).toContain('«Тишина, в которой слышно»')
    expect(m.from).toContain('Тишина, в которой слышно')
    expect(m.text).not.toContain('Точка Сборки')
  })

  it('no or unknown return_to falls back to Точка Сборки (no open redirect through the email)', async () => {
    for (const return_to of [undefined, 'https://evil.example/phish']) {
      sesMock.mockClear()
      await handleSendLink(sendLink('ai.synergify.com', { email: 'b@example.com', return_to }), makeEnv(), ctx)
      const m = magicMail()
      expect(m.html).toContain('https://ai.synergify.com/auth/verify?token=')
      expect(m.html).not.toContain('evil.example')
      expect(m.text).toContain('«Точка Сборки»')
    }
  })
})

describe('logout clears the whole school session', () => {
  it('on a school host both the host-only and the domain cookie are cleared', async () => {
    const res = await handleLogout(new Request('https://academy.synergify.com/api/auth/logout', { method: 'POST' }), makeEnv())
    const cookies = res.headers.getSetCookie()
    expect(cookies).toHaveLength(2)
    expect(cookies.some((c) => c.includes('Domain=.synergify.com') && c.includes('Max-Age=0'))).toBe(true)
  })
})
