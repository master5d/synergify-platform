// packs/one-to-one/course.config.ts
// Центральная конфигурация открытого курса «Один на один и дальше».
export interface Bi { ru: string; en: string }

export const COURSE = {
  name: 'Один на один и дальше',
  shortName: 'Один на один и дальше',
  fullName: {
    ru: 'Один на один и дальше — курс школы синергемы',
    en: 'One to One and Beyond — a Synergema School course',
  } as Bi,
  description: {
    ru: 'Как работа один на один перестаёт быть потолком: карта практики, метод на одной странице, предел часов и цены, первый шаг к мини-группе.',
    en: 'How one-to-one work stops being a ceiling: a map of your practice, a one-page method, the limit of hours and price, the first step to a mini-group.',
  } as Bi,
  domain: 'https://academy.synergify.com/odin-na-odin',
  progressKey: 'one-to-one',
  locales: ['ru', 'en'] as const,
  lessonViews: { summaryDefault: 'paraphrase' as 'paraphrase' | 'verbatim' },
  pedagogy: { pretest: false, thinkFirst: false, fadeByChecks: false },
  features: { rpg: false, certificate: false, graduateRetro: false, assemblyMap: false },
  gates: { auth: false, intake: false, admission: false },
  mirrorUrl: null as string | null,
} as const
