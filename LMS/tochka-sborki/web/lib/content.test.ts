import { describe, it, expect } from 'vitest'
import {
  getAllLessons, getLessonBySlug, getPageContent,
  isModule, getModuleMeta, getNavigationItems, getUnitContent,
} from './content'

describe('getAllLessons', () => {
  it('returns only flat numbered lesson files', () => {
    const lessons = getAllLessons()
    expect(lessons.length).toBe(0)  // all modules migrated to folder/unit structure
  })

  it('lessons are sorted by order ascending', () => {
    const lessons = getAllLessons()
    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i].order).toBeGreaterThan(lessons[i - 1].order)
    }
  })

  it('each lesson has required fields', () => {
    const lessons = getAllLessons()
    for (const lesson of lessons) {
      expect(typeof lesson.slug).toBe('string')
      expect(typeof lesson.title).toBe('string')
      expect(typeof lesson.description).toBe('string')
      expect(typeof lesson.order).toBe('number')
      expect(typeof lesson.duration).toBe('string')
      expect(typeof lesson.level).toBe('number')
    }
  })
})

describe('getLessonBySlug', () => {
  it('returns content and meta for 01-introduction unit', () => {
    const result = getUnitContent('01-introduction', 'u1-activation')
    expect(result.content).toBeTruthy()
    expect(result.unitMeta.title).toBe('Твой опыт с AI')
    expect(result.unitMeta.unit).toBe(1)
  })

  it('getModuleMeta returns correct data for 01-introduction', () => {
    const meta = getModuleMeta('01-introduction')
    expect(meta.title).toBe('Знакомство')
    expect(meta.units).toHaveLength(4)
    expect(meta.units[0].slug).toBe('u1-activation')
  })

  it('throws for unknown slug', () => {
    expect(() => getLessonBySlug('99-nonexistent')).toThrow()
  })
})

describe('getModuleMeta — all modules', () => {
  it('00-kickstart has correct shape', () => {
    const meta = getModuleMeta('00-kickstart')
    expect(meta.title).toBeTruthy()
    expect(meta.units.length).toBeGreaterThanOrEqual(1)
  })

  it('02-setup-guide has correct shape', () => {
    const meta = getModuleMeta('02-setup-guide')
    expect(meta.title).toBeTruthy()
    expect(meta.units.length).toBeGreaterThanOrEqual(1)
  })

  it('04-prompt-engineering has correct shape', () => {
    const meta = getModuleMeta('04-prompt-engineering')
    expect(meta.title).toBeTruthy()
    expect(meta.units.length).toBeGreaterThanOrEqual(1)
  })

  it('05-context-memory has correct shape', () => {
    const meta = getModuleMeta('05-context-memory')
    expect(meta.title).toBeTruthy()
    expect(meta.units.length).toBeGreaterThanOrEqual(1)
  })

  it('06-audio-pipeline has correct shape', () => {
    const meta = getModuleMeta('06-audio-pipeline')
    expect(meta.title).toBeTruthy()
    expect(meta.units.length).toBeGreaterThanOrEqual(1)
  })

  it('07-tools has correct shape', () => {
    const meta = getModuleMeta('07-tools')
    expect(meta.title).toBeTruthy()
    expect(meta.units.length).toBeGreaterThanOrEqual(1)
  })

  it('throws for unknown module', () => {
    expect(() => getModuleMeta('99-nonexistent')).toThrow()
  })
})

describe('getPageContent', () => {
  it('returns content and meta for cheatsheet', () => {
    const result = getPageContent('cheatsheet')
    expect(result.content).toBeTruthy()
    expect(result.meta.title).toBeTruthy()
  })

  it('returns content and meta for roadmap', () => {
    const result = getPageContent('roadmap')
    expect(result.content).toBeTruthy()
  })
})

describe('isModule', () => {
  it('returns false for flat lesson slug', () => {
    expect(isModule('cheatsheet')).toBe(false)
  })

  it('returns true for module slug', () => {
    expect(isModule('01-introduction')).toBe(true)
  })
})

describe('getNavigationItems', () => {
  it('returns array of NavigationItem with correct shape', () => {
    const items = getNavigationItems()
    expect(Array.isArray(items)).toBe(true)
    for (const item of items) {
      expect(['lesson', 'module']).toContain(item.type)
      expect(typeof item.slug).toBe('string')
      expect(typeof item.title).toBe('string')
    }
  })

  it('items are sorted by order ascending', () => {
    const items = getNavigationItems()
    for (let i = 1; i < items.length; i++) {
      expect(items[i].order).toBeGreaterThanOrEqual(items[i - 1].order)
    }
  })

  it('all items are modules', () => {
    const items = getNavigationItems()
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.type).toBe('module')
    }
  })
})
