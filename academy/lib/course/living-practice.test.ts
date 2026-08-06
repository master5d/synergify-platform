import { describe, expect, it } from 'vitest'
import { LESSONS, courseCard, getLesson, resolveCourse } from './living-practice'

// Локальная копия бан-листа (monorepo-boundary: lib/authoring/dehustle.ts живёт
// в LMS-аппе и отсюда не импортируется — прецедент EFFORT_KEYS в worker).
// Scarcity/hustle + обещания, запрещённые курсу о практике.
const BANNED: { re: RegExp; label: string }[] = [
  { re: /только сегодня|успей|осталось мест|скидк/iu, label: 'scarcity RU' },
  { re: /limited time|only today|seats left|discount/i, label: 'scarcity EN' },
  // Только обещающие формы: «не гарантирует» — честная анти-реклама, её не баним.
  { re: /гарантиру(ем|ю)\b|гарантированн/iu, label: 'guarantee RU' },
  { re: /we guarantee|guaranteed\b/i, label: 'guarantee EN' },
  { re: /исцелит|вылечит|избавит от/iu, label: 'healing promise RU' },
  { re: /will (heal|cure)|cures\b/i, label: 'healing promise EN' },
  { re: /заменит (псих)?терапи|вместо (псих)?терапи/iu, label: 'therapy replacement RU' },
  { re: /replaces? (psycho)?therapy|instead of therapy/i, label: 'therapy replacement EN' },
  { re: /сверхспособност|пробудит в (тебе|вас)/iu, label: 'superpower promise RU' },
  { re: /superpowers?\b|will awaken/i, label: 'superpower promise EN' },
  { re: /секретн(ая|ый|ое) (техник|метод|знан)/iu, label: 'secret technique RU' },
  { re: /secret (technique|method|knowledge)/i, label: 'secret technique EN' },
]

// Источник анонимен: ни имени автора разбора, ни адресов курса-мишени.
const SOURCE_LEAK = /випассан|vipassana|MBCT|кабат-зинн онлайн/iu

const wordCount = (paras: string[]) => paras.join(' ').split(/\s+/).filter(Boolean).length

describe('living-practice course guard', () => {
  it('has 6 lessons with unique slugs', () => {
    expect(LESSONS).toHaveLength(6)
    expect(new Set(LESSONS.map((l) => l.slug)).size).toBe(6)
  })

  for (const lesson of LESSONS) {
    describe(lesson.slug, () => {
      it('carries both locales, ≥200 words each', () => {
        for (const locale of ['ru', 'en'] as const) {
          expect(lesson.title[locale]).toBeTruthy()
          expect(lesson.summary[locale]).toBeTruthy()
          expect(lesson.prose[locale].length).toBeGreaterThan(0)
          expect(wordCount(lesson.prose[locale]), `${lesson.slug}/${locale} words`).toBeGreaterThanOrEqual(200)
        }
      })

      it('is free of hustle and practice-promises', () => {
        const all = (['ru', 'en'] as const)
          .flatMap((l) => [lesson.title[l], lesson.summary[l], ...lesson.prose[l]])
          .join('\n')
        for (const { re, label } of BANNED) {
          expect(re.test(all), `${lesson.slug}: ${label} → ${all.match(re)?.[0] ?? ''}`).toBe(false)
        }
        expect(SOURCE_LEAK.test(all), `${lesson.slug}: source leak`).toBe(false)
      })
    })
  }

  it('resolveCourse returns full copy in both locales', () => {
    for (const locale of ['ru', 'en'] as const) {
      const c = resolveCourse(locale)
      expect(c.heading).toBeTruthy()
      expect(c.intro.length).toBeGreaterThan(0)
      expect(c.lessons).toHaveLength(6)
      expect(c.metaTitle).toContain('S.A.S.H.A')
    }
  })

  it('getLesson resolves every slug, orders next-links, rejects unknown', () => {
    for (const locale of ['ru', 'en'] as const) {
      LESSONS.forEach((l, i) => {
        const view = getLesson(l.slug, locale)
        expect(view).not.toBeNull()
        expect(view!.index).toBe(i + 1)
        if (i < LESSONS.length - 1) expect(view!.next?.slug).toBe(LESSONS[i + 1].slug)
        else expect(view!.next).toBeNull()
      })
    }
    expect(getLesson('net-takogo', 'ru')).toBeNull()
  })

  it('courseCard links locale-correct internal route', () => {
    expect(courseCard('ru').href).toBe('/praktika/')
    expect(courseCard('en').href).toBe('/en/praktika/')
  })
})
