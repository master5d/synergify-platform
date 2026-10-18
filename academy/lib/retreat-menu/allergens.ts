// 14 аллергенов, которые в ЕС обязательно указывать в меню (Регламент ЕС 1169/2011, приложение II).

import type { Lang } from '../retreat-calc/engine'

export const ALLERGENS = [
  'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soy', 'milk',
  'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs',
] as const
export type AllergenId = (typeof ALLERGENS)[number]

const NAMES: Record<Lang, Record<AllergenId, string>> = {
  ru: {
    gluten: 'глютен', crustaceans: 'ракообразные', eggs: 'яйца', fish: 'рыба', peanuts: 'арахис', soy: 'соя',
    milk: 'молоко', nuts: 'орехи', celery: 'сельдерей', mustard: 'горчица', sesame: 'кунжут', sulphites: 'сульфиты',
    lupin: 'люпин', molluscs: 'моллюски',
  },
  en: {
    gluten: 'gluten', crustaceans: 'crustaceans', eggs: 'eggs', fish: 'fish', peanuts: 'peanuts', soy: 'soy',
    milk: 'milk', nuts: 'tree nuts', celery: 'celery', mustard: 'mustard', sesame: 'sesame', sulphites: 'sulphites',
    lupin: 'lupin', molluscs: 'molluscs',
  },
}

export const allergenName = (id: AllergenId, lang: Lang) => NAMES[lang][id]

/** Название аллергена на любом из двух языков → id (для чтения CSV). Неизвестное — undefined. */
export function allergenByName(name: string): AllergenId | undefined {
  const n = name.trim().toLowerCase()
  return ALLERGENS.find((id) => NAMES.ru[id] === n || NAMES.en[id] === n || id === n)
}
