// Тексты генератора меню RU/EN — один источник для страницы и CSV.

import type { Lang } from '../retreat-calc/engine'
import type { DietId, Meal, MenuIssue } from './engine'

const MEAL: Record<Lang, Record<Meal, string>> = {
  ru: { breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин' },
  en: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' },
}
const DIET: Record<Lang, Record<DietId, string>> = {
  ru: { 'standard': 'обычное', 'vegetarian': 'вегетарианское', 'vegan': 'веган', 'gluten-free': 'без глютена', 'vegan-gluten-free': 'веган без глютена' },
  en: { 'standard': 'standard', 'vegetarian': 'vegetarian', 'vegan': 'vegan', 'gluten-free': 'gluten-free', 'vegan-gluten-free': 'vegan, gluten-free' },
}
export const MEAT_MARK: Record<Lang, string> = { ru: '(мясное)', en: '(meat)' }

export const mealLabel = (m: Meal, lang: Lang) => MEAL[lang][m]
export const dietLabel = (d: DietId, lang: Lang) => DIET[lang][d]

/** Приём пищи по подписи на любом языке (для чтения CSV). */
export function mealByLabel(s: string): Meal | undefined {
  const n = s.trim().toLowerCase()
  return (['breakfast', 'lunch', 'dinner'] as const).find((m) => MEAL.ru[m].toLowerCase() === n || MEAL.en[m].toLowerCase() === n)
}
/** Диета по подписи на любом языке. */
export function dietByLabel(s: string): DietId | undefined {
  const n = s.trim().toLowerCase()
  return (Object.keys(DIET.ru) as DietId[]).find((d) => DIET.ru[d] === n || DIET.en[d] === n)
}

export function issueText(i: MenuIssue, lang: Lang): string {
  const ru = lang === 'ru'
  const at = i.day !== undefined ? (ru ? `день ${i.day}` : `day ${i.day}`) + (i.meal ? `, ${mealLabel(i.meal, lang).toLowerCase()}` : '') : ''
  switch (i.id) {
    case 'day-without-price':
      return ru ? `${at}: у приёма нет цены. Итог дня и недели не считается.` : `${at}: a meal has no price. Day and week totals are not counted.`
    case 'empty-slot':
      return ru ? `${at}: блюдо не указано.` : `${at}: no dish yet.`
    case 'allergen-without-alternative':
      return ru ? `${at}: в блюде есть аллерген, а замены нет.` : `${at}: the dish has an allergen and no alternative.`
    case 'diet-without-variant':
      return ru
        ? `${at}: в группе есть гости на диете «${dietLabel(i.diet ?? 'vegan', lang)}», а варианта блюда для них нет.`
        : `${at}: the group has ${dietLabel(i.diet ?? 'vegan', lang)} guests, and there is no dish for them.`
    case 'diets-over-guests':
      return ru ? 'Гостей на особых диетах больше, чем гостей всего.' : 'There are more guests on special diets than guests in total.'
    case 'option-without-dish':
      return ru ? `${at}: есть опция, но нет блюда.` : `${at}: there is an option but no dish.`
  }
}
