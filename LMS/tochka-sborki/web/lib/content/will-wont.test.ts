import { describe, it, expect } from 'vitest'
import { getWillWont } from './will-wont'

describe('getWillWont', () => {
  for (const loc of ['ru', 'en'] as const) {
    it(`returns a full VM for course-intro (${loc})`, () => {
      const vm = getWillWont('course-intro', loc)
      expect(vm).not.toBeNull()
      expect(vm!.heading.length).toBeGreaterThan(0)
      expect(vm!.willLabel.length).toBeGreaterThan(0)
      expect(vm!.wontLabel.length).toBeGreaterThan(0)
      expect(vm!.punchline && vm!.punchline.length).toBeGreaterThan(0)
      expect(vm!.will.length).toBeGreaterThanOrEqual(1)
      expect(vm!.wont.length).toBeGreaterThanOrEqual(1)
      for (const s of [...vm!.will, ...vm!.wont]) expect(s.length).toBeGreaterThan(0)
    })
  }
  it('returns null for an unknown id', () => {
    expect(getWillWont('does-not-exist', 'ru')).toBeNull()
  })
  it('ru and en differ', () => {
    expect(getWillWont('course-intro', 'ru')!.heading).not.toBe(getWillWont('course-intro', 'en')!.heading)
    expect(getWillWont('course-intro', 'ru')!.will[0]).not.toBe(getWillWont('course-intro', 'en')!.will[0])
  })
})
