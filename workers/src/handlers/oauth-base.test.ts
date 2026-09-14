// Вариант A (intake LMS#16): курс в подпути (/praktika) передаёт свою базу в Google-вход — ошибка и
// возврат по умолчанию ведут на ЕГО страницы, а не на корень домена школы (там их нет).
import { describe, it, expect } from 'vitest'
import { handleOAuthStart, handleOAuthCallback } from './oauth'
import type { Env } from '../lib/types'

const env = {
  GOOGLE_OAUTH_CLIENT_ID: 'cid',
  GOOGLE_OAUTH_CLIENT_SECRET: 'secret',
  WORKER_JWT_SECRET: 'test-secret-32-characters-minimum!!',
} as unknown as Env

describe('oauth course base', () => {
  it('start remembers a valid course base in a temp cookie', async () => {
    const res = await handleOAuthStart(new Request('https://academy.synergify.com/api/auth/oauth/google/start?base=%2Fpraktika&redirect=%2Fpraktika%2Flessons%2F'), env)
    expect(res.status).toBe(302)
    const joined = res.headers.getSetCookie().join('\n')
    expect(joined).toContain('oauth_base=%2Fpraktika')
    expect(res.headers.get('Location')).toContain('redirect_uri=https%3A%2F%2Facademy.synergify.com%2Fapi%2Fauth%2Foauth%2Fgoogle%2Fcallback')
  })

  it('start drops an unsafe base', async () => {
    const res = await handleOAuthStart(new Request('https://academy.synergify.com/api/auth/oauth/google/start?base=%2F%2Fevil.com'), env)
    expect(res.headers.getSetCookie().join('\n')).toContain('oauth_base=;')
  })

  it('a failed callback returns to the course login page, not the domain root', async () => {
    const req = new Request('https://academy.synergify.com/api/auth/oauth/google/callback', {
      headers: { Cookie: 'oauth_base=%2Fpraktika' },
    })
    const res = await handleOAuthCallback(req, env)
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('https://academy.synergify.com/praktika/login?error=oauth')
  })

  it('without a base the failed callback keeps the old root login', async () => {
    const res = await handleOAuthCallback(new Request('https://ai.synergify.com/api/auth/oauth/google/callback'), env)
    expect(res.headers.get('Location')).toBe('https://ai.synergify.com/login?error=oauth')
  })
})
