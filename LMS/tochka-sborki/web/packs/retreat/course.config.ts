// packs/retreat/course.config.ts
// Central course config — the single source of brand/domain/locale for the LMS engine.
// Третий course-pack: «Ретрит с двух сторон» (курс академии S.A.S.H.A) — ядро и треки ведущего и площадки.
// Живёт в подпути академии academy.synergify.com/retrit (LMS/registry.json).

/** Bilingual string used across the LMS (course materials, syllabus, dictionaries). */
export interface Bi { ru: string; en: string }

export const COURSE = {
  name: 'Ретрит с двух сторон',
  shortName: 'Ретрит с двух сторон',
  fullName: {
    ru: 'Ретрит с двух сторон — курс школы синергемы',
    en: 'A Retreat From Both Sides — a Synergema School course',
  } as Bi,
  // Single source of truth for SEO (sitemap/robots) and the PWA manifest. No trailing slash.
  domain: 'https://academy.synergify.com/retrit',
  /** Ключ курса в платформенном прогрессе (progress.course воркера, события → Listmonk). */
  progressKey: 'retreat',
  locales: ['ru', 'en'] as const,
  /** Представления урока (LMS#8): пересказ по умолчанию — тема не деликатная; каждый пересказ
   *  вычитывается до коммита (spec 2026-10-17-retreat-course-design §4). */
  lessonViews: { summaryDefault: 'paraphrase' as 'paraphrase' | 'verbatim' },
  /** Педагогика (intake LMS#20). pretest включён: перед юнитом с цифрами гость сначала угадывает
   *  (где безубыточность, кто несёт недобор), потом считает в калькуляторе. thinkFirst выключен — лишний
   *  барьер для открытого курса. fadeByChecks выключен: компаньон без профиля, сдвигать нечего. */
  pedagogy: { pretest: true, thinkFirst: false, fadeByChecks: false },
  /** Какие слои движка включены у этого курса. Ядро гейтит поверхности по флагам,
   *  а не по имени pack'а: курс без RPG не должен носить чужой квест-обвес. */
  features: {
    /** Квест-лог, профиль героя, синергемы, осколки. */
    rpg: false,
    /** Страница сертификата и ссылка на неё. */
    certificate: false,
    /** Ретро выпускника (до/после, промпт, план) на странице сертификата. */
    graduateRetro: false,
    /** Сквозная картина: машина, которую собирает ученик (components/assembly, спека 2026-10-12-assembly-map). */
    assemblyMap: false,
  },
  /** Открытый курс — вход в линии B/C: уроки читаются без входа и без допуска академии.
   *  Прогресс без входа живёт в браузере и уходит на сервер после логина. */
  gates: { auth: false, intake: false, admission: false },
  /** Зеркала для чтения у курса нет — «сторож» основного сайта не ставится (lib/mirror-watchdog.ts). */
  mirrorUrl: null as string | null,
} as const
