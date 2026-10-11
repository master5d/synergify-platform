import { describe, it, expect, vi } from 'vitest'
import { installMirrorFetchGuard } from './mirror-fetch'

function fakeWindow() {
  const real = vi.fn(async () => new Response('ok', { status: 200 }))
  const win = { fetch: real as unknown as typeof fetch, location: { origin: 'https://master5d.github.io' } }
  return { win, real }
}

describe('installMirrorFetchGuard', () => {
  it.each(['/api/auth/me', 'https://ai.synergify.com/api/progress/list', '/ts-gitbook/api/intake/me'])(
    '%s → 503 без сети', async (url) => {
      const { win, real } = fakeWindow()
      installMirrorFetchGuard(win)
      const res = await win.fetch(url, { credentials: 'include' })
      expect(res.status).toBe(503)
      expect(real).not.toHaveBeenCalled()
    })
  it('Request и URL тоже перехватываются', async () => {
    const { win, real } = fakeWindow()
    installMirrorFetchGuard(win)
    expect((await win.fetch(new URL('https://ai.synergify.com/api/x'))).status).toBe(503)
    expect((await win.fetch(new Request('https://ai.synergify.com/api/y'))).status).toBe(503)
    expect(real).not.toHaveBeenCalled()
  })
  it('остальное идёт в настоящий fetch', async () => {
    const { win, real } = fakeWindow()
    installMirrorFetchGuard(win)
    const res = await win.fetch('/ts-gitbook/lessons/x/index.txt')
    expect(res.status).toBe(200)
    expect(real).toHaveBeenCalledTimes(1)
  })
})
