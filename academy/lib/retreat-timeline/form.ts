// Форма таймлайна: паспорт + условия договора, перенос из ссылок (своей и калькулятора), черновик и ссылки наружу.
// В черновик и в ссылку идут только паспорт и условия — лист прибытия сюда не попадает по построению.

import { LIMITS, type ContractModel, type Venue } from '../retreat-calc/engine'
import { DEFAULT_FORM, toInputs, type Form } from '../retreat-calc/form'
import { encodeLink, type LinkVenue } from '../retreat-calc/link'
import { addMonths, isIsoDate, monthsBetween, type IsoDate } from '../retreat-core/dates'
import { pickPassport, passportFromCalcLink, type RetreatPassport } from '../retreat-core/passport'
import { encodeToolLink, type DecodedTool } from '../retreat-core/tool-link'
import type { TimelineTerms } from './engine'

export interface TimelineForm { passport: RetreatPassport; terms: TimelineTerms }

/** Поля таймлайна в ссылке: деньги — целые единицы валюты, как в ссылке калькулятора. */
export interface TimelineLinkTool {
  signDate?: IsoDate
  guestDepositPct?: number
  guestBalanceDueDays?: number
  guestRefundDays?: number
  venueNoReturnDays?: number
  venue?: LinkVenue & { payInFull?: boolean }
}

export const TIMELINE_DRAFT_KEY = 'retreat-timeline:draft'
export const TIMELINE_PATH = '/instrumenty/tajmlajn/'
export const CALC_PATH = '/instrumenty/kalkulyator-retrita/'
export const localePath = (path: string, locale: 'ru' | 'en') => (locale === 'en' ? `/en${path}` : path)

const MODELS: ContractModel[] = ['full_campus', 'per_guest', 'buyout']
const MONEY_MAX = LIMITS.moneyCents / 100
const inRange = (v: unknown, max: number): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max
const isDays = (v: unknown): v is number => Number.isInteger(v) && inRange(v, LIMITS.days)

export function defaultForm(today: IsoDate): TimelineForm {
  const calc = toInputs(DEFAULT_FORM)
  return {
    passport: { currency: calc.currency, start: addMonths(today, calc.monthsToStart), nights: calc.nights, guests: calc.guests },
    terms: {
      signDate: today, venue: calc.venue, guestDepositPct: 30, guestBalanceDueDays: calc.guestBalanceDueDays,
      guestRefundDays: calc.guestBalanceDueDays, venueNoReturnDays: calc.venue.finalDueDays,
    },
  }
}

/** Allowlist полей таймлайна из ссылки: лишнее и не те типы отбрасываются. */
export function pickTimelineTool(raw: unknown): TimelineLinkTool {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {}
  const o = raw as Record<string, unknown>
  const t: TimelineLinkTool = {}
  if (isIsoDate(o.signDate)) t.signDate = o.signDate
  if (inRange(o.guestDepositPct, 100)) t.guestDepositPct = o.guestDepositPct
  for (const f of ['guestBalanceDueDays', 'guestRefundDays', 'venueNoReturnDays'] as const) if (isDays(o[f])) t[f] = o[f]
  if (typeof o.venue === 'object' && o.venue !== null && !Array.isArray(o.venue)) {
    const v = o.venue as Record<string, unknown>
    const venue: TimelineLinkTool['venue'] = {}
    if (MODELS.includes(v.model as ContractModel)) venue.model = v.model as ContractModel
    for (const f of ['ratePerGuest', 'buyoutFee'] as const) if (inRange(v[f], MONEY_MAX)) venue[f] = v[f]
    for (const f of ['capacity', 'minGuests'] as const) if (Number.isInteger(v[f]) && inRange(v[f], LIMITS.guests)) venue[f] = v[f] as number
    for (const f of ['depositPct', 'payInFullDiscountPct'] as const) if (inRange(v[f], 100)) venue[f] = v[f]
    if (isDays(v.finalDueDays)) venue.finalDueDays = v.finalDueDays
    if (typeof v.installments === 'boolean') venue.installments = v.installments
    if (typeof v.payInFull === 'boolean') venue.payInFull = v.payInFull
    t.venue = venue
  }
  return t
}

function venueFromLink(base: Venue, v: TimelineLinkTool['venue'] | undefined): Venue {
  if (!v) return base
  const cents = (x: number | undefined, fallback: number) => (x === undefined ? fallback : Math.round(x * 100))
  return {
    ...base,
    model: v.model ?? base.model,
    ratePerGuest: cents(v.ratePerGuest, base.ratePerGuest),
    buyoutFee: cents(v.buyoutFee, base.buyoutFee),
    capacity: v.capacity ?? base.capacity,
    minGuests: v.minGuests ?? base.minGuests,
    depositPct: v.depositPct ?? base.depositPct,
    finalDueDays: v.finalDueDays ?? base.finalDueDays,
    payInFullDiscountPct: v.payInFullDiscountPct ?? base.payInFullDiscountPct,
    installments: v.installments ?? base.installments,
    payInFull: v.payInFull ?? base.payInFull,
  }
}

/** Форма из разобранной ссылки: своя ссылка или ссылка калькулятора v1 (подписание — сегодня). Ошибка ссылки — null. */
export function formFromDecoded(d: DecodedTool<TimelineLinkTool>, today: IsoDate): TimelineForm | null {
  if (!d.ok) return null
  const base = defaultForm(today)
  if (d.kind === 'calc') {
    const c = d.calc
    const venue = venueFromLink(base.terms.venue, c.venue)
    const balance = c.guestBalanceDueDays ?? base.terms.guestBalanceDueDays
    return {
      passport: { ...base.passport, ...passportFromCalcLink(c, today) },
      terms: {
        signDate: today, venue, guestDepositPct: c.guestDepositPct ?? base.terms.guestDepositPct,
        guestBalanceDueDays: balance, guestRefundDays: balance, venueNoReturnDays: venue.finalDueDays,
      },
    }
  }
  const t = d.link.tool
  const venue = venueFromLink(base.terms.venue, t.venue)
  return {
    passport: { ...base.passport, ...d.link.retreat },
    terms: {
      signDate: t.signDate ?? base.terms.signDate,
      venue,
      guestDepositPct: t.guestDepositPct ?? base.terms.guestDepositPct,
      guestBalanceDueDays: t.guestBalanceDueDays ?? base.terms.guestBalanceDueDays,
      guestRefundDays: t.guestRefundDays ?? t.guestBalanceDueDays ?? base.terms.guestRefundDays,
      venueNoReturnDays: t.venueNoReturnDays ?? venue.finalDueDays,
    },
  }
}

function toolOf(f: TimelineForm): TimelineLinkTool {
  const v = f.terms.venue
  return {
    signDate: f.terms.signDate,
    guestDepositPct: f.terms.guestDepositPct,
    guestBalanceDueDays: f.terms.guestBalanceDueDays,
    guestRefundDays: f.terms.guestRefundDays,
    venueNoReturnDays: f.terms.venueNoReturnDays,
    venue: {
      model: v.model, ratePerGuest: v.ratePerGuest / 100, buyoutFee: v.buyoutFee / 100, capacity: v.capacity,
      minGuests: v.minGuests, depositPct: v.depositPct, finalDueDays: v.finalDueDays,
      payInFullDiscountPct: v.payInFullDiscountPct, installments: v.installments, payInFull: v.payInFull,
    },
  }
}

/** Черновик для localStorage: только паспорт (по allowlist) и условия — ничего о гостях. */
export function draftOf(f: TimelineForm): string {
  return JSON.stringify({ passport: pickPassport(f.passport), tool: toolOf(f) })
}

export function formFromDraft(text: string | null, today: IsoDate): TimelineForm | null {
  if (!text) return null
  try {
    const o = JSON.parse(text) as Record<string, unknown>
    return formFromDecoded({ ok: true, kind: 'tool', link: { v: 1, retreat: pickPassport(o.passport), tool: pickTimelineTool(o.tool) } }, today)
  } catch {
    return null
  }
}

export function timelineHash(f: TimelineForm): string {
  return encodeToolLink({ v: 1, retreat: pickPassport(f.passport), tool: toolOf(f) })
}

/** Ссылка калькулятора v1 из таймлайна: срок до старта — полные месяцы от подписания. */
export function calcHashFromTimeline(f: TimelineForm): string {
  const p = f.passport
  const t = toolOf(f)
  const months = p.start && isIsoDate(p.start) ? Math.max(1, monthsBetween(f.terms.signDate, p.start)) : undefined
  return encodeLink({
    v: 1, title: p.title, currency: p.currency, guests: p.guests, nights: p.nights, monthsToStart: months,
    guestDepositPct: f.terms.guestDepositPct, guestBalanceDueDays: f.terms.guestBalanceDueDays,
    venue: { ...t.venue, payInFull: undefined } as LinkVenue,
  })
}

/** Для кнопки в калькуляторе: таймлайн с подписанием сегодня и стартом через «месяцев до старта». */
export function timelineHashFromCalcForm(calc: Form, today: IsoDate): string {
  const i = toInputs(calc)
  const deposit = i.guestDeposit.kind === 'pct' ? i.guestDeposit.value : undefined
  const months = Number.isInteger(i.monthsToStart) && i.monthsToStart >= 1 ? i.monthsToStart : 6
  const form: TimelineForm = {
    passport: pickPassport({ title: calc.title || undefined, currency: i.currency, start: addMonths(today, months), nights: i.nights, guests: i.guests }),
    terms: {
      signDate: today, venue: i.venue, guestDepositPct: deposit ?? 30, guestBalanceDueDays: i.guestBalanceDueDays,
      guestRefundDays: i.guestBalanceDueDays, venueNoReturnDays: i.venue.finalDueDays,
    },
  }
  return timelineHash(form)
}
