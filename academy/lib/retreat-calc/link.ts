// Подстановка данных в калькулятор через фрагмент ссылки `#data=<base64url JSON>`.
// Фрагмент не уходит на сервер: цифры ретрита остаются у того, кто открыл ссылку. Хранения нет.
// Форма v1 — в README инструмента; деньги в ссылке — целые единицы валюты, движок считает в центах.

import { LIMITS, type ContractModel, type Lang } from './engine'

export const LINK_VERSION = 1
const MODELS: ContractModel[] = ['full_campus', 'per_guest', 'buyout']
/** Ссылка длиннее — не наша (форма v1 укладывается в пару килобайт). */
export const MAX_FRAGMENT = 8_000

export interface LinkVenue {
  model?: ContractModel
  ratePerGuest?: number
  capacity?: number
  minGuests?: number
  buyoutFee?: number
  depositPct?: number
  finalDueDays?: number
  payInFullDiscountPct?: number
  installments?: boolean
  payInFull?: boolean
}

/** Всё, кроме `v`, необязательно: чего нет в каноне, человек вводит на странице. */
export interface LinkData {
  v: number
  id?: string
  title?: string
  currency?: string
  price?: number
  guests?: number
  nights?: number
  monthsToStart?: number
  guestDepositPct?: number
  guestDeposit?: number
  guestBalanceDueDays?: number
  daysToStart?: number
  venue?: LinkVenue
}

export type Decoded = { ok: true; data: LinkData } | { ok: false; error: string }

const MONEY_MAX = LIMITS.moneyCents / 100
// потолок каждого числа: ссылка не должна ронять или вешать страницу (1e10 месяцев, миллиард гостей)
const NUMBER_FIELDS = {
  price: MONEY_MAX, guests: LIMITS.guests, nights: LIMITS.nights, monthsToStart: LIMITS.months,
  guestDepositPct: 100, guestDeposit: MONEY_MAX, guestBalanceDueDays: LIMITS.days, daysToStart: LIMITS.days,
} as const
const VENUE_NUMBERS = {
  ratePerGuest: MONEY_MAX, capacity: LIMITS.guests, minGuests: LIMITS.guests, buyoutFee: MONEY_MAX,
  depositPct: 100, finalDueDays: LIMITS.days, payInFullDiscountPct: 100,
} as const

const MESSAGES = {
  ru: {
    none: 'в ссылке нет данных калькулятора',
    broken: 'данные в ссылке повреждены',
    notObject: 'данные в ссылке не объект',
    version: (v: string) => `версия данных ${v} не поддерживается (нужна ${LINK_VERSION})`,
    title: 'title: ожидалась строка',
    currency: 'currency: ожидался код ISO 4217',
    number: (f: string, max: number) => `${f}: ожидалось число от 0 до ${max}`,
    venue: 'venue: ожидался объект',
    model: (m: string) => `venue.model: «${m}» не из ${MODELS.join(', ')}`,
    installments: 'venue.installments: ожидалось true/false',
    payInFull: 'venue.payInFull: ожидалось true/false',
  },
  en: {
    none: 'the link carries no calculator data',
    broken: 'the data in the link is damaged',
    notObject: 'the data in the link is not an object',
    version: (v: string) => `data version ${v} is not supported (expected ${LINK_VERSION})`,
    title: 'title: expected a string',
    currency: 'currency: expected an ISO 4217 code',
    number: (f: string, max: number) => `${f}: expected a number from 0 to ${max}`,
    venue: 'venue: expected an object',
    model: (m: string) => `venue.model: “${m}” is not one of ${MODELS.join(', ')}`,
    installments: 'venue.installments: expected true/false',
    payInFull: 'venue.payInFull: expected true/false',
  },
}

export function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  bytes.forEach((b) => { bin += String.fromCharCode(b) })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)
  const bin = atob(b64)
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function encodeLink(data: LinkData): string {
  return `#data=${toBase64Url(JSON.stringify(data))}`
}

function inRange(v: unknown, max: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max
}

/** Разбор фрагмента; битая ссылка, чужая версия или число вне потолка — ошибка с причиной, а не исключение. */
export function decodeLink(hash: string, lang: Lang = 'ru'): Decoded {
  const t = MESSAGES[lang]
  if (hash.length > MAX_FRAGMENT) return { ok: false, error: t.broken }
  const m = /^#?data=([A-Za-z0-9_-]+)$/.exec(hash.trim())
  if (!m) return { ok: false, error: t.none }
  let raw: unknown
  try {
    raw = JSON.parse(fromBase64Url(m[1]))
  } catch {
    return { ok: false, error: t.broken }
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ok: false, error: t.notObject }
  const o = raw as Record<string, unknown>
  if (o.v !== LINK_VERSION) return { ok: false, error: t.version(String(o.v)) }
  const data: LinkData = { v: LINK_VERSION }
  if (o.title !== undefined) {
    if (typeof o.title !== 'string') return { ok: false, error: t.title }
    data.title = o.title.slice(0, 200)
  }
  // id ретрита — служебный (стабильный UID в календаре): неверный отбрасывается, ссылка остаётся рабочей
  if (typeof o.id === 'string' && /^[a-z0-9-]{8,40}$/.test(o.id)) data.id = o.id
  if (o.currency !== undefined) {
    if (typeof o.currency !== 'string' || !/^[A-Z]{3}$/.test(o.currency)) return { ok: false, error: t.currency }
    data.currency = o.currency
  }
  for (const [f, max] of Object.entries(NUMBER_FIELDS) as [keyof typeof NUMBER_FIELDS, number][]) {
    if (o[f] === undefined || o[f] === null) continue
    if (!inRange(o[f], max)) return { ok: false, error: t.number(f, max) }
    data[f] = o[f] as number
  }
  if (o.venue !== undefined && o.venue !== null) {
    if (typeof o.venue !== 'object' || Array.isArray(o.venue)) return { ok: false, error: t.venue }
    const v = o.venue as Record<string, unknown>
    const venue: LinkVenue = {}
    if (v.model !== undefined && v.model !== null) {
      if (!MODELS.includes(v.model as ContractModel)) return { ok: false, error: t.model(String(v.model)) }
      venue.model = v.model as ContractModel
    }
    for (const [f, max] of Object.entries(VENUE_NUMBERS) as [keyof typeof VENUE_NUMBERS, number][]) {
      if (v[f] === undefined || v[f] === null) continue
      if (!inRange(v[f], max)) return { ok: false, error: t.number(`venue.${f}`, max) }
      venue[f] = v[f] as number
    }
    if (v.installments !== undefined && v.installments !== null) {
      if (typeof v.installments !== 'boolean') return { ok: false, error: t.installments }
      venue.installments = v.installments
    }
    if (v.payInFull !== undefined && v.payInFull !== null) {
      if (typeof v.payInFull !== 'boolean') return { ok: false, error: t.payInFull }
      venue.payInFull = v.payInFull
    }
    data.venue = venue
  }
  return { ok: true, data }
}
