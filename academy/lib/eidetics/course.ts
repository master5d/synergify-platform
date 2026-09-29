// lib/eidetics/course.ts
// Модуль «Эйдетика» — зеркало скорочтения (lib/speedreading/course.ts): скелет из шести уроков
// с одной строкой цели. Проза — lessons.ts (пишет владелец). Спека:
// docs/superpowers/specs/2026-09-28-eidetics.md. Тема взята у «Шалений Равлик» (Киев) — только тема,
// ни строки их материалов. Все строки проходят lintDehustle и манифест обещаний (course.test.ts).
//
// Цели не завязаны на «взрослый» контекст (работа, совещания): детская линия потом — отдельный
// набор текстов, а не переписывание (решение владельца 2026-09-14).
import type { Bi } from '../speedreading/bi'
import type { Locale } from '../dictionaries'

/** 'soon' — модуль собран, но не объявлен: в хабе без ссылки, страницы noindex, вне sitemap.
 *  'live' — только после вычитки владельцем. */
export type EideticsStatus = 'soon' | 'live'

export interface EideticsLesson { slug: string; title: Bi; objective: Bi }
export interface EideticsCourse { title: Bi; tagline: Bi; status: EideticsStatus; lessons: EideticsLesson[] }

export const EIDETICS_COURSE: EideticsCourse = {
  title: { ru: 'Эйдетика', en: 'Eidetics' },
  tagline: {
    ru: 'Запоминать через образы, сюжет и знакомый маршрут — и проверять по своим замерам, держится ли.',
    en: 'Remember through images, stories and a familiar route — and check against your own measurements whether it lasts.',
  },
  status: 'live', // 2026-09-29: черновик вычитан (факты сверены), live — слово владельца
  lessons: [
    {
      slug: 'images',
      title: { ru: 'Образы и ассоциации', en: 'Images and associations' },
      objective: {
        ru: 'Превращать слово или мысль в яркий конкретный образ и связывать образы между собой.',
        en: 'Turn a word or an idea into a vivid, concrete image and link images to each other.',
      },
    },
    {
      slug: 'chain',
      title: { ru: 'Цепочка и история', en: 'Chains and stories' },
      objective: {
        ru: 'Связать ряд в короткий сюжет, чтобы вспоминать его по порядку.',
        en: 'Weave a list into a short story so you can recall it in order.',
      },
    },
    {
      slug: 'loci',
      title: { ru: 'Метод локусов', en: 'The method of loci' },
      objective: {
        ru: 'Разложить ряд по знакомому маршруту и пройти его в памяти.',
        en: 'Place a list along a familiar route and walk it again in your mind.',
      },
    },
    {
      slug: 'numbers',
      title: { ru: 'Образные коды чисел', en: 'Picture codes for numbers' },
      objective: {
        ru: 'Кодировать цифры согласными звуками и собирать из них слова-образы.',
        en: 'Encode digits as consonant sounds and build picture words out of them.',
      },
    },
    {
      slug: 'names',
      title: { ru: 'Имена и лица', en: 'Names and faces' },
      objective: {
        ru: 'Связывать имя с заметной чертой лица и закреплять его сразу в разговоре.',
        en: 'Tie a name to a distinctive feature of a face and use it right away in conversation.',
      },
    },
    {
      slug: 'spacing',
      title: { ru: 'Интервальное повторение', en: 'Spaced repetition' },
      objective: {
        ru: 'Возвращаться к запомненному через растущие интервалы, чтобы оно держалось.',
        en: 'Return to what you memorised at growing intervals so that it holds.',
      },
    },
  ],
}

export interface ResolvedEideticsLesson { slug: string; title: string; objective: string }
export interface ResolvedEideticsCourse {
  title: string; tagline: string; status: EideticsStatus; lessons: ResolvedEideticsLesson[]
}

export function resolveEideticsCourse(
  locale: Locale,
  source: EideticsCourse = EIDETICS_COURSE,
): ResolvedEideticsCourse {
  return {
    title: source.title[locale],
    tagline: source.tagline[locale],
    status: source.status,
    lessons: source.lessons.map(l => ({ slug: l.slug, title: l.title[locale], objective: l.objective[locale] })),
  }
}

/** Модуль объявлен публично (ссылка в хабе, индексация, sitemap). */
export function isEideticsLive(source: EideticsCourse = EIDETICS_COURSE): boolean {
  return source.status === 'live'
}

/** robots для страниц модуля: пока 'soon' — noindex (страницы собраны, но не объявлены). */
export function eideticsRobots(source: EideticsCourse = EIDETICS_COURSE): { index: boolean; follow: boolean } | undefined {
  return isEideticsLive(source) ? undefined : { index: false, follow: false }
}
