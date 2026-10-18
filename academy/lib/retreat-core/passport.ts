// Паспорт ретрита — общие данные всех инструментов ведущего (spec подпроекта B, §4).
// Вводятся один раз и переходят из инструмента в инструмент ссылкой. Данных гостей здесь нет и быть не должно.

import { LIMITS, type Lang } from '../retreat-calc/engine'
import type { LinkData } from '../retreat-calc/link'
import { addMonths, isIsoDate, type IsoDate } from './dates'

export type Meal = 'breakfast' | 'lunch' | 'dinner'
const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner']

export interface RetreatPassport {
  title?: string
  currency?: string
  start?: IsoDate
  nights?: number
  guests?: number
  arrivalMeal?: Meal
  departureMeal?: Meal
}

/** Заезд с обеда, выезд после завтрака — так устроена типичная неделя ретрита. */
export const PASSPORT_DEFAULTS: Required<Pick<RetreatPassport, 'arrivalMeal' | 'departureMeal'>> = {
  arrivalMeal: 'lunch',
  departureMeal: 'breakfast',
}

const MESSAGES = {
  ru: {
    title: 'title: ожидалась строка до 200 знаков',
    currency: 'currency: ожидался код ISO 4217',
    start: 'start: ожидалась дата ГГГГ-ММ-ДД',
    count: (f: string, max: number) => `${f}: ожидалось целое от 1 до ${max}`,
    meal: (f: string) => `${f}: ожидалось breakfast, lunch или dinner`,
  },
  en: {
    title: 'title: expected a string up to 200 characters',
    currency: 'currency: expected an ISO 4217 code',
    start: 'start: expected a date YYYY-MM-DD',
    count: (f: string, max: number) => `${f}: expected an integer from 1 to ${max}`,
    meal: (f: string) => `${f}: expected breakfast, lunch or dinner`,
  },
}

const isCount = (v: unknown, max: number) => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= max

/** Ошибки с именем поля; пустой список — паспорт годен. Отсутствующие поля — не ошибка (их спросит инструмент). */
export function validatePassport(p: RetreatPassport, lang: Lang): string[] {
  const t = MESSAGES[lang]
  const errors: string[] = []
  if (p.title !== undefined && (typeof p.title !== 'string' || p.title.length > 200)) errors.push(t.title)
  if (p.currency !== undefined && !/^[A-Z]{3}$/.test(String(p.currency))) errors.push(t.currency)
  if (p.start !== undefined && !isIsoDate(p.start)) errors.push(t.start)
  if (p.nights !== undefined && !isCount(p.nights, LIMITS.nights)) errors.push(t.count('nights', LIMITS.nights))
  if (p.guests !== undefined && !isCount(p.guests, LIMITS.guests)) errors.push(t.count('guests', LIMITS.guests))
  if (p.arrivalMeal !== undefined && !MEALS.includes(p.arrivalMeal)) errors.push(t.meal('arrivalMeal'))
  if (p.departureMeal !== undefined && !MEALS.includes(p.departureMeal)) errors.push(t.meal('departureMeal'))
  return errors
}

/** Allowlist полей паспорта из чужого объекта (ссылка, черновик): лишние ключи и не те типы отбрасываются. */
export function pickPassport(raw: unknown): RetreatPassport {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {}
  const o = raw as Record<string, unknown>
  const p: RetreatPassport = {}
  if (typeof o.title === 'string') p.title = o.title.slice(0, 200)
  if (typeof o.currency === 'string' && /^[A-Z]{3}$/.test(o.currency)) p.currency = o.currency
  if (isIsoDate(o.start)) p.start = o.start
  if (isCount(o.nights, LIMITS.nights)) p.nights = o.nights as number
  if (isCount(o.guests, LIMITS.guests)) p.guests = o.guests as number
  if (MEALS.includes(o.arrivalMeal as Meal)) p.arrivalMeal = o.arrivalMeal as Meal
  if (MEALS.includes(o.departureMeal as Meal)) p.departureMeal = o.departureMeal as Meal
  return p
}

/** Паспорт из ссылки калькулятора v1: срок до старта в месяцах становится датой старта от сегодняшнего дня. */
export function passportFromCalcLink(d: LinkData, today: IsoDate): RetreatPassport {
  const p: RetreatPassport = {}
  if (d.title !== undefined) p.title = d.title
  if (d.currency !== undefined) p.currency = d.currency
  if (d.guests !== undefined) p.guests = d.guests
  if (d.nights !== undefined) p.nights = d.nights
  if (d.monthsToStart !== undefined) p.start = addMonths(today, d.monthsToStart)
  return p
}
