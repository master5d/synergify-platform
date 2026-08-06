import { describe, expect, it } from 'vitest'
import { SPEEDREADING_PROSE, getSpeedreadingProse, writtenSpeedreadingSlugs } from './lessons'
import { SPEEDREADING_COURSE } from './course'
import { lintDehustle } from '@/lib/authoring/dehustle'

const SLUGS = SPEEDREADING_COURSE.lessons.map((l) => l.slug)

describe('speedreading prose', () => {
  it('every prose key matches a real lesson slug', () => {
    for (const key of Object.keys(SPEEDREADING_PROSE)) {
      expect(SLUGS).toContain(key)
    }
  })

  it('written lessons carry both locales and enough substance', () => {
    for (const slug of writtenSpeedreadingSlugs()) {
      const ru = getSpeedreadingProse(slug, 'ru')
      const en = getSpeedreadingProse(slug, 'en')
      expect(ru, `${slug} ru`).toBeTruthy()
      expect(en, `${slug} en`).toBeTruthy()
      // Урок — не заглушка: минимум ~200 слов на язык.
      expect(ru!.split(/\s+/).length, `${slug} ru length`).toBeGreaterThan(200)
      expect(en!.split(/\s+/).length, `${slug} en length`).toBeGreaterThan(200)
    }
  })

  it('prose is de-hustle clean in both locales', () => {
    for (const slug of writtenSpeedreadingSlugs()) {
      expect(lintDehustle(getSpeedreadingProse(slug, 'ru')!), `${slug} ru`).toEqual([])
      expect(lintDehustle(getSpeedreadingProse(slug, 'en')!), `${slug} en`).toEqual([])
    }
  })

  // Курс не имеет права обещать больше, чем даёт метод: «фотографическое чтение»
  // и тысячи слов в минуту без потери понимания — не наш жанр.
  it('never promises impossible reading speeds', () => {
    const banned = [/\b1\s?000\+?\s*(слов|wpm)/i, /\b[2-9]\d{3}\s*(слов|wpm)/i, /фотографическ\w+ чтени/i, /photo[- ]?reading/i]
    for (const slug of writtenSpeedreadingSlugs()) {
      for (const locale of ['ru', 'en'] as const) {
        const body = getSpeedreadingProse(slug, locale)!
        for (const re of banned) expect(re.test(body), `${slug} ${locale} :: ${re}`).toBe(false)
      }
    }
  })

  it('unwritten lessons resolve to null and never get a page', () => {
    expect(getSpeedreadingProse('definitely-not-a-lesson', 'ru')).toBeNull()
    for (const slug of SLUGS) {
      if (!SPEEDREADING_PROSE[slug]) expect(writtenSpeedreadingSlugs()).not.toContain(slug)
    }
  })
})
