// packs/living-practice/course/niche-map.ts
// Форма эталона. У курса один модуль — все ниши ведут в него.
import type { Bi } from '@/lib/rpg/types'

// niche (Module F2 value) -> module slug most tied to that niche's first win.
export const NICHE_MODULE: Record<string, string> = {
  coach:     '01-living-practice',
  massage:   '01-living-practice',
  astrology: '01-living-practice',
  service:   '01-living-practice',
  other:     '01-living-practice',
  content:   '01-living-practice',
  ecommerce: '01-living-practice',
  tech:      '01-living-practice',
}

// niche (F2 value) -> readable slot word for {niche} substitution. Locative-optimized;
// `other`/unknown/null intentionally absent -> NICHE_FALLBACK.
export const NICHE_SLOT: Record<string, Bi> = {
  coach:     { ru: 'коучинге',   en: 'coaching' },
  massage:   { ru: 'массаже',    en: 'massage' },
  astrology: { ru: 'астрологии', en: 'astrology' },
  content:   { ru: 'контенте',   en: 'content' },
  ecommerce: { ru: 'e-commerce', en: 'e-commerce' },
  service:   { ru: 'услугах',    en: 'services' },
  tech:      { ru: 'разработке', en: 'tech' },
}
