// TEMPLATE — copy to web/lib/course.ts and fill in. Mirror of the COURSE shape.
// Central course config: the single source of brand/domain/locale for the LMS engine.

export interface Bi { ru: string; en: string }

export const COURSE = {
  name: 'TODO: Course Name',
  shortName: 'TODO: Short',
  fullName: {
    ru: 'TODO: Полное название — подзаголовок',
    en: 'TODO: Full Name — subtitle',
  } as Bi,
  // Production domain. https, NO trailing slash. Used by sitemap/robots/manifest.
  domain: 'https://TODO.example.com',
  locales: ['ru', 'en'] as const,
  publisher: 'TODO: Publisher',
} as const
