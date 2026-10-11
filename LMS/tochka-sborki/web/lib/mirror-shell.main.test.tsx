import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({ usePathname: () => '/login/' }))

import { MirrorShell } from '../components/mirror-shell'

describe('MirrorShell в основной сборке', () => {
  it('ничего не добавляет и ничего не прячет', () => {
    expect(renderToStaticMarkup(<MirrorShell><main>PAGE-BODY</main></MirrorShell>)).toBe('<main>PAGE-BODY</main>')
  })
})
