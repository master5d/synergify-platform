// packs/retreat/course/dungeon-flavor.ts
// Форма эталона: те же 8 niche-ключей (движок и intake ими оперируют), флейвор один и нейтральный.
// У курса RPG выключен (COURSE.features.rpg: false) — текст держит контракт и честен на случай включения.
import type { NicheFlavor } from '@/lib/dungeon/types'
import type { Bi } from '@/lib/rpg/types'

const DEAL_FLAVOR: NicheFlavor = {
  dungeonName: { ru: 'Зал переговоров', en: 'The Negotiating Room' },
  bossName: { ru: 'Пустое место в группе', en: 'The Empty Place in the Group' },
  intro: {
    ru: 'Сделка выглядит выгодной, пока все места заняты. Пройди уроки — и посмотри, что происходит с каждой строкой, когда гостей меньше.',
    en: 'A deal looks good while every place is taken. Walk the lessons — and see what happens to each line when fewer guests come.',
  },
  bossChallenge: {
    ru: 'Примени разбор сделки в {niche}: посчитай свой ретрит при группе на треть меньше и найди, кто несёт пустые места — навстречу {outcome}.',
    en: 'Apply the deal review in {niche}: work out your retreat with a group a third smaller and find who carries the empty places — toward {outcome}.',
  },
}

// Один и тот же нейтральный флейвор для всех ниш: идентичность курса не зависит
// от ниши, а Record сохраняет контракт (fallback-ключ `other` обязателен движку).
export const FLAVOR_BANK: Record<string, NicheFlavor> = {
  coach: DEAL_FLAVOR,
  massage: DEAL_FLAVOR,
  astrology: DEAL_FLAVOR,
  content: DEAL_FLAVOR,
  ecommerce: DEAL_FLAVOR,
  service: DEAL_FLAVOR,
  tech: DEAL_FLAVOR,
  other: DEAL_FLAVOR,
}

// niche (F2 value) -> readable slot word for {niche} substitution (флейвор, не маршрутизация).
// Locative-optimized for the dominant "в {niche}" phrasing; `other`/unknown/null intentionally
// absent -> NICHE_FALLBACK (lib/cs/applied-challenge.ts).
export const NICHE_SLOT: Record<string, Bi> = {
  coach:     { ru: 'коучинге',   en: 'coaching' },
  massage:   { ru: 'массаже',    en: 'massage' },
  astrology: { ru: 'астрологии', en: 'astrology' },
  content:   { ru: 'контенте',   en: 'content' },
  ecommerce: { ru: 'e-commerce', en: 'e-commerce' },
  service:   { ru: 'услугах',    en: 'services' },
  tech:      { ru: 'разработке', en: 'tech' },
}
