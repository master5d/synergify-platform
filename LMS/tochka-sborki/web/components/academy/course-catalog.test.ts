import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'course-catalog.tsx'), 'utf8')

describe('CourseCatalog', () => {
  it('is registry-driven via resolveCourses, no hardcoded course names', () => {
    expect(src).toContain('resolveCourses')
    expect(src).not.toMatch(/Точка Сборки|Tochka Sborki/)
  })

  it('copy comes from the academy dictionary', () => {
    expect(src).toContain('academy.catalogTitle')
    expect(src).toContain('academy.comingSoon')
    expect(src).not.toMatch(/Курсы академии|Academy courses/)
  })

  it('coming-soon cards are unlinked, live cards link out safely', () => {
    expect(src).toMatch(/status === 'live'/)
    expect(src).toContain('rel="noopener noreferrer"')
  })
})
