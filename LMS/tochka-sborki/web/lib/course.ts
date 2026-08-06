// web/lib/course.ts
// Central course config — the single source of brand/domain/locale for the LMS engine.
// First scaffold brick toward a multi-course platform: engine reads COURSE, not hardcoded
// literals. A future course swaps this file (+ content) instead of editing the engine.

/** Bilingual string used across the LMS (course materials, syllabus, dictionaries). */
export interface Bi { ru: string; en: string }

export const COURSE = {
  name: 'Точка Сборки',
  shortName: 'Точка Сборки',
  fullName: {
    ru: 'Точка Сборки — курс по vibe-кодингу',
    en: 'Tochka Sborki — a course on vibe coding',
  } as Bi,
  // Single source of truth for SEO (sitemap/robots) and the PWA manifest. No trailing slash.
  domain: 'https://ai.synergify.com',
  locales: ['ru', 'en'] as const,
} as const
