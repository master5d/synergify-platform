import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { renderToStaticMarkup } from 'react-dom/server'
import { GraduateRetroForm } from './graduate-retro-form'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'graduate-retro-form.tsx'), 'utf8')

describe('GraduateRetroForm — render (SSR default: logged out)', () => {
  it('renders nothing before the auth check resolves — never shown to a guest (SSR has no effects)', () => {
    const html = renderToStaticMarkup(<GraduateRetroForm locale="ru" />)
    expect(html).toBe('')
  })

  it('en locale mounts the same way (nothing, until /api/auth/me confirms a graduate)', () => {
    const html = renderToStaticMarkup(<GraduateRetroForm locale="en" />)
    expect(html).toBe('')
  })
})

describe('GraduateRetroForm — wiring (source)', () => {
  it('only shows for a logged-in student: gates on fetchIsGraduate(/api/auth/me), not on name alone', () => {
    expect(src).toContain('fetchIsGraduate(fetch)')
    expect(src).toContain('if (!authed) return null')
  })

  it('all four questions have real <label htmlFor>, wired to the textarea id', () => {
    expect(src).toMatch(/<label htmlFor=\{fieldId\}/)
    expect(src).toContain('id={fieldId}')
    expect(src).toMatch(/FIELD_KEYS: RetroFieldKey\[\] = \['before', 'after', 'prompt', 'plan', 'review'\]/)
  })

  it('validation errors are visible: role="alert", tied via aria-describedby, not color-only', () => {
    expect(src).toContain('validateRetro(fields)')
    expect(src).toContain('aria-invalid={hasError}')
    expect(src).toContain('aria-describedby={hasError ? errorId : undefined}')
    expect(src).toMatch(/role="alert"[\s\S]*?\{t\.requiredError\}/)
  })

  it('submits through the existing API with credentials, like the neighboring certificate-page fetches', () => {
    expect(src).toContain('submitRetro(fetch, fields, locale)')
  })

  it('lets the student download plan + before/after as their own .md file, client-side', () => {
    expect(src).toContain('buildRetroMarkdown(')
    expect(src).toContain("type: 'text/markdown;charset=utf-8'")
    expect(src).toContain(".download = 'graduate-retro.md'")
  })

  it('the download button does not require a successful submit first (client-only, independent of network)', () => {
    const start = src.indexOf('function downloadMarkdown')
    const downloadFn = src.slice(start, src.indexOf('\n  }', start))
    expect(downloadFn).not.toMatch(/fetch\(/)
  })
})

describe('GraduateRetroForm — course-config gating (certificate page)', () => {
  const certPage = readFileSync(join(HERE, 'pages', 'certificate-page.tsx'), 'utf8')

  it('certificate page only renders the retro block when the course pack turns the feature on', () => {
    expect(certPage).toContain('COURSE.features.graduateRetro && <GraduateRetroForm')
  })
})
