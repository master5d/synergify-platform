import { type Lang } from '../retreat-calc/engine'

export type VenueType = 'all-season' | 'seasonal'
export type DealModel = 'full_campus' | 'per_guest' | 'buyout'

export interface MonthInput {
  open: boolean
  retreatWeeks: number
  groupGuests: number
  /** Из гостей группы — живут вне площадки (местные, своё жильё за свой счёт): платят дневную ставку, места не занимают. */
  offsiteGuests: number
  rateCents: number | null
  nightlyOccupancyPct: number
  gapDays: number
}

export interface VenueYear {
  type: VenueType
  units: number
  groupBeds: number
  /** Вместимость зала для практик: предел всей группы вместе с живущими вне площадки. */
  hallCapacity: number
  nightPriceCents: number
  deal: DealModel
  rateCents: number
  minGuests: number
  buyoutFeeCents: number
  /** Ставка за гостя без проживания за ретритную неделю (зал, питание, территория) — сверх любой модели сделки. */
  dayRateCents: number
  varPerGuestWeekCents: number
  varPerOffsiteGuestWeekCents: number
  varPerNightCents: number
  fixedOpenMonthCents: number
  fixedClosedMonthCents: number
  insuranceCents: number
  replacementReserveCents: number
  taxPct: number
  debtServiceCents: number
  seasonOpenCents: number
  seasonCloseCents: number
  investmentCents: number
  borrowedCents: number
  months: MonthInput[]
}

export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const
export const VENUE_LIMITS = { units: 500, weeks: 5, pct: 100, moneyCents: 1_000_000_000 } as const

export interface MonthResult {
  month: number
  open: boolean
  nights: number
  retreatNights: number
  gapNights: number
  nightlyNights: number
  occupancyPct: number
  retreatRevenueCents: number
  nightlyRevenueCents: number
  variableCents: number
  fixedCents: number
  resultCents: number
  weekContributionCents: number | null
}

export interface YearResult {
  months: MonthResult[]
  revenueCents: number
  noiCents: number
  taxCents: number
  ownerCashCents: number
  yieldPct: number | null
  paybackYears: number | null
  ownPaybackYears: number | null
}

export type Scenario = 'as-set' | 'nightly-only' | 'retreats-only'
export type VenueIssueId = 'weeks-overflow' | 'retreat-in-closed-month' | 'closed-months-free'
  | 'season-too-short' | 'week-loses-money' | 'no-annual-costs' | 'guests-over-beds' | 'group-over-hall'
export interface VenueIssue { id: VenueIssueId; month?: number }

const MESSAGES = {
  ru: {
    integer: (field: string) => `${field}: ожидалось целое число ≥ 0`,
    money: (field: string) => `${field}: ожидалась неотрицательная сумма`,
    pct: (field: string) => `${field}: ожидался процент 0–100`,
    limit: (field: string, max: number) => `${field}: больше допустимого (${max})`,
    months: 'months: ожидалось ровно 12 месяцев',
    notMore: (field: string, other: string) => `${field}: не может быть больше, чем «${other}»`,
    type: 'type: ожидалось all-season или seasonal',
    deal: 'deal: ожидалось full_campus, per_guest или buyout',
  },
  en: {
    integer: (field: string) => `${field}: expected a non-negative integer`,
    money: (field: string) => `${field}: expected a non-negative amount`,
    pct: (field: string) => `${field}: expected a percentage 0–100`,
    limit: (field: string, max: number) => `${field}: above the allowed maximum (${max})`,
    months: 'months: expected exactly 12 months',
    notMore: (field: string, other: string) => `${field}: cannot be greater than “${other}”`,
    type: 'type: expected all-season or seasonal',
    deal: 'deal: expected full_campus, per_guest or buyout',
  },
} as const

export function defaultVenue(): VenueYear {
  const month = (): MonthInput => ({
    open: true, retreatWeeks: 0, groupGuests: 0, offsiteGuests: 0, rateCents: null,
    nightlyOccupancyPct: 0, gapDays: 1,
  })
  return {
    type: 'all-season', units: 6, groupBeds: 12, hallCapacity: 12, nightPriceCents: 0,
    deal: 'per_guest', rateCents: 0, minGuests: 0, buyoutFeeCents: 0, dayRateCents: 0,
    varPerGuestWeekCents: 0, varPerOffsiteGuestWeekCents: 0, varPerNightCents: 0, fixedOpenMonthCents: 0,
    fixedClosedMonthCents: 0, insuranceCents: 0, replacementReserveCents: 0,
    taxPct: 0, debtServiceCents: 0, seasonOpenCents: 0, seasonCloseCents: 0,
    investmentCents: 0, borrowedCents: 0, months: Array.from({ length: 12 }, month),
  }
}

function nonNegativeInteger(v: number): boolean { return Number.isInteger(v) && v >= 0 }
function money(v: number): boolean { return nonNegativeInteger(v) && v <= VENUE_LIMITS.moneyCents }

/** `name` переводит ключ поля (`borrowedCents`, `months[1].gapDays`) в подпись страницы; без него в тексте — ключ. */
export function validateVenue(v: VenueYear, lang: Lang, name: (field: string) => string = (field) => field): string[] {
  const t = MESSAGES[lang]
  const errors: string[] = []
  const integer = (field: string, value: number, max?: number) => {
    if (!nonNegativeInteger(value)) errors.push(t.integer(name(field)))
    else if (max !== undefined && value > max) errors.push(t.limit(name(field), max))
  }
  const amount = (field: string, value: number) => {
    if (!money(value)) errors.push(t.money(name(field)))
  }
  const percent = (field: string, value: number) => {
    if (!Number.isFinite(value) || value < 0 || value > VENUE_LIMITS.pct) errors.push(t.pct(name(field)))
  }
  if (v.type !== 'all-season' && v.type !== 'seasonal') errors.push(t.type)
  if (!['full_campus', 'per_guest', 'buyout'].includes(v.deal)) errors.push(t.deal)
  integer('units', v.units, VENUE_LIMITS.units)
  integer('groupBeds', v.groupBeds, VENUE_LIMITS.units)
  integer('hallCapacity', v.hallCapacity, VENUE_LIMITS.units)
  amount('nightPriceCents', v.nightPriceCents)
  amount('rateCents', v.rateCents)
  integer('minGuests', v.minGuests, VENUE_LIMITS.units)
  amount('buyoutFeeCents', v.buyoutFeeCents)
  amount('dayRateCents', v.dayRateCents)
  amount('varPerGuestWeekCents', v.varPerGuestWeekCents)
  amount('varPerOffsiteGuestWeekCents', v.varPerOffsiteGuestWeekCents)
  amount('varPerNightCents', v.varPerNightCents)
  amount('fixedOpenMonthCents', v.fixedOpenMonthCents)
  amount('fixedClosedMonthCents', v.fixedClosedMonthCents)
  amount('insuranceCents', v.insuranceCents)
  amount('replacementReserveCents', v.replacementReserveCents)
  percent('taxPct', v.taxPct)
  amount('debtServiceCents', v.debtServiceCents)
  amount('seasonOpenCents', v.seasonOpenCents)
  amount('seasonCloseCents', v.seasonCloseCents)
  amount('investmentCents', v.investmentCents)
  amount('borrowedCents', v.borrowedCents)
  if (v.borrowedCents > v.investmentCents) errors.push(t.notMore(name('borrowedCents'), name('investmentCents')))
  if (v.months.length !== 12) errors.push(t.months)
  v.months.forEach((m, i) => {
    integer(`months[${i}].retreatWeeks`, m.retreatWeeks, VENUE_LIMITS.weeks)
    integer(`months[${i}].groupGuests`, m.groupGuests, VENUE_LIMITS.units)
    integer(`months[${i}].offsiteGuests`, m.offsiteGuests, VENUE_LIMITS.units)
    if (m.offsiteGuests > m.groupGuests) errors.push(t.notMore(name(`months[${i}].offsiteGuests`), name(`months[${i}].groupGuests`)))
    if (m.rateCents !== null) amount(`months[${i}].rateCents`, m.rateCents)
    percent(`months[${i}].nightlyOccupancyPct`, m.nightlyOccupancyPct)
    integer(`months[${i}].gapDays`, m.gapDays, DAYS_IN_MONTH[i])
  })
  return errors
}

/** Выручка одной ретритной недели. `guests` — вся группа, `offsite` — из неё живут вне площадки: модель сделки
 * считается по живущим (минимум гостей — тоже по ним), живущие снаружи платят дневную ставку сверху. */
export function retreatRevenue(v: VenueYear, guests: number, rateCents: number, offsite = 0): number {
  const residents = Math.max(0, guests - offsite)
  const day = v.dayRateCents * offsite
  if (v.deal === 'full_campus') return rateCents * v.groupBeds + day
  if (v.deal === 'per_guest') return rateCents * Math.max(residents, v.minGuests) + day
  return v.buyoutFeeCents + rateCents * residents + day
}

/** Переменные расходы одной ретритной недели: живущим — кухня, бельё, уборка; живущим снаружи — только кухня. */
function weekVariableCents(v: VenueYear, guests: number, offsite: number): number {
  return v.varPerGuestWeekCents * Math.max(0, guests - offsite) + v.varPerOffsiteGuestWeekCents * offsite
}

function monthResult(v: VenueYear, source: MonthInput, month: number, scenario: Scenario): MonthResult {
  const open = v.type === 'all-season' || source.open
  const weeks = scenario === 'nightly-only' ? 0 : source.retreatWeeks
  const occupancy = scenario === 'retreats-only' ? 0 : source.nightlyOccupancyPct
  const days = DAYS_IN_MONTH[month - 1]
  const nights = v.units * days
  const retreatNights = 7 * weeks * v.units
  const gapNights = source.gapDays * weeks * v.units
  const freeDays = days - (7 + source.gapDays) * weeks
  const nightlyNights = freeDays > 0 ? Math.round(freeDays * v.units * occupancy / 100) : 0
  const rate = source.rateCents ?? v.rateCents
  const retreatRevenueCents = open ? Math.round(retreatRevenue(v, source.groupGuests, rate, source.offsiteGuests) * weeks) : 0
  const nightlyRevenueCents = open ? Math.round(nightlyNights * v.nightPriceCents) : 0
  const variableCents = open
    ? Math.round(weekVariableCents(v, source.groupGuests, source.offsiteGuests) * weeks + v.varPerNightCents * nightlyNights)
    : 0
  const fixedCents = open ? v.fixedOpenMonthCents : v.fixedClosedMonthCents
  const resultCents = Math.round(retreatRevenueCents + nightlyRevenueCents - variableCents - fixedCents)
  const occupiedNights = open ? retreatNights + nightlyNights : 0
  // недели, что не влезают в месяц, ночей не добавляют: загрузка не выше 100 %, о переполнении говорит проверка
  const occupancyPct = nights ? Math.min(100, Math.round(occupiedNights / nights * 1000) / 10) : 0
  let weekContributionCents: number | null = null
  if (open && weeks > 0) {
    const weekRevenue = retreatRevenue(v, source.groupGuests, rate, source.offsiteGuests)
    const weekVariable = weekVariableCents(v, source.groupGuests, source.offsiteGuests)
    const displacedMargin = (7 + source.gapDays) * v.units * occupancy / 100
      * (v.nightPriceCents - v.varPerNightCents)
    weekContributionCents = Math.round(weekRevenue - weekVariable - displacedMargin)
  }
  return {
    month, open, nights, retreatNights: open ? retreatNights : 0, gapNights: open ? gapNights : 0,
    nightlyNights: open ? nightlyNights : 0, occupancyPct, retreatRevenueCents, nightlyRevenueCents,
    variableCents, fixedCents, resultCents, weekContributionCents,
  }
}

export function computeYear(v: VenueYear, scenario: Scenario = 'as-set'): YearResult {
  const errors = validateVenue(v, 'en')
  if (errors.length) throw new Error(errors.join('; '))
  const months = v.months.map((m, i) => monthResult(v, m, i + 1, scenario))
  const revenueCents = months.reduce((sum, m) => sum + m.retreatRevenueCents + m.nightlyRevenueCents, 0)
  const monthTotal = months.reduce((sum, m) => sum + m.resultCents, 0)
  const seasonalCosts = v.type === 'seasonal' ? v.seasonOpenCents + v.seasonCloseCents : 0
  const noiCents = monthTotal - v.insuranceCents - v.replacementReserveCents - seasonalCosts
  const taxCents = Math.round(Math.max(0, noiCents) * v.taxPct / 100)
  const ownerCashCents = noiCents - taxCents - v.debtServiceCents
  return {
    months, revenueCents, noiCents, taxCents, ownerCashCents,
    yieldPct: v.investmentCents ? noiCents / v.investmentCents * 100 : null,
    paybackYears: noiCents - taxCents > 0 ? v.investmentCents / (noiCents - taxCents) : null,
    ownPaybackYears: ownerCashCents > 0 ? (v.investmentCents - v.borrowedCents) / ownerCashCents : null,
  }
}

export function checkVenue(v: VenueYear): VenueIssue[] {
  const issues: VenueIssue[] = []
  v.months.forEach((m, i) => {
    const open = v.type === 'all-season' || m.open
    if ((7 + m.gapDays) * m.retreatWeeks > DAYS_IN_MONTH[i]) issues.push({ id: 'weeks-overflow', month: i + 1 })
    if (v.type === 'seasonal' && !m.open && (m.retreatWeeks > 0 || m.nightlyOccupancyPct > 0)) {
      issues.push({ id: 'retreat-in-closed-month', month: i + 1 })
    }
    if (open && m.retreatWeeks > 0 && m.groupGuests - m.offsiteGuests > v.groupBeds) issues.push({ id: 'guests-over-beds', month: i + 1 })
    if (open && m.retreatWeeks > 0 && m.groupGuests > v.hallCapacity) issues.push({ id: 'group-over-hall', month: i + 1 })
    if (open && m.retreatWeeks > 0) {
      const result = monthResult(v, m, i + 1, 'as-set')
      if (result.weekContributionCents !== null && result.weekContributionCents <= 0) {
        issues.push({ id: 'week-loses-money', month: i + 1 })
      }
    }
  })
  if (v.type === 'seasonal' && v.months.some((m) => !m.open) && v.fixedClosedMonthCents === 0) {
    issues.push({ id: 'closed-months-free' })
  }
  if (v.type === 'seasonal') {
    const openResult = v.months.map((m, i) => monthResult(v, m, i + 1, 'as-set'))
      .filter((m) => m.open).reduce((s, m) => s + m.resultCents, 0)
    const closedCosts = v.months.filter((m) => !m.open).length * v.fixedClosedMonthCents
    const seasonalCosts = v.insuranceCents + v.replacementReserveCents + v.seasonOpenCents
      + v.seasonCloseCents + closedCosts
    if (openResult < seasonalCosts) issues.push({ id: 'season-too-short' })
  }
  if (v.insuranceCents === 0 && v.replacementReserveCents === 0 && v.taxPct === 0) {
    issues.push({ id: 'no-annual-costs' })
  }
  return issues
}
