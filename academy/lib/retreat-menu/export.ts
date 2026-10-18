// CSV меню для шефа — в колонках шаблона курса menu-week.<lang>.csv; читается обратно без потерь.
// Пометка «мясное» и варианты для диет живут в колонках шаблона: шефу они нужны так же, как странице.

import type { Lang } from '../retreat-calc/engine'
import { LIMITS } from '../retreat-calc/engine'
import { parseCsv, toCsv } from '../retreat-core/csv'
import { allergenByName, allergenName, type AllergenId } from './allergens'
import { cellKey, emptyCell, type MenuCell, type MenuGrid, type Slot, type SpecialDiet } from './engine'
import { dietByLabel, dietLabel, MEAT_MARK, mealByLabel, mealLabel } from './labels'

export const MENU_CSV_HEADER: Record<Lang, string[]> = {
  ru: ['День', 'Приём пищи', 'Основное блюдо', 'Гарнир или салат', 'Напиток', 'Вариант для вегана или без глютена', 'Аллергены', 'Опция за доплату', 'Цена на гостя'],
  en: ['Day', 'Meal', 'Main dish', 'Side or salad', 'Drink', 'Vegan or gluten-free option', 'Allergens', 'Paid add-on', 'Price per guest'],
}
const SPECIAL: SpecialDiet[] = ['vegetarian', 'vegan', 'gluten-free']
const VARIANT_SPLIT = new RegExp(
  `\\s*\\|\\s*(?=(?:${SPECIAL.flatMap((d) => [dietLabel(d, 'ru'), dietLabel(d, 'en')]).join('|')})\\s*:)`, 'i')

/** Центы → сумма; дробная часть через запятую в RU (как ждёт русский Excel). */
export function menuMoney(cents: number, lang: Lang): string {
  const s = cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2)
  return lang === 'ru' ? s.replace('.', ',') : s
}
/** Сумма из таблицы → центы; «12,50» и «12.50» одинаково. Не число — null. */
export function parseMoney(s: string): number | null {
  const t = s.trim().replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null
  const cents = Math.round(Number(t) * 100)
  return cents <= LIMITS.moneyCents ? cents : null
}

function cellRow(s: Slot, c: MenuCell, lang: Lang): string[] {
  const variants = SPECIAL.filter((d) => c.variants[d]?.trim()).map((d) => `${dietLabel(d, lang)}: ${c.variants[d]}`).join(' | ')
  return [
    String(s.day), mealLabel(s.meal, lang), c.meat ? `${c.dish} ${MEAT_MARK[lang]}` : c.dish, c.side, c.drink, variants,
    c.allergens.map((a) => allergenName(a, lang)).join(', '),
    c.option ? `${c.option.name} +${menuMoney(c.option.priceCents, lang)}` : '',
    c.priceCents === null ? '' : menuMoney(c.priceCents, lang),
  ]
}

export function menuToCsv(slots: Slot[], grid: MenuGrid, lang: Lang): string {
  return toCsv([MENU_CSV_HEADER[lang], ...slots.map((s) => cellRow(s, grid[cellKey(s)] ?? emptyCell(), lang))], lang)
}

/** CSV из шаблона курса или из этого генератора (RU или EN) → сетка. Строки без дня или приёма пропускаются. */
export function menuFromCsv(text: string): MenuGrid {
  const grid: MenuGrid = {}
  for (const r of parseCsv(text)) {
    const day = Number.parseInt(r[0] ?? '', 10)
    const meal = mealByLabel(r[1] ?? '')
    if (!Number.isInteger(day) || day < 1 || !meal) continue
    let dish = (r[2] ?? '').trim()
    const meatMark = [MEAT_MARK.ru, MEAT_MARK.en].find((m) => dish.endsWith(` ${m}`))
    if (meatMark) dish = dish.slice(0, -meatMark.length - 1)
    const variants: MenuCell['variants'] = {}
    // делим только перед «<диета>:» — знак « | » внутри самого варианта остаётся частью текста
    for (const part of (r[5] ?? '').split(VARIANT_SPLIT)) {
      const i = part.indexOf(':')
      const diet = i > 0 ? dietByLabel(part.slice(0, i)) : undefined
      if (diet && diet !== 'standard' && part.slice(i + 1).trim()) variants[diet] = part.slice(i + 1).trim()
    }
    const allergens = (r[6] ?? '').split(',').map(allergenByName).filter((a): a is AllergenId => a !== undefined)
    const opt = /^(.*?)\s*\+\s*([\d\s.,]+)$/.exec((r[7] ?? '').trim())
    const optPrice = opt ? parseMoney(opt[2]) : null
    grid[cellKey({ day, meal })] = {
      dish, side: (r[3] ?? '').trim(), drink: (r[4] ?? '').trim(), meat: Boolean(meatMark), variants, allergens,
      priceCents: parseMoney(r[8] ?? ''),
      option: opt && optPrice !== null && (opt[1] || optPrice > 0) ? { name: opt[1], priceCents: optPrice } : null,
    }
  }
  return grid
}
