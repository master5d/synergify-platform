// packs/living-practice/course/dungeon-flavor.ts
// Форма эталона: те же 8 niche-ключей (движок и intake ими оперируют), но флейвор
// у курса практики один и нейтральный — тема круга, без выдуманных «боссов» по нишам.
import type { NicheFlavor } from '@/lib/dungeon/types'

const CIRCLE_FLAVOR: NicheFlavor = {
  dungeonName: { ru: 'Тихая Комната', en: 'The Quiet Room' },
  bossName: { ru: 'Пустая Комната', en: 'The Empty Room' },
  intro: {
    ru: 'Комната одиночной практики выглядит спокойной, пока в ней никого нет. Пройди уроки — и посмотри, чего этой комнате не хватает.',
    en: 'The room of solitary practice looks calm while no one else is in it. Walk the lessons — and see what this room is missing.',
  },
  bossChallenge: {
    ru: 'Примени карту различий в {niche}: найди в своём окружении трёх-семерых людей и наметь первый шаг к живому кругу — навстречу {outcome}. Без спешки: круг не собирается по приказу.',
    en: 'Apply the map of distinctions in {niche}: find three to seven people around you and sketch the first step toward a living circle — toward {outcome}. No rush: a circle does not assemble on command.',
  },
}

// Один и тот же нейтральный флейвор для всех ниш: идентичность курса не зависит
// от ниши, а Record сохраняет контракт (fallback-ключ `other` обязателен движку).
export const FLAVOR_BANK: Record<string, NicheFlavor> = {
  coach: CIRCLE_FLAVOR,
  massage: CIRCLE_FLAVOR,
  astrology: CIRCLE_FLAVOR,
  content: CIRCLE_FLAVOR,
  ecommerce: CIRCLE_FLAVOR,
  service: CIRCLE_FLAVOR,
  tech: CIRCLE_FLAVOR,
  other: CIRCLE_FLAVOR,
}
