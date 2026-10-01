// lib/interest-example/interests.ts
// Закрытый список интересов для примера концепт-фазы (intake LMS#8,
// спека docs/superpowers/specs/2026-09-28-interest-example.md).
// = значения V_NICHE анкеты без `other`. Конечный список = конечный кэш (юнит × интерес × локаль).
// Воркер импортирует файл относительным путём — здесь без алиасов `@/`.
// Зеркало в llm-service/src/types.ts, расхождение ловит llm-service/test/interest.test.ts.

export const INTERESTS = ['coach', 'massage', 'astrology', 'content', 'ecommerce', 'service', 'tech'] as const
export type Interest = typeof INTERESTS[number]

/** Подпись сферы в метке «Пример под твою сферу: …». */
export const INTEREST_LABELS: Record<Interest, { ru: string; en: string }> = {
  coach: { ru: 'коучинг и психология', en: 'coaching and psychology' },
  massage: { ru: 'тело и массаж', en: 'bodywork and massage' },
  astrology: { ru: 'астрология и духовные практики', en: 'astrology and spiritual practice' },
  content: { ru: 'контент и медиа', en: 'content and media' },
  ecommerce: { ru: 'торговля и продукты', en: 'commerce and products' },
  service: { ru: 'сервис и услуги', en: 'service business' },
  tech: { ru: 'технологии и разработка', en: 'tech and development' },
}

/** niche из intake_profiles → ключ интереса. Пусто, `other` или вне списка → null (общий пример). */
export function interestKey(niche: unknown): Interest | null {
  if (typeof niche !== 'string') return null
  const k = niche.trim().toLowerCase()
  return (INTERESTS as readonly string[]).includes(k) ? (k as Interest) : null
}
