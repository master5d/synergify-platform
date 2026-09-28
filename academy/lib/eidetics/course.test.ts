import { describe, it, expect } from 'vitest'
import { EIDETICS_COURSE, isEideticsLive, resolveEideticsCourse } from './course'
import { SPEEDREADING_COURSE } from '../speedreading/course'
import { lintDehustle } from '../authoring/dehustle'
import { checkPromises } from './promises'

const strings = () => [
  EIDETICS_COURSE.title.ru, EIDETICS_COURSE.title.en,
  EIDETICS_COURSE.tagline.ru, EIDETICS_COURSE.tagline.en,
  ...EIDETICS_COURSE.lessons.flatMap(l => [l.title.ru, l.title.en, l.objective.ru, l.objective.en]),
]

describe('EIDETICS_COURSE', () => {
  it('has the 6 lessons of the spec skeleton, in order', () => {
    expect(EIDETICS_COURSE.lessons.map(l => l.slug)).toEqual([
      'images', 'chain', 'loci', 'numbers', 'names', 'spacing',
    ])
  })

  it('slugs are unique and never collide with speed-reading lessons or trainer routes', () => {
    const slugs = EIDETICS_COURSE.lessons.map(l => l.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    const taken = new Set([...SPEEDREADING_COURSE.lessons.map(l => l.slug), 'ryad', 'dvorec'])
    for (const s of slugs) {
      expect(taken.has(s), s).toBe(false)
      expect(s).not.toMatch(/^\d{2}-/)
    }
  })

  it('every lesson has an objective in both locales', () => {
    for (const l of EIDETICS_COURSE.lessons) {
      expect(l.objective.ru.length, l.slug).toBeGreaterThan(10)
      expect(l.objective.en.length, l.slug).toBeGreaterThan(10)
    }
  })

  it('is de-hustle clean and promise-clean in both locales', () => {
    for (const s of strings()) {
      expect(lintDehustle(s), s).toEqual([])
      expect(checkPromises(s), s).toEqual([])
    }
  })

  // Детская линия — потом отдельным набором текстов: скелет не завязан на взрослый контекст.
  it('objectives do not hard-wire an adult-only context', () => {
    const adult = /работ|коллег|совещан|клиент|карьер|\bwork|colleague|meeting|client|career/i
    for (const l of EIDETICS_COURSE.lessons) {
      expect(adult.test(l.objective.ru), l.slug).toBe(false)
      expect(adult.test(l.objective.en), l.slug).toBe(false)
    }
  })

  // Публикация — только после вычитки владельцем: смена на 'live' должна быть осознанной.
  it('ships as soon (not live) until the owner has reviewed it', () => {
    expect(EIDETICS_COURSE.status).toBe('soon')
    expect(isEideticsLive()).toBe(false)
    expect(isEideticsLive({ ...EIDETICS_COURSE, status: 'live' })).toBe(true)
  })
})

describe('resolveEideticsCourse', () => {
  it('localizes and keeps the status', () => {
    const ru = resolveEideticsCourse('ru')
    const en = resolveEideticsCourse('en')
    expect(ru.lessons).toHaveLength(6)
    expect(ru.title).not.toBe(en.title)
    expect(ru.status).toBe('soon')
  })
})
