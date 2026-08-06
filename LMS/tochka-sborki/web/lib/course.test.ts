import { describe, it, expect } from 'vitest'
import { COURSE } from './course'

describe('COURSE config', () => {
  it('exposes a valid https domain (single source for SEO/manifest)', () => {
    expect(COURSE.domain).toMatch(/^https:\/\//)
    expect(COURSE.domain).not.toMatch(/\/$/) // no trailing slash
  })

  it('declares ru and en locales', () => {
    expect(COURSE.locales).toContain('ru')
    expect(COURSE.locales).toContain('en')
  })

  it('has a non-empty name and bilingual full name', () => {
    expect(COURSE.name.length).toBeGreaterThan(0)
    expect(COURSE.fullName.ru.length).toBeGreaterThan(0)
    expect(COURSE.fullName.en.length).toBeGreaterThan(0)
  })
})
