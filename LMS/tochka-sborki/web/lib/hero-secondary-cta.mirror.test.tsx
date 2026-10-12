import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/link', () => ({ default: (p: { href: string; children: React.ReactNode }) => <a href={p.href}>{p.children}</a> }))
vi.mock('@/lib/mirror', async (orig) => ({ ...(await orig<typeof import('@/lib/mirror')>()), IS_MIRROR: true }))

import { HeroSecondaryCta } from '../components/hero-secondary-cta'

describe('HeroSecondaryCta в зеркале', () => {
  it('ссылка «Войти» гостя скрыта', () => {
    expect(renderToStaticMarkup(<HeroSecondaryCta locale="ru" />)).toBe('')
  })
})
