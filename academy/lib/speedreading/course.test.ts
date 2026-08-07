import { describe, it, expect } from 'vitest'
import { SPEEDREADING_COURSE, resolveSpeedreadingCourse } from './course'
import { lintDehustle } from '../authoring/dehustle'

describe('SPEEDREADING_COURSE', () => {
  it('has exactly the 6 expected lesson slugs in order', () => {
    expect(SPEEDREADING_COURSE.lessons.map(l => l.slug)).toEqual([
      'baseline', 'regression', 'subvocalization', 'peripheral', 'comprehension', 'retention',
    ])
  })

  it('has unique slugs', () => {
    const slugs = SPEEDREADING_COURSE.lessons.map(l => l.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('isolation: no lesson slug looks like an AI-course NN- entry', () => {
    for (const l of SPEEDREADING_COURSE.lessons) {
      expect(l.slug).not.toMatch(/^\d{2}-/)
    }
  })

  it('is de-hustle clean across title, tagline, and every lesson field (both locales)', () => {
    const strings = [
      SPEEDREADING_COURSE.title.ru, SPEEDREADING_COURSE.title.en,
      SPEEDREADING_COURSE.tagline.ru, SPEEDREADING_COURSE.tagline.en,
      ...SPEEDREADING_COURSE.lessons.flatMap(l => [l.title.ru, l.title.en, l.objective.ru, l.objective.en]),
    ]
    for (const s of strings) expect(lintDehustle(s)).toEqual([])
  })
})

describe('resolveSpeedreadingCourse', () => {
  it('returns 6 lessons with non-empty localized fields', () => {
    for (const loc of ['ru', 'en'] as const) {
      const r = resolveSpeedreadingCourse(loc)
      expect(r.title.length).toBeGreaterThan(0)
      expect(r.tagline.length).toBeGreaterThan(0)
      expect(r.lessons).toHaveLength(6)
      for (const l of r.lessons) {
        expect(l.title.length).toBeGreaterThan(0)
        expect(l.objective.length).toBeGreaterThan(0)
      }
    }
  })

  it('localizes (a sampled field differs between ru and en)', () => {
    expect(resolveSpeedreadingCourse('ru').tagline).not.toBe(resolveSpeedreadingCourse('en').tagline)
  })

  it('accepts an injected fixture source', () => {
    const fixture = {
      title: { ru: 'Т', en: 'T' }, tagline: { ru: 'таг', en: 'tag' },
      lessons: [{ slug: 'x', title: { ru: 'а', en: 'a' }, objective: { ru: 'о', en: 'o' } }],
    }
    const r = resolveSpeedreadingCourse('en', fixture)
    expect(r.lessons[0].title).toBe('a')
  })
})
