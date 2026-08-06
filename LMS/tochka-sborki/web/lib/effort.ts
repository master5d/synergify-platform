// lib/effort.ts
// Синергема matching engine (Phase C, fb_bfbdbcf0). Keyed-data vocabulary of effort-intents —
// the ACTIVE opt-in signal a learner declares to gather a синергема. This replaces the passive
// `niche` as the clustering key (niche becomes a secondary per-card tag). Mirrors the
// engine+keyed-data pattern of lib/course/niche-map.ts + certificate.ts. All effort copy lives
// here; every string is de-hustle clean (lib/effort.test.ts asserts lintDehustle []).
import type { Bi } from '@/lib/rpg/types'
import type { Locale } from '@/lib/dictionaries'

export interface EffortIntent { key: string; label: Bi; line: Bi }

// Ordered — drives the /alumni opt-in selector. The 5 keys are canonical; the worker mirrors
// them in a local validation set (monorepo boundary — see workers/src/handlers/alumni.ts).
export const EFFORT_INTENTS: EffortIntent[] = [
  {
    key: 'co-build',
    label: { ru: 'Со-строить продукт', en: 'Co-build' },
    line: { ru: 'Строим продукт или проект вместе.', en: 'Build a product or project together.' },
  },
  {
    key: 'mastermind',
    label: { ru: 'Мастермайнд', en: 'Mastermind' },
    line: { ru: 'Подотчётность и разбор на общей цели.', en: 'Accountability and review on a shared goal.' },
  },
  {
    key: 'teach-swap',
    label: { ru: 'Учить друг друга', en: 'Teach each other' },
    line: { ru: 'Обмен навыками: каждый и ученик, и учитель.', en: 'Trade skills — each of us both learner and teacher.' },
  },
  {
    key: 'clients',
    label: { ru: 'Клиенты вместе', en: 'Clients together' },
    line: { ru: 'Ищем и ведём клиентов сообща.', en: 'Find and serve clients together.' },
  },
  {
    key: 'peer-support',
    label: { ru: 'Держаться вместе', en: 'Stay together' },
    line: { ru: 'Спутники в пути — быть рядом, без общего проекта.', en: 'Companions on the path — presence, not a shared project.' },
  },
]

export interface ResolvedEffort { label: string; line: string }

/** Localize an effort key. Returns null for a null/unknown key (e.g. 'other'),
 *  so the caller renders its own fallback label. */
export function resolveEffort(locale: Locale, key: string | null): ResolvedEffort | null {
  if (!key) return null
  const intent = EFFORT_INTENTS.find(i => i.key === key)
  if (!intent) return null
  return { label: intent.label[locale], line: intent.line[locale] }
}
