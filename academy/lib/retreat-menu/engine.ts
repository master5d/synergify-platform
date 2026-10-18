// Движок меню ретрита (spec подпроекта B, §5.1): сетка «день × приём пищи» из паспорта, итоги в трёх разрезах
// и проверки. Только арифметика, без сети. Разрезы не смешиваются: «на гостя», «на группу» и опции за доплату
// (они вне цены пакета) — ровно та ошибка, которую нашли в шаблонах интейка.

import { LIMITS, type Lang } from '../retreat-calc/engine'
import { PASSPORT_DEFAULTS, validatePassport, type Meal, type RetreatPassport } from '../retreat-core/passport'
import type { AllergenId } from './allergens'

export type { Meal }
export const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner']

export interface Slot { day: number; meal: Meal }
export const cellKey = (s: Slot) => `${s.day}-${s.meal}`

export const DIETS = ['standard', 'vegetarian', 'vegan', 'gluten-free'] as const
export type DietId = (typeof DIETS)[number]
export type SpecialDiet = Exclude<DietId, 'standard'>
export type Diets = Partial<Record<DietId, number>>

export interface MenuCell {
  dish: string
  side: string
  drink: string
  /** Основное блюдо мясное или рыбное — для вегетарианцев нужен вариант. */
  meat: boolean
  /** Блюдо для диеты; нет записи — основное подходит, если аллергены и `meat` не мешают. */
  variants: Partial<Record<SpecialDiet, string>>
  allergens: AllergenId[]
  /** Цена порции на гостя в центах; null — не указана. */
  priceCents: number | null
  /** Опция за доплату — вне цены пакета. */
  option: { name: string; priceCents: number } | null
}
export type MenuGrid = Record<string, MenuCell>

export const emptyCell = (): MenuCell => ({ dish: '', side: '', drink: '', meat: false, variants: {}, allergens: [], priceCents: null, option: null })

export interface MenuTotals {
  /** null — в дне есть приём с блюдом без цены: итог не собирается из части цен. */
  perGuestByDay: { day: number; cents: number | null }[]
  perGuestWeek: number | null
  perGroup: number | null
  options: { day: number; meal: Meal; name: string; priceCents: number }[]
}

export type MenuIssueId = 'day-without-price' | 'empty-slot' | 'allergen-without-alternative' | 'diet-without-variant' | 'diets-over-guests'
export interface MenuIssue { id: MenuIssueId; day?: number; meal?: Meal; diet?: SpecialDiet }

/** Приёмы пищи ретрита: день 1 — от приёма заезда до ужина, дни 2..nights — все три, последний — от завтрака до приёма выезда. */
export function menuSlots(p: RetreatPassport): Slot[] {
  const nights = p.nights ?? 0
  if (!Number.isInteger(nights) || nights < 1) return []
  const first = MEALS.indexOf(p.arrivalMeal ?? PASSPORT_DEFAULTS.arrivalMeal)
  const last = MEALS.indexOf(p.departureMeal ?? PASSPORT_DEFAULTS.departureMeal)
  const slots: Slot[] = []
  for (let day = 1; day <= nights + 1; day++) {
    const from = day === 1 ? first : 0
    const to = day === nights + 1 ? last : MEALS.length - 1
    for (let m = from; m <= to; m++) slots.push({ day, meal: MEALS[m] })
  }
  return slots
}

const MESSAGES = {
  ru: {
    required: (f: string) => `${f}: обязательное поле`,
    diet: (d: string) => `diets.${d}: ожидалось целое от 0 до ${LIMITS.guests}`,
  },
  en: {
    required: (f: string) => `${f}: required`,
    diet: (d: string) => `diets.${d}: expected an integer from 0 to ${LIMITS.guests}`,
  },
}

export function validateMenu(p: RetreatPassport, diets: Diets, lang: Lang): string[] {
  const m = MESSAGES[lang]
  const errors = validatePassport(p, lang)
  for (const f of ['nights', 'guests'] as const) if (p[f] === undefined) errors.push(m.required(f))
  for (const d of DIETS) {
    const n = diets[d]
    if (n !== undefined && !(Number.isInteger(n) && n >= 0 && n <= LIMITS.guests)) errors.push(m.diet(d))
  }
  return errors
}

/** Рыба и морепродукты — не вегетарианское, даже если галочку «мясное» забыли. */
const notVegetarian = (c: MenuCell) => c.meat || c.allergens.some((a) => a === 'fish' || a === 'crustaceans' || a === 'molluscs')

/** Нужен ли блюду вариант для диеты: веганам — при молоке, яйцах, мясе или рыбе; без глютена — при глютене;
 *  вегетарианцам — при мясе или рыбе. */
function needsVariant(cell: MenuCell, diet: SpecialDiet): boolean {
  if (diet === 'gluten-free') return cell.allergens.includes('gluten')
  if (diet === 'vegan') return notVegetarian(cell) || cell.allergens.includes('milk') || cell.allergens.includes('eggs')
  return notVegetarian(cell)
}

/** Есть ли для диеты своё блюдо: веганский вариант годится и вегетарианцам. */
const hasVariant = (cell: MenuCell, diet: SpecialDiet) =>
  Boolean(cell.variants[diet]?.trim()) || (diet === 'vegetarian' && Boolean(cell.variants.vegan?.trim()))

export function computeMenu(p: RetreatPassport, grid: MenuGrid, diets: Diets): { slots: Slot[]; totals: MenuTotals; issues: MenuIssue[] } {
  const errors = validateMenu(p, diets, 'en')
  if (errors.length) throw new Error(errors.join('; '))
  const guests = p.guests as number
  const slots = menuSlots(p)
  const issues: MenuIssue[] = []
  const options: MenuTotals['options'] = []
  const byDay = new Map<number, number | null>()

  const special = DIETS.filter((d): d is SpecialDiet => d !== 'standard')
  if (special.reduce((s, d) => s + (diets[d] ?? 0), 0) > guests) issues.push({ id: 'diets-over-guests' })

  for (const s of slots) {
    const cell = grid[cellKey(s)]
    const sum = byDay.has(s.day) ? byDay.get(s.day)! : 0
    if (!cell || !cell.dish.trim()) {
      // пустой приём — тоже «часть цен»: итог дня без него выглядел бы полным
      issues.push({ id: 'empty-slot', day: s.day, meal: s.meal })
      byDay.set(s.day, null)
      continue
    }
    if (cell.priceCents === null) {
      byDay.set(s.day, null)
      if (!issues.some((i) => i.id === 'day-without-price' && i.day === s.day)) issues.push({ id: 'day-without-price', day: s.day })
    } else {
      byDay.set(s.day, sum === null ? null : sum + cell.priceCents)
    }
    if (cell.allergens.length > 0 && Object.values(cell.variants).every((v) => !v?.trim())) {
      issues.push({ id: 'allergen-without-alternative', day: s.day, meal: s.meal })
    }
    for (const d of special) {
      if ((diets[d] ?? 0) > 0 && needsVariant(cell, d) && !hasVariant(cell, d)) issues.push({ id: 'diet-without-variant', day: s.day, meal: s.meal, diet: d })
    }
    if (cell.option) options.push({ day: s.day, meal: s.meal, name: cell.option.name, priceCents: cell.option.priceCents })
  }

  const perGuestByDay = [...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([day, cents]) => ({ day, cents }))
  const perGuestWeek = perGuestByDay.some((d) => d.cents === null) ? null : perGuestByDay.reduce((s, d) => s + (d.cents as number), 0)
  return {
    slots,
    totals: { perGuestByDay, perGuestWeek, perGroup: perGuestWeek === null ? null : perGuestWeek * guests, options },
    issues,
  }
}
