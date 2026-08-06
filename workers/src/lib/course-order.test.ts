import { describe, it, expect } from 'vitest'
import { MODULE_ORDER, nextLesson, lessonUrl, homeUrl } from './course-order'

describe('nextLesson', () => {
  it('returns the first module when nothing is done', () => {
    expect(nextLesson(new Set(), new Set())).toEqual({ slug: '00-kickstart', resume: false })
  })

  it('returns the earliest incomplete module (no-skip)', () => {
    const completed = new Set(['00-kickstart', '01-introduction'])
    expect(nextLesson(completed, completed)).toEqual({ slug: '02-setup-guide', resume: false })
  })

  it('marks resume when the next module was viewed but not completed', () => {
    const completed = new Set(['00-kickstart'])
    const viewed = new Set(['00-kickstart', '01-introduction'])
    expect(nextLesson(completed, viewed)).toEqual({ slug: '01-introduction', resume: true })
  })

  it('returns null when every module is completed', () => {
    const all = new Set(MODULE_ORDER)
    expect(nextLesson(all, all)).toBeNull()
  })
})

describe('lessonUrl / homeUrl', () => {
  it('builds ru and en lesson URLs', () => {
    expect(lessonUrl('02-setup-guide', 'ru')).toBe('https://ai.synergify.com/lessons/02-setup-guide/')
    expect(lessonUrl('02-setup-guide', 'en')).toBe('https://ai.synergify.com/en/lessons/02-setup-guide/')
  })
  it('builds ru and en home URLs', () => {
    expect(homeUrl('ru')).toBe('https://ai.synergify.com/')
    expect(homeUrl('en')).toBe('https://ai.synergify.com/en/')
  })
})
