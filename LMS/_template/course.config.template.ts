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
  // One sentence for link previews (meta description, Open Graph) and the PWA manifest.
  description: {
    ru: 'TODO: Одна фраза о курсе',
    en: 'TODO: One sentence about the course',
  } as Bi,
  // Production domain. https, NO trailing slash. Used by sitemap/robots/manifest.
  domain: 'https://TODO.example.com',
  // Read-only mirror URL (GitHub Pages build with COURSE_MIRROR=1), no trailing slash; null = no mirror.
  // When set, the main site injects a watchdog that links to the mirror if the page fails to load.
  mirrorUrl: null as string | null,
  locales: ['ru', 'en'] as const,
  publisher: 'TODO: Publisher',
  features: {
    /** Сквозная картина: машина, которую собирает ученик (components/assembly, спека 2026-10-12-assembly-map). */
    assemblyMap: false,
  },
} as const
