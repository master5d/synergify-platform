// packs/living-practice/course.config.ts
// Central course config — the single source of brand/domain/locale for the LMS engine.
// Second course-pack: «Тишина, в которой слышно» (курс академии S.A.S.H.A).
// Сайт не деплоится (status: coming-soon в LMS/registry.json) — домен здесь контрактный.

/** Bilingual string used across the LMS (course materials, syllabus, dictionaries). */
export interface Bi { ru: string; en: string }

export const COURSE = {
  name: 'Тишина, в которой слышно',
  shortName: 'Тишина, в которой слышно',
  fullName: {
    ru: 'Тишина, в которой слышно — курс школы синергемы',
    en: 'The Silence Where You Can Hear — a Synergema School course',
  } as Bi,
  // Single source of truth for SEO (sitemap/robots) and the PWA manifest. No trailing slash.
  domain: 'https://academy.synergify.com/praktika',
  locales: ['ru', 'en'] as const,
  /** Какие слои движка включены у этого курса. Ядро гейтит поверхности по флагам,
   *  а не по имени pack'а: курс без RPG не должен носить чужой квест-обвес. */
  features: {
    /** Квест-лог, профиль героя, синергемы, осколки. */
    rpg: false,
    /** Страница сертификата и ссылка на неё. */
    certificate: false,
  },
  /** Курс школы: нужна сессия и допуск академии; RPG-опросник профиля не нужен. */
  gates: { auth: true, intake: false, admission: true },
} as const
