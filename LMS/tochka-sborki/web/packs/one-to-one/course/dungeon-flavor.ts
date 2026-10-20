// packs/one-to-one/course/dungeon-flavor.ts
// Форма эталона: те же 8 niche-ключей (движок и intake ими оперируют), флейвор один и нейтральный.
// У курса RPG выключен (COURSE.features.rpg: false) — текст держит контракт и честен на случай включения.
import type { NicheFlavor } from '@/lib/dungeon/types'
import type { Bi } from '@/lib/rpg/types'

const PRACTICE_FLAVOR: NicheFlavor = {
  dungeonName: { ru: 'Кабинет на одного', en: 'The Room for One' },
  bossName: { ru: 'Потолок привязки', en: 'The Ceiling of the Bond' },
  intro: {
    ru: 'Практика выглядит полной, пока каждый час занят. Пройди уроки — и посмотри, что в ней держится на методе, а что только на тебе.',
    en: 'A practice looks full while every hour is taken. Walk the lessons — and see what in it rests on the method and what only on you.',
  },
  bossChallenge: {
    ru: 'Примени разбор в {niche}: найди один шаг сессии, который выдержит двоих, и поставь дату первой встречи на 2–7 человек — навстречу {outcome}.',
    en: 'Apply the review in {niche}: find one session step that holds two people and set a date for the first meeting for 2–7 people — toward {outcome}.',
  },
}

// Один и тот же нейтральный флейвор для всех ниш: идентичность курса не зависит
// от ниши, а Record сохраняет контракт (fallback-ключ `other` обязателен движку).
export const FLAVOR_BANK: Record<string, NicheFlavor> = {
  coach: PRACTICE_FLAVOR,
  massage: PRACTICE_FLAVOR,
  astrology: PRACTICE_FLAVOR,
  content: PRACTICE_FLAVOR,
  ecommerce: PRACTICE_FLAVOR,
  service: PRACTICE_FLAVOR,
  tech: PRACTICE_FLAVOR,
  other: PRACTICE_FLAVOR,
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
