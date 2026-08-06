import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'course-switcher.tsx'), 'utf8')
const footerSrc = readFileSync(join(HERE, '..', 'footer.tsx'), 'utf8')

describe('CourseSwitcher', () => {
  it('dark-ships: null-guard when there are no other live courses', () => {
    expect(src).toMatch(/others\.length === 0/)
    expect(src).toContain('return null')
  })

  it('is registry-driven via resolveOtherCourses with COURSE.domain as self', () => {
    expect(src).toContain('resolveOtherCourses')
    expect(src).toContain('COURSE.domain')
    expect(src).not.toMatch(/Точка Сборки|Tochka Sborki/)
  })

  it('labels from the academy dictionary, links open external safely', () => {
    expect(src).toContain('academy.switcherLabel')
    expect(src).toContain('rel="noopener noreferrer"')
  })
})

describe('Footer wiring', () => {
  it('footer renders CourseSwitcher', () => {
    expect(footerSrc).toContain('<CourseSwitcher locale={locale} />')
  })
})
