import { describe, it, expect } from 'vitest'
import { validateOutline, type CourseOutline } from './outline'

const good: CourseOutline = {
  name: { ru: 'Курс', en: 'Course' },
  modules: [
    {
      slug: '01-intro', level: 1,
      title: { ru: 'Введение', en: 'Intro' },
      description: { ru: 'Опис', en: 'Desc' },
      units: [
        { slug: 'u1-start', title: { ru: 'Старт', en: 'Start' }, objective: { ru: 'Цель', en: 'Goal' } },
        { slug: 'u2-next', title: { ru: 'Дальше', en: 'Next' }, objective: { ru: 'Цель2', en: 'Goal2' } },
      ],
    },
  ],
}

describe('validateOutline', () => {
  it('accepts a well-formed bilingual outline', () => {
    expect(validateOutline(good)).toEqual([])
  })
  it('flags a missing locale in a Bi field', () => {
    const bad = structuredClone(good); bad.modules[0].units[0].objective = { ru: 'Цель', en: '' }
    expect(validateOutline(bad).some(e => /objective/.test(e))).toBe(true)
  })
  it('flags a bad module slug', () => {
    const bad = structuredClone(good); bad.modules[0].slug = '1-intro'
    expect(validateOutline(bad).some(e => /module slug/.test(e))).toBe(true)
  })
  it('flags a bad unit slug', () => {
    const bad = structuredClone(good); bad.modules[0].units[0].slug = 'start'
    expect(validateOutline(bad).some(e => /unit slug/.test(e))).toBe(true)
  })
  it('flags duplicate module slugs', () => {
    const bad = structuredClone(good); bad.modules.push(structuredClone(good.modules[0]))
    expect(validateOutline(bad).some(e => /duplicate module/.test(e))).toBe(true)
  })
  it('flags duplicate unit slugs within a module', () => {
    const bad = structuredClone(good); bad.modules[0].units[1].slug = 'u1-start'
    expect(validateOutline(bad).some(e => /duplicate unit/.test(e))).toBe(true)
  })
  it('flags level < 1', () => {
    const bad = structuredClone(good); bad.modules[0].level = 0
    expect(validateOutline(bad).some(e => /level/.test(e))).toBe(true)
  })
  it('flags an empty course', () => {
    expect(validateOutline({ name: { ru: 'К', en: 'C' }, modules: [] }).some(e => /at least one module/.test(e))).toBe(true)
  })
})
