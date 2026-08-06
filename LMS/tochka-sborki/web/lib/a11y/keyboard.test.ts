import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..') // web/
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')

describe('keyboard-nav a11y foundations', () => {
  it('globals.css defines a visible :focus-visible outline', () => {
    expect(read('app/globals.css')).toMatch(/:focus-visible\s*\{[^}]*outline/)
  })
  it('globals.css respects prefers-reduced-motion', () => {
    expect(read('app/globals.css')).toContain('prefers-reduced-motion: reduce')
  })
  it('globals.css defines a .skip-link revealed on focus', () => {
    const css = read('app/globals.css')
    expect(css).toContain('.skip-link')
    expect(css).toMatch(/\.skip-link:focus/)
  })
  it('Nav renders the SkipLink', () => {
    expect(read('components/nav.tsx')).toContain('SkipLink')
  })
  it('SkipLink targets #main-content with bilingual labels', () => {
    const c = read('components/skip-link.tsx')
    expect(c).toContain('#main-content')
    expect(c).toContain('Перейти к содержимому')
    expect(c).toContain('Skip to content')
  })
  it('the six core learner shells expose the #main-content target', () => {
    const shells = [
      'components/pages/mdx-page.tsx',
      'components/pages/module-page.tsx',
      'components/pages/unit-page.tsx',
      'components/pages/home-page.tsx',
      'components/pages/certificate-page.tsx',
      'components/lesson-layout.tsx',
    ]
    for (const f of shells) {
      expect(read(f), `${f} should have id="main-content"`).toContain('id="main-content"')
    }
  })
})
