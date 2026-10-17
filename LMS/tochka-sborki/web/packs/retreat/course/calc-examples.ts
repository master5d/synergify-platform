// packs/retreat/course/calc-examples.ts
// Учебные сделки курса для калькулятора ретрита академии: юниты ведут на живую страницу с формой,
// заполненной через `#data=<base64url JSON>` (формат ссылки v1, academy/lib/retreat-calc/link.ts).
// Данные — в calc-examples.json: тот же файл читает тест академии и сверяет `expect` с движком
// калькулятора (academy/lib/retreat-calc/course-examples.test.ts), чтобы цифры в тексте урока
// совпадали с тем, что покажет страница. Цифры круглые и учебные — не из чьих-то реальных ретритов.
import EXAMPLES from './calc-examples.json'

export type ExampleId = 'full-campus-20' | 'full-campus-12' | 'per-guest-min' | 'buyout'

/** Форма ссылки v1 (зеркало LinkData из academy/lib/retreat-calc/link.ts, без title — он по локали). */
export interface ExampleData {
  v: 1
  currency: string
  price: number
  guests: number
  nights: number
  monthsToStart: number
  guestDepositPct: number
  guestBalanceDueDays: number
  venue: {
    model: 'full_campus' | 'per_guest' | 'buyout'
    ratePerGuest: number
    capacity: number
    minGuests?: number
    buyoutFee?: number
    depositPct: number
    finalDueDays: number
    payInFullDiscountPct: number
    installments: boolean
  }
}

/** Итоги страницы калькулятора для примера, в целых единицах валюты. */
export interface ExampleExpect {
  profit: number
  venueStyleProfit: number
  breakEvenGuests: number | null
  emptySeats: number
  cashGap: { amount: number; month: number } | null
}

export interface CalcExample {
  id: ExampleId
  title: { ru: string; en: string }
  data: ExampleData
  expect: ExampleExpect
}

export const CALC_EXAMPLES = EXAMPLES as CalcExample[]

export const CALC_BASE = 'https://academy.synergify.com'
const CALC_PATH = '/instrumenty/kalkulyator-retrita/'

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Ключи по алфавиту на каждом уровне — одна и та же сделка всегда даёт одну и ту же ссылку. */
function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sorted((value as Record<string, unknown>)[k])]))
  }
  return value
}

export function exampleById(id: ExampleId): CalcExample {
  const ex = CALC_EXAMPLES.find((e) => e.id === id)
  if (!ex) throw new Error(`calc-examples: нет примера ${id}`)
  return ex
}

/** Ссылка на живой калькулятор академии с заполненной учебной сделкой. */
export function calcHref(id: ExampleId, locale: 'ru' | 'en'): string {
  const ex = exampleById(id)
  const payload = sorted({ ...ex.data, title: ex.title[locale] })
  return `${CALC_BASE}${locale === 'en' ? '/en' : ''}${CALC_PATH}#data=${toBase64Url(JSON.stringify(payload))}`
}
