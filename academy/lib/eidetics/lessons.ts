// lib/eidetics/lessons.ts
// Проза уроков «Эйдетики». Как у скорочтения: структура — course.ts, проза — здесь, пишет
// владелец (решение 2026-09-14). Опорные тезисы и источники по каждому уроку — в спеке
// docs/superpowers/specs/2026-09-28-eidetics.md. Текст оригинальный, ни фразы из чужих курсов.
// Проза проходит lintDehustle и манифест обещаний — см. lessons.test.ts.
// Пустая строка = урок ещё не написан: страница урока такой slug не создаёт.
import type { Bi } from '../speedreading/bi'
import type { Locale } from '../dictionaries'

export const EIDETICS_PROSE: Record<string, Bi> = {
  images: { ru: '', en: '' },
  chain: { ru: '', en: '' },
  loci: { ru: '', en: '' },
  numbers: { ru: '', en: '' },
  names: { ru: '', en: '' },
  spacing: { ru: '', en: '' },
}

/** Проза урока на нужном языке или null, если урок ещё не написан. */
export function getEideticsProse(slug: string, locale: Locale): string | null {
  const body = EIDETICS_PROSE[slug]?.[locale]?.trim()
  return body ? body : null
}

/** Slug'и уроков с прозой на обоих языках (для generateStaticParams). */
export function writtenEideticsSlugs(): string[] {
  return Object.entries(EIDETICS_PROSE)
    .filter(([, bi]) => bi.ru.trim().length > 0 && bi.en.trim().length > 0)
    .map(([slug]) => slug)
}
