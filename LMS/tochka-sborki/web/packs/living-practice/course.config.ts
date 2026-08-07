// packs/living-practice/course.config.ts
// Central course config — the single source of brand/domain/locale for the LMS engine.
// Second course-pack: «Практика в живой связи» (курс академии S.A.S.H.A).
// Сайт не деплоится (status: coming-soon в LMS/registry.json) — домен здесь контрактный.

/** Bilingual string used across the LMS (course materials, syllabus, dictionaries). */
export interface Bi { ru: string; en: string }

export const COURSE = {
  name: 'Практика в живой связи',
  shortName: 'Практика в живой связи',
  fullName: {
    ru: 'Практика в живой связи — курс школы синергемы',
    en: 'Practice in Living Connection — a Synergema School course',
  } as Bi,
  // Single source of truth for SEO (sitemap/robots) and the PWA manifest. No trailing slash.
  domain: 'https://praktika.synergify.com',
  locales: ['ru', 'en'] as const,
} as const
