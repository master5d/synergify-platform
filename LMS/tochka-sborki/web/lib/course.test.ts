import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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

  it('has a bilingual description of its own — the shared layout and manifest do not hardcode one course', () => {
    expect(COURSE.description.ru.trim().length).toBeGreaterThan(0)
    expect(COURSE.description.en.trim().length).toBeGreaterThan(0)
    for (const f of ['app/layout.tsx', 'app/manifest.ts']) {
      const src = readFileSync(join(process.cwd(), f), 'utf8')
      expect(src).toContain('COURSE.description.ru')
      expect(src).not.toContain('Открытый курс по AI-разработке')
    }
  })
})
