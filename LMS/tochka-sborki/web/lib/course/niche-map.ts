// web/lib/course/niche-map.ts
import type { Bi } from '@/lib/rpg/types'

// niche (Module F2 value) -> module slug most tied to that niche's first win.
export const NICHE_MODULE: Record<string, string> = {
  coach:     '04-prompt-engineering',
  massage:   '04-prompt-engineering',
  astrology: '04-prompt-engineering',
  service:   '04-prompt-engineering',
  other:     '04-prompt-engineering',
  content:   '06-audio-pipeline',
  ecommerce: '07-tools',
  tech:      '08-agent-engineering',
}

// niche (F2 value) -> readable slot word for {niche} substitution. Locative-optimized for the
// dominant "в {niche}" phrasing; `other`/unknown/null intentionally absent -> NICHE_FALLBACK.
export const NICHE_SLOT: Record<string, Bi> = {
  coach:     { ru: 'коучинге',   en: 'coaching' },
  massage:   { ru: 'массаже',    en: 'massage' },
  astrology: { ru: 'астрологии', en: 'astrology' },
  content:   { ru: 'контенте',   en: 'content' },
  ecommerce: { ru: 'e-commerce', en: 'e-commerce' },
  service:   { ru: 'услугах',    en: 'services' },
  tech:      { ru: 'разработке', en: 'tech' },
}
