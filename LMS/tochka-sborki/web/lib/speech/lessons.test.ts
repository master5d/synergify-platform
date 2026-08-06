import { describe, expect, it } from 'vitest'
import { SPEECH_PROSE, getSpeechProse, writtenSpeechSlugs } from './lessons'
import { SPEECH_COURSE } from './course'
import { lintDehustle } from '@/lib/authoring/dehustle'

const SLUGS = SPEECH_COURSE.lessons.map((l) => l.slug)

describe('speech prose', () => {
  it('every prose key matches a real lesson slug', () => {
    for (const key of Object.keys(SPEECH_PROSE)) {
      expect(SLUGS).toContain(key)
    }
  })

  it('written lessons carry both locales and enough substance', () => {
    for (const slug of writtenSpeechSlugs()) {
      const ru = getSpeechProse(slug, 'ru')
      const en = getSpeechProse(slug, 'en')
      expect(ru, `${slug} ru`).toBeTruthy()
      expect(en, `${slug} en`).toBeTruthy()
      // Урок — не заглушка: минимум ~200 слов на язык.
      expect(ru!.split(/\s+/).length, `${slug} ru length`).toBeGreaterThan(200)
      expect(en!.split(/\s+/).length, `${slug} en length`).toBeGreaterThan(200)
    }
  })

  it('prose is de-hustle clean in both locales', () => {
    for (const slug of writtenSpeechSlugs()) {
      expect(lintDehustle(getSpeechProse(slug, 'ru')!), `${slug} ru`).toEqual([])
      expect(lintDehustle(getSpeechProse(slug, 'en')!), `${slug} en`).toEqual([])
    }
  })

  // Девиз курса: «служа, а не манипулируя» — проза не должна учить давлению.
  it('never teaches pressure tactics as a recommended device', () => {
    const banned = [/заставить (?:их|аудиторию|слушателя)/i, /надавить на (?:жалость|стыд|страх)/i, /manipulat(?:e|ing) the audience/i, /make them feel guilty/i]
    for (const slug of writtenSpeechSlugs()) {
      for (const locale of ['ru', 'en'] as const) {
        const body = getSpeechProse(slug, locale)!
        for (const re of banned) expect(re.test(body), `${slug} ${locale} :: ${re}`).toBe(false)
      }
    }
  })

  it('unwritten lessons resolve to null and never get a page', () => {
    expect(getSpeechProse('definitely-not-a-lesson', 'ru')).toBeNull()
    for (const slug of SLUGS) {
      if (!SPEECH_PROSE[slug]) expect(writtenSpeechSlugs()).not.toContain(slug)
    }
  })
})
