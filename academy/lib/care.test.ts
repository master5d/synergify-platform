import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { careConfig, getCare } from './care'
import { getDictionary } from './dictionaries'

const APP = join(process.cwd(), 'app')

describe('care desk (служба заботы школы)', () => {
  it('reads the shared LMS/care.json: closed topic list, one response time', () => {
    const c = careConfig()
    expect(c.topics.map((t) => t.key)).toEqual(['access', 'stuck', 'content', 'tech', 'idea', 'other'])
    expect(getCare('ru').form.topics.map((t) => t.label)).toContain('Застрял в уроке')
    expect(getCare('ru').promises.join(' ')).toContain(c.responseTime.ru)
    expect(getCare('en').promises.join(' ')).toContain(c.responseTime.en)
    expect(getCare('ru').form.success).toContain(c.responseTime.ru)
  })

  it('has its own route in both locales', () => {
    expect(existsSync(join(APP, 'zabota', 'page.tsx'))).toBe(true)
    expect(existsSync(join(APP, 'en', 'zabota', 'page.tsx'))).toBe(true)
  })

  it('the footer "doors" link to the care desk in both locales', () => {
    expect(getDictionary('ru').academy.footer.links).toContainEqual({ label: 'Служба заботы', href: '/zabota/' })
    expect(getDictionary('en').academy.footer.links).toContainEqual({ label: 'Care desk', href: '/en/zabota/' })
  })

  it('never uses the acronym and never puts gold on paper as text (DESIGN.md)', () => {
    const page = readFileSync(join(process.cwd(), 'components', 'care-page.tsx'), 'utf8')
    const form = readFileSync(join(process.cwd(), 'components', 'care-form.tsx'), 'utf8')
    const copy = JSON.stringify([getCare('ru'), getCare('en')])
    expect(copy).not.toMatch(/S\.A\.S\.H\.A/)
    for (const src of [page, form]) expect(src).not.toMatch(/color:\s*'var\(--accent\)'/)
  })

  it('form posts to /api/care as the academy site, with a honeypot', () => {
    const form = readFileSync(join(process.cwd(), 'components', 'care-form.tsx'), 'utf8')
    expect(form).toContain("fetch('/api/care'")
    expect(form).toContain("site: 'academy'")
    expect(form).toContain('name="company"')
    expect(form).toContain("fetch('/api/auth/me', { credentials: 'include' })")
  })
})
