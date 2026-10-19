// Движок таймлайна ретрита: вехи и платежи по датам от даты старта и условий договора (spec подпроекта B, §5.3).
// Только арифметика дат и денег, без сети. Платежи площадке — тот же график, что у калькулятора (venuePayments).

import { LIMITS, venuePayments, type Lang, type Venue } from '../retreat-calc/engine'
import { addDays, addMonths, daysBetween, isIsoDate, monthsBetween, type IsoDate } from '../retreat-core/dates'
import { validatePassport, type RetreatPassport } from '../retreat-core/passport'

export interface TimelineTerms {
  /** Подписание договора с площадкой. */
  signDate: IsoDate
  /** Условия площадки — те же поля, что у калькулятора (деньги в центах). */
  venue: Venue
  guestDepositPct: number
  /** Доплата гостей — дней до старта. */
  guestBalanceDueDays: number
  /** До этого срока гость отменяет с возвратом. */
  guestRefundDays: number
  /** Точка невозврата у площадки: позже отмена ведущего стоит полной суммы. */
  venueNoReturnDays: number
}

export const MILESTONE_ORDER = [
  'group-minimum', 'sign', 'venue-deposit', 'venue-installment', 'venue-final', 'sales-open', 'go-no-go',
  'guest-balance', 'guest-refund-deadline', 'form-send', 'form-answers', 'menu-to-chef',
  'arrivals-final', 'arrival', 'departure',
] as const
export type MilestoneId = (typeof MILESTONE_ORDER)[number]
export type Who = 'leader' | 'venue' | 'both' | 'guests'
export type Source = 'contract' | 'sales' | 'course-default' | 'passport' | 'calculator'

export interface Milestone {
  id: MilestoneId
  /** Номер взноса у 'venue-installment'. */
  n?: number
  date: IsoDate
  /** Дней до старта (у выезда — отрицательное). */
  daysBefore: number
  who: Who
  amountCents: number | null
  source: Source
  status: 'past' | 'soon' | null
  minimumGuests?: number
}

export type WarningId = 'guest-refund-after-venue-no-return' | 'resale-buffer-short' | 'sign-after-venue-final' | 'milestone-in-past'
export interface TimelineWarning {
  id: WarningId
  milestone?: MilestoneId
  n?: number
  days?: number
}

/** Запас между сроком отмены гостей и точкой невозврата площадки — на перепродажу места (курс, 02/u1). */
export const RESALE_BUFFER_DAYS = 14
/** Сроки по умолчанию из курса (04/u3, 04/u4), дней до старта. */
export const COURSE_DEFAULT_DAYS = { 'form-send': 45, 'form-answers': 30, 'menu-to-chef': 21, 'arrivals-final': 7 } as const

const MESSAGES = {
  ru: {
    required: (f: string) => `${f}: обязательное поле`,
    signDate: 'signDate: ожидалась дата ГГГГ-ММ-ДД',
    signAfterStart: 'signDate: подписание позже даты старта',
    days: (f: string) => `${f}: ожидалось целое от 0 до ${LIMITS.days}`,
    percent: (f: string) => `${f}: ожидался процент 0–100`,
    money: (f: string) => `${f}: ожидалась неотрицательная сумма`,
    capacity: 'venue.capacity: ожидалось целое ≥ 1',
  },
  en: {
    required: (f: string) => `${f}: required`,
    signDate: 'signDate: expected a date YYYY-MM-DD',
    signAfterStart: 'signDate: signing is after the start date',
    days: (f: string) => `${f}: expected an integer from 0 to ${LIMITS.days}`,
    percent: (f: string) => `${f}: expected a percentage 0–100`,
    money: (f: string) => `${f}: expected a non-negative amount`,
    capacity: 'venue.capacity: expected an integer ≥ 1',
  },
}

const isDays = (v: unknown) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= LIMITS.days
const isPct = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100
const isMoney = (v: unknown) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= LIMITS.moneyCents

/** Ошибки с именем поля на языке страницы; пустой список — можно строить. */
export function validateTimeline(p: RetreatPassport, t: TimelineTerms, lang: Lang): string[] {
  const m = MESSAGES[lang]
  const errors = validatePassport(p, lang)
  for (const f of ['start', 'nights', 'guests'] as const) if (p[f] === undefined) errors.push(m.required(f))
  if (!isIsoDate(t.signDate)) errors.push(m.signDate)
  else if (p.start !== undefined && isIsoDate(p.start) && t.signDate > p.start) errors.push(m.signAfterStart)
  for (const f of ['guestBalanceDueDays', 'guestRefundDays', 'venueNoReturnDays'] as const) if (!isDays(t[f])) errors.push(m.days(f))
  if (!isPct(t.guestDepositPct)) errors.push(m.percent('guestDepositPct'))
  const v = t.venue
  if (!isDays(v.finalDueDays)) errors.push(m.days('venue.finalDueDays'))
  for (const f of ['depositPct', 'payInFullDiscountPct'] as const) if (!isPct(v[f])) errors.push(m.percent(`venue.${f}`))
  for (const f of ['ratePerGuest', 'buyoutFee'] as const) if (!isMoney(v[f])) errors.push(m.money(`venue.${f}`))
  if (v.model === 'full_campus' && !(Number.isInteger(v.capacity) && v.capacity >= 1)) errors.push(m.capacity)
  return errors
}

const WHO: Record<MilestoneId, Who> = {
  'group-minimum': 'leader', 'sign': 'both', 'venue-deposit': 'leader', 'venue-installment': 'leader', 'venue-final': 'leader',
  'sales-open': 'leader', 'go-no-go': 'both', 'guest-balance': 'guests', 'guest-refund-deadline': 'guests',
  'form-send': 'leader', 'form-answers': 'guests', 'menu-to-chef': 'leader', 'arrivals-final': 'leader',
  'arrival': 'both', 'departure': 'both',
}

export function buildTimeline(p: RetreatPassport, t: TimelineTerms, today: IsoDate): { milestones: Milestone[]; warnings: TimelineWarning[] } {
  const errors = validateTimeline(p, t, 'en')
  if (errors.length) throw new Error(errors.join('; '))
  const start = p.start as IsoDate
  const guests = p.guests as number
  const nights = p.nights as number
  const out: Milestone[] = []
  const add = (id: MilestoneId, date: IsoDate, source: Source, amountCents: number | null = null, n?: number, minimumGuests?: number) =>
    out.push({
      id, ...(n !== undefined ? { n } : {}), date, daysBefore: daysBetween(date, start), who: WHO[id], amountCents, source,
      status: date < today ? 'past' : daysBetween(today, date) <= 14 ? 'soon' : null,
      ...(minimumGuests !== undefined ? { minimumGuests } : {}),
    })

  add('group-minimum', t.signDate, 'calculator', null, undefined, t.venue.minGuests > 0 ? t.venue.minGuests : undefined)
  add('sign', t.signDate, 'contract')
  const venueFinal = addDays(start, -t.venue.finalDueDays)
  const schedule = venuePayments(t.venue, guests, Math.max(1, monthsBetween(t.signDate, start)), daysBetween(t.signDate, start)).schedule
  schedule.forEach((pay, i) => {
    if (pay.amount === 0) return                       // депозит 0 % — не платёж, а шум в календаре
    if (i === 0) add('venue-deposit', t.signDate, 'contract', pay.amount)
    else if (i === schedule.length - 1) add('venue-final', venueFinal, 'contract', pay.amount)
    else add('venue-installment', addMonths(t.signDate, pay.month), 'contract', pay.amount, i)
  })
  add('sales-open', t.signDate, 'sales')
  add('go-no-go', addDays(start, -t.venueNoReturnDays), 'contract')
  add('guest-balance', addDays(start, -t.guestBalanceDueDays), 'sales')
  add('guest-refund-deadline', addDays(start, -t.guestRefundDays), 'sales')
  for (const [id, days] of Object.entries(COURSE_DEFAULT_DAYS) as [MilestoneId, number][]) add(id, addDays(start, -days), 'course-default')
  add('arrival', start, 'passport')
  add('departure', addDays(start, nights), 'passport')

  const rank = (id: MilestoneId) => MILESTONE_ORDER.indexOf(id)
  out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : rank(a.id) - rank(b.id) || (a.n ?? 0) - (b.n ?? 0)))

  const warnings: TimelineWarning[] = []
  if (t.signDate >= venueFinal) warnings.push({ id: 'sign-after-venue-final' })
  const gap = t.guestRefundDays - t.venueNoReturnDays
  if (gap < 0) warnings.push({ id: 'guest-refund-after-venue-no-return' })
  else if (gap < RESALE_BUFFER_DAYS) warnings.push({ id: 'resale-buffer-short', days: gap })
  for (const ms of out) {
    // всё, что случается в день подписания (договор, депозит, старт продаж), уже позади по определению — не шумим
    if (ms.date !== t.signDate && ms.date < today) warnings.push({ id: 'milestone-in-past', milestone: ms.id, ...(ms.n !== undefined ? { n: ms.n } : {}) })
  }
  return { milestones: out, warnings }
}
