import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

let currentPath = '/'
vi.mock('next/navigation', () => ({ usePathname: () => currentPath }))
vi.mock('@/lib/mirror', async (orig) => ({ ...(await orig<typeof import('@/lib/mirror')>()), IS_MIRROR: true }))

import { MirrorShell } from '../components/mirror-shell'
// Домен основного сайта — активного pack'а (CI гоняет тесты под каждым), не литерал.
import { MAIN_SITE } from '@/lib/mirror'

const render = (path: string) => {
  currentPath = path
  return renderToStaticMarkup(<MirrorShell><main>PAGE-BODY</main></MirrorShell>)
}

describe('MirrorShell в зеркале', () => {
  beforeEach(() => { currentPath = '/' })
  it('юнит: плашка + содержимое', () => {
    const html = render('/lessons/01-introduction/u1-activation/')
    expect(html).toContain('data-mirror-banner')
    expect(html).toContain('PAGE-BODY')
    expect(html).toContain(`${MAIN_SITE}/lessons/01-introduction/u1-activation/`)
  })
  it('серверный маршрут: заглушка вместо содержимого', () => {
    const html = render('/login/')
    expect(html).toContain('data-mirror-stub')
    expect(html).not.toContain('PAGE-BODY')
    expect(html).toContain(`href="${MAIN_SITE}/login/"`)
    expect(html).toContain('Это доступно на основном сайте')
  })
  it('английский серверный маршрут — заглушка на английском', () => {
    const html = render('/en/dashboard/')
    expect(html).toContain('This is available on the main site')
    expect(html).toContain(`href="${MAIN_SITE}/en/dashboard/"`)
  })
})
