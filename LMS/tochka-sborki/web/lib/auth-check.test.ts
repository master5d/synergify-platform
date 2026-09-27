import { describe, expect, it } from 'vitest'
import { checkAuth } from './auth-check'

describe('checkAuth', () => {
  it('authed on a 200 /api/auth/me', async () => {
    const fakeFetch = (async () => new Response(null, { status: 200 })) as typeof fetch
    const res = await checkAuth(fakeFetch, '/login/', '/lessons/01-introduction/')
    expect(res).toEqual({ authed: true })
  })

  it('not authed on a non-2xx response → login with ?redirect= to the current lesson', async () => {
    const fakeFetch = (async () => new Response(null, { status: 401 })) as typeof fetch
    const res = await checkAuth(fakeFetch, '/login/', '/lessons/01-introduction/')
    expect(res).toEqual({ authed: false, redirectTo: '/login/?redirect=%2Flessons%2F01-introduction%2F' })
  })

  it('a rejected fetch (network failure) still redirects to login WITH ?redirect= (was lost before intake LMS#16)', async () => {
    const fakeFetch = (async () => { throw new TypeError('Failed to fetch') }) as unknown as typeof fetch
    const res = await checkAuth(fakeFetch, '/login/', '/lessons/01-introduction/')
    expect(res.authed).toBe(false)
    expect((res as { redirectTo: string }).redirectTo).toBe('/login/?redirect=%2Flessons%2F01-introduction%2F')
  })

  it('respects a course base path prefix in loginBase', async () => {
    const fakeFetch = (async () => new Response(null, { status: 401 })) as typeof fetch
    const res = await checkAuth(fakeFetch, '/praktika/en/login/', '/praktika/en/lessons/01/')
    expect(res).toEqual({ authed: false, redirectTo: '/praktika/en/login/?redirect=%2Fpraktika%2Fen%2Flessons%2F01%2F' })
  })
})
