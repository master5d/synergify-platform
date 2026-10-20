// packs/living-practice/course.config.ts
// Central course config — the single source of brand/domain/locale for the LMS engine.
// Second course-pack: «Тишина, в которой слышно» (курс академии S.A.S.H.A).
// Живёт в подпути академии academy.synergify.com/praktika (status: live в LMS/registry.json).

/** Bilingual string used across the LMS (course materials, syllabus, dictionaries). */
export interface Bi { ru: string; en: string }

export const COURSE = {
  name: 'Тишина, в которой слышно',
  shortName: 'Тишина, в которой слышно',
  fullName: {
    ru: 'Тишина, в которой слышно — курс школы синергемы',
    en: 'The Silence Where You Can Hear — a Synergema School course',
  } as Bi,
  /** Описание для превью ссылок (meta description, Open Graph) и PWA-манифеста. */
  description: {
    ru: 'Восемь шагов практики внимания: польза и риск названы до первой сессии, собеседник между занятиями, живой круг в конце.',
    en: 'Eight steps of attention practice: benefit and risk named before the first session, an interlocutor between sessions, a living circle at the end.',
  } as Bi,
  // Single source of truth for SEO (sitemap/robots) and the PWA manifest. No trailing slash.
  domain: 'https://academy.synergify.com/praktika',
  /** Ключ курса в платформенном прогрессе (progress.course воркера, события → Listmonk). */
  progressKey: 'living-practice',
  locales: ['ru', 'en'] as const,
  /** Представления урока (LMS#8): что открывает вкладка «Конспект» по умолчанию, если у юнита есть пересказ.
   *  'verbatim' — решение 2026-09-28: при вычитке 2 из 8 пересказов «Тишины» исказили смысл, гвард смысл
   *  не ловит, тема деликатная. Пересказ доступен кнопкой «Показать пересказ». */
  lessonViews: { summaryDefault: 'verbatim' as 'paraphrase' | 'verbatim' },
  /** Педагогика (intake LMS#20). Обе выключены — решение 2026-09-28: самопроверки «Тишины» спрашивают о
   *  своём опыте тела и чувств, а «угадай, ошибаться можно» в начале урока превращает договор о безопасности
   *  в экзамен; требование записать мысли, прежде чем открыть конспект, давит на тех, кому сейчас не до слов.
   *  Конспект здесь и так дословный (summaryDefault) — пассивности готового пересказа нет.
   *  fadeByChecks выключен: компаньон «Тишины» без профиля (COMPANION.usesProfile false), режима опор нет —
   *  сдвигать нечего, а «ошибаешься — добавлю опор» о самонаблюдении превращает практику в оценку. */
  pedagogy: { pretest: false, thinkFirst: false, fadeByChecks: false },
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
  /** Курс школы: нужна сессия и допуск академии; RPG-опросник профиля не нужен. */
  gates: { auth: true, intake: false, admission: true },
  /** Зеркала для чтения у курса нет — «сторож» основного сайта не ставится (lib/mirror-watchdog.ts). */
  mirrorUrl: null as string | null,
} as const
