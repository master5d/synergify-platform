// Блок кода в сборке зеркала: команды нашего установщика ведут в зеркало, а не на режущийся домен.
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ComponentType, ReactNode } from 'react'

vi.mock('@/lib/mirror', async (orig) => ({ ...(await orig<typeof import('@/lib/mirror')>()), IS_MIRROR: true }))

import { mdxComponents } from '../components/mdx-components'
import { MAIN_SITE } from './mirror'
import { COURSE } from './course'

const Code = mdxComponents.code as ComponentType<{ children?: ReactNode }>

// Зеркало есть только у курса с COURSE.mirrorUrl (tochka-sborki); у остальных pack'ов проверять нечего.
describe.runIf(Boolean(COURSE.mirrorUrl))('code в зеркале', () => {
  it('адрес установщика основного сайта → тот же файл в зеркале', () => {
    const html = renderToStaticMarkup(<Code>{`curl -fsSL ${MAIN_SITE}/install-gfw.sh | bash -s -- --ru`}</Code>)
    expect(html).toContain(`${COURSE.mirrorUrl}/install-gfw.sh | bash -s -- --ru`)
    expect(html).not.toContain(`${MAIN_SITE}/install`)
  })
  it('чужой установщик остаётся как есть', () => {
    const html = renderToStaticMarkup(<Code>curl -fsSL https://claude.ai/install.sh | bash</Code>)
    expect(html).toContain('https://claude.ai/install.sh')
  })
})
