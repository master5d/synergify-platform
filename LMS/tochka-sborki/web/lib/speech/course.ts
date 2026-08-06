// lib/speech/course.ts
// Speech/oratory course — S1 dark scaffold (fb_015e518d). ISOLATED from the Точка-Сборки AI course:
// lives here + app/speech/, never under content/{locale}/, so the AI-course scanners
// (getAllLessons/getNavigationItems/MODULE_SLUGS) can never pick it up. Engine+keyed-data mirrors
// lib/course/certificate.ts. The 6 lesson titles + one-line objectives are the methodological
// SKELETON (structure-only); the lesson prose is owner-authored later (S2–S5). Every string is
// de-hustle clean (course.test.ts asserts lintDehustle []).
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export interface SpeechLesson { slug: string; title: Bi; objective: Bi }
export interface SpeechCourse { title: Bi; tagline: Bi; lessons: SpeechLesson[] }

export const SPEECH_COURSE: SpeechCourse = {
  title: { ru: 'Ораторское мастерство', en: 'The Art of Speaking' },
  tagline: {
    ru: 'Говорить так, чтобы за тобой шли — служа, а не манипулируя.',
    en: 'Speak so people follow — by serving, not by manipulating.',
  },
  lessons: [
    {
      slug: 'prep',
      title: { ru: 'Подготовка речи', en: 'Preparing the talk' },
      objective: {
        ru: 'Понять, зачем ты выходишь говорить, и собрать материал под живую цель.',
        en: "Know why you're speaking, and gather material around a living goal.",
      },
    },
    {
      slug: 'plan',
      title: { ru: 'План выступления', en: 'Structuring the talk' },
      objective: {
        ru: 'Собрать выступление в ясную структуру под аудиторию и тайминг.',
        en: 'Shape the talk into a clear structure for your audience and timing.',
      },
    },
    {
      slug: 'devices',
      title: { ru: 'Ораторские приёмы', en: 'Rhetorical devices' },
      objective: {
        ru: 'Освоить приёмы, что держат внимание без давления.',
        en: 'Learn devices that hold attention without pressure.',
      },
    },
    {
      slug: 'delivery',
      title: { ru: 'Техника произнесения', en: 'Delivery' },
      objective: {
        ru: 'Владеть голосом: интонация, дикция, артикуляция, темп, пауза, жест.',
        en: 'Own your voice: intonation, diction, articulation, tempo, pause, gesture.',
      },
    },
    {
      slug: 'memory',
      title: { ru: 'Запоминание текста', en: 'Holding the text' },
      objective: {
        ru: 'Держать текст без зубрёжки — через смысл и опоры.',
        en: 'Hold your text without cramming — through meaning and anchors.',
      },
    },
    {
      slug: 'audience',
      title: { ru: 'Работа с аудиторией', en: 'Working with the audience' },
      objective: {
        ru: 'Быть в контакте с залом: удерживать внимание и отвечать живо.',
        en: 'Stay in contact with the room: hold attention and respond alive.',
      },
    },
  ],
}

export interface ResolvedSpeechLesson { slug: string; title: string; objective: string }
export interface ResolvedSpeechCourse { title: string; tagline: string; lessons: ResolvedSpeechLesson[] }

export function resolveSpeechCourse(locale: Locale, source: SpeechCourse = SPEECH_COURSE): ResolvedSpeechCourse {
  return {
    title: source.title[locale],
    tagline: source.tagline[locale],
    lessons: source.lessons.map(l => ({ slug: l.slug, title: l.title[locale], objective: l.objective[locale] })),
  }
}
