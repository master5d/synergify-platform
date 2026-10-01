import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { renderToStaticMarkup } from 'react-dom/server'
import { CareForm } from './care-form'
import { CarePage } from '../pages/care-page'

// Nav тянет ThemeProvider-контекст — для статики страницы он не нужен.
vi.mock('@/components/nav', () => ({ Nav: () => null }))

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'care-form.tsx'), 'utf8')

describe('CareForm — render (SSR)', () => {
  it('renders the closed topic list, labelled fields and the honeypot', () => {
    const html = renderToStaticMarkup(<CareForm locale="ru" site="tochka-sborki" />)
    for (const t of ['Вход и доступ', 'Застрял в уроке', 'Вопрос по содержанию', 'Техническая проблема', 'Предложение', 'Другое']) expect(html).toContain(t)
    for (const id of ['care-topic', 'care-message', 'care-email', 'care-page']) expect(html).toContain(`for="${id}"`)
    expect(html).toContain('name="company"')
    expect(html).toMatch(/type="url"/)
  })

  it('en locale', () => {
    expect(renderToStaticMarkup(<CareForm locale="en" site="academy" />)).toContain('Stuck in a lesson')
  })
})

describe('CareForm — wiring (source)', () => {
  it('prefills the email of a signed-in learner and submits through /api/care helpers', () => {
    expect(src).toContain('fetchCareEmail(fetch)')
    expect(src).toContain('submitCare(fetch, fields, { site, locale })')
  })
  it('validation errors are announced (role="alert") and tied to fields', () => {
    expect(src).toContain('validateCareFields(fields)')
    expect(src).toMatch(/role="alert"[\s\S]*?\{t\.requiredError\}/)
    expect(src).toContain("aria-invalid={err('topic')}")
  })
})

describe('CarePage', () => {
  it('says what we help with and when we answer, links /feedback and /ama', () => {
    const html = renderToStaticMarkup(<CarePage locale="ru" />)
    expect(html).toContain('Служба заботы')
    expect(html).toContain('в течение 2 рабочих дней')
    expect(html).toMatch(/href="\/feedback\/?"/)
    expect(html).toMatch(/href="\/ama\/?"/)
    expect(html).not.toMatch(/href="\/support/)
  })
  it('en page links the /en/ neighbours', () => {
    const html = renderToStaticMarkup(<CarePage locale="en" />)
    expect(html).toMatch(/href="\/en\/feedback\/?"/)
    expect(html).toMatch(/href="\/en\/ama\/?"/)
  })
})
