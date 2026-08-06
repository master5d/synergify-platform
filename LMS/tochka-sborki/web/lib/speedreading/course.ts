// lib/speedreading/course.ts
// Speed-reading course — Slice 1 dark skeleton (Скорочтение epic). ISOLATED from the
// Точка-Сборки AI course: lives here + app/speedreading/, never under content/{locale}/, so the
// AI-course scanners (getAllLessons/getNavigationItems/MODULE_SLUGS) can never pick it up.
// Engine+keyed-data mirrors lib/speech/course.ts. The 6 lesson titles + one-line objectives are
// the methodological SKELETON (structure-only); lesson prose is owner-authored later. Every string
// is de-hustle clean (course.test.ts asserts lintDehustle []). Methodology is public-domain
// speed-reading technique; no third-party copy is used.
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export interface SpeedreadingLesson { slug: string; title: Bi; objective: Bi }
export interface SpeedreadingCourse { title: Bi; tagline: Bi; lessons: SpeedreadingLesson[] }

export const SPEEDREADING_COURSE: SpeedreadingCourse = {
  title: { ru: 'Скорочтение', en: 'Speed Reading' },
  tagline: {
    ru: 'Читать быстрее и удерживать больше — через тренировку внимания и глаз.',
    en: 'Read faster and remember more — by training your eyes and attention.',
  },
  lessons: [
    {
      slug: 'baseline',
      title: { ru: 'Замер и привычки', en: 'Baseline & habits' },
      objective: {
        ru: 'Понять текущую скорость чтения и что её тормозит.',
        en: 'See your current reading speed and what slows it down.',
      },
    },
    {
      slug: 'regression',
      title: { ru: 'Возвраты глаз', en: 'Eliminating regression' },
      objective: {
        ru: 'Перестать неосознанно перечитывать назад.',
        en: 'Stop unconsciously re-reading backwards.',
      },
    },
    {
      slug: 'subvocalization',
      title: { ru: 'Внутренний голос', en: 'Quieting the inner voice' },
      objective: {
        ru: 'Ослабить внутреннее проговаривание, чтобы читать быстрее речи.',
        en: 'Ease the inner voicing so you read faster than speech.',
      },
    },
    {
      slug: 'peripheral',
      title: { ru: 'Периферийное зрение', en: 'Widening the gaze' },
      objective: {
        ru: 'Захватывать взглядом блоки слов, а не отдельные буквы.',
        en: 'Take in blocks of words at a glance, not single letters.',
      },
    },
    {
      slug: 'comprehension',
      title: { ru: 'Удержание смысла', en: 'Holding the meaning' },
      objective: {
        ru: 'Вытаскивать ключевое и держать структуру текста.',
        en: "Pull out the key points and hold the text's structure.",
      },
    },
    {
      slug: 'retention',
      title: { ru: 'Долгая память', en: 'Making it stick' },
      objective: {
        ru: 'Возвращаться к прочитанному так, чтобы оно осталось.',
        en: 'Revisit what you read so it stays with you.',
      },
    },
  ],
}

export interface ResolvedSpeedreadingLesson { slug: string; title: string; objective: string }
export interface ResolvedSpeedreadingCourse { title: string; tagline: string; lessons: ResolvedSpeedreadingLesson[] }

export function resolveSpeedreadingCourse(
  locale: Locale,
  source: SpeedreadingCourse = SPEEDREADING_COURSE,
): ResolvedSpeedreadingCourse {
  return {
    title: source.title[locale],
    tagline: source.tagline[locale],
    lessons: source.lessons.map(l => ({ slug: l.slug, title: l.title[locale], objective: l.objective[locale] })),
  }
}
