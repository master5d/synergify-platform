import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const NAV = readFileSync(join(HERE, 'nav.tsx'), 'utf8')

/**
 * BACKLOG «Вход и язык с возвратом»: «→ Войти» и EN/RU теряли `redirect` (переход
 * на урок → вход → после входа не туда), а на самой странице входа ссылка на
 * себя лишняя. Открытые вопросы (open-redirect, sanitizeInternalPath/withRedirectParam)
 * проверены с реальной логикой в lib/nav-links.test.ts — здесь только то, что nav.tsx
 * эту логику действительно вызывает, а не проверяет redirect как-то ещё, мимо неё.
 */
describe('«→ Войти» несёт redirect и прячется на самой странице входа', () => {
  it('login href строится через withRedirectParam + pagePath (basePath пака учтён)', () => {
    expect(NAV).toMatch(/const loginHref = withRedirectParam\(loginPath, pagePath\(pathname\)\)/)
  })

  it('ссылка на вход скрыта, когда мы уже на странице входа', () => {
    expect(NAV).toMatch(/isLoginPage = isActive\(loginPath\)/)
    expect(NAV).toMatch(/!isLoginPage \? \(/)
  })

  it('цель ≥24×24 (WCAG 2.5.8): у ссылки входа задан minHeight 24px', () => {
    const loginLinkBlock = /<Link\s+href=\{loginHref\}[\s\S]*?<\/Link>/.exec(NAV)?.[0] ?? ''
    expect(loginLinkBlock, 'блок ссылки входа не найден').not.toBe('')
    expect(loginLinkBlock).toMatch(/minHeight:\s*'24px'/)
  })
})

describe('EN/RU переключатель сохраняет redirect и достаёт цель 24×24', () => {
  it('otherHref пропускает текущий redirect через withRedirectParam', () => {
    expect(NAV).toMatch(/const otherHref = withRedirectParam\(otherHrefBase, redirectParam\)/)
  })

  it('redirectParam читается из URL на клиенте (без useSearchParams/Suspense)', () => {
    expect(NAV).toMatch(/new URLSearchParams\(window\.location\.search\)\.get\('redirect'\)/)
  })

  it('цель ≥24×24: у EN/RU задан minHeight 24px', () => {
    const langLinkBlock = /\{\/\* Language switcher \*\/\}[\s\S]*?<\/Link>/.exec(NAV)?.[0] ?? ''
    expect(langLinkBlock, 'блок языкового переключателя не найден').not.toBe('')
    expect(langLinkBlock).toMatch(/minHeight:\s*'24px'/)
  })
})
