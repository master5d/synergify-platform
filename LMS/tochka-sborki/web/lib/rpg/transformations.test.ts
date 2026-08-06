import { describe, it, expect } from 'vitest'
import { MODULE_SLUGS } from './modules'
import { MICRO_TRANSFORMATIONS, getTransformation } from './transformations'

describe('micro-transformations', () => {
  it('has a complete, non-empty bilingual record for every module slug', () => {
    for (const slug of MODULE_SLUGS) {
      const t = MICRO_TRANSFORMATIONS[slug]
      expect(t, `missing ${slug}`).toBeTruthy()
      expect(t.from.ru.trim().length).toBeGreaterThan(0)
      expect(t.from.en.trim().length).toBeGreaterThan(0)
      expect(t.to.ru.trim().length).toBeGreaterThan(0)
      expect(t.to.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('resolves localized strings that differ across locales', () => {
    const ru = getTransformation('01-introduction', 'ru')
    const en = getTransformation('01-introduction', 'en')
    expect(ru).toEqual({ from: '«ИИ — это про код»', to: 'понимаю четыре сдвига Software 3.0' })
    expect(en).toEqual({ from: '"AI is about code"', to: 'I grasp the four shifts of Software 3.0' })
    expect(ru!.to).not.toBe(en!.to)
  })

  it('includes the optional notebook module transformation', () => {
    expect(getTransformation('09-ai-notebook', 'ru')).toEqual({
      from: 'смотрю часами',
      to: 'извлекаю с уликами',
    })
    expect(getTransformation('09-ai-notebook', 'en')).toEqual({
      from: 'watch for hours',
      to: 'extract with evidence',
    })
  })

  it('returns null for an unknown slug', () => {
    expect(getTransformation('does-not-exist', 'ru')).toBeNull()
  })
})
