import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AuthGuard } from './auth-guard'

// useEffect (и его fetch('/api/auth/me')) не выполняется под renderToStaticMarkup — это
// ровно первый кадр до ответа сервера: раньше он был `return null` (intake LMS#16, «пустой
// экран»). Реакция на сам ответ/reject — чистая checkAuth() в lib/auth-check.test.ts.
describe('AuthGuard (first paint, before /api/auth/me answers)', () => {
  it('is not an empty screen — shows an aria-busy indicator with dictionary text, not children', () => {
    const html = renderToStaticMarkup(
      <AuthGuard locale="ru"><p>secret lesson</p></AuthGuard>
    )
    expect(html).not.toBe('')
    expect(html).not.toContain('secret lesson')
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('role="status"')
    expect(html).toContain('Проверяем вход')
  })

  it('en locale text', () => {
    const html = renderToStaticMarkup(
      <AuthGuard locale="en"><p>secret lesson</p></AuthGuard>
    )
    expect(html).toContain('Checking your sign-in')
  })
})
