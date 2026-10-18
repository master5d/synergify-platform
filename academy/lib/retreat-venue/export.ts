import type { Lang } from '../retreat-calc/engine'
import { computeYear, type VenueYear } from './engine'
import { MONTHS, TOTALS, YEAR } from './labels'
import { toCsv } from '../retreat-core/csv'
import { menuMoney } from '../retreat-menu/export'

const HEADER: Record<Lang, string[]> = {
  ru: [
    'Месяц', 'Ретритных недель', 'Гостей в группе', 'Ставка за гостя в неделю', 'Посуточных ночей', 'Цена ночи',
    'Пустых дней между группами', 'Выручка ретритов', 'Выручка посуточно', 'Расходы месяца', 'Итог месяца',
  ],
  en: [
    'Month', 'Retreat weeks', 'Guests per group', 'Rate per guest per week', 'Nightly-let nights', 'Night price',
    'Empty days between groups', 'Retreat revenue', 'Nightly revenue', 'Month expenses', 'Month total',
  ],
}

export function venueHeader(lang: Lang): string[] {
  return [...HEADER[lang]]
}

function decimal(value: number, lang: Lang): string {
  const result = value.toFixed(1)
  return lang === 'ru' ? result.replace('.', ',') : result
}

function money(value: number, lang: Lang): string {
  return menuMoney(value, lang)
}

function monthRow(v: VenueYear, month: number, lang: Lang, result: ReturnType<typeof computeYear>['months'][number]): string[] {
  const source = v.months[month - 1]
  const weeks = result.open ? source.retreatWeeks : 0
  const guests = result.open ? source.groupGuests : 0
  const rate = source.rateCents ?? v.rateCents
  const gapDays = result.open ? source.gapDays * weeks : 0
  const expenses = result.variableCents + result.fixedCents
  return [
    MONTHS[lang][month - 1], String(weeks), String(guests), money(rate, lang), String(result.nightlyNights),
    money(v.nightPriceCents, lang), String(gapDays), money(result.retreatRevenueCents, lang),
    money(result.nightlyRevenueCents, lang), money(expenses, lang), money(result.resultCents, lang),
  ]
}

function yearRow(v: VenueYear, lang: Lang, results: ReturnType<typeof computeYear>): string[] {
  const weeks = results.months.reduce((sum, month, i) => sum + (month.open ? v.months[i].retreatWeeks : 0), 0)
  const nights = results.months.reduce((sum, month) => sum + month.nightlyNights, 0)
  const gaps = results.months.reduce((sum, month, i) => {
    const source = v.months[i]
    return sum + (month.open ? source.gapDays * source.retreatWeeks : 0)
  }, 0)
  const expenses = results.months.reduce((sum, month) => sum + month.variableCents + month.fixedCents, 0)
  const total = results.months.reduce((sum, month) => sum + month.resultCents, 0)
  return [
    YEAR[lang], String(weeks), '', '', String(nights), '', String(gaps), money(
      results.revenueCents - results.months.reduce((sum, month) => sum + month.nightlyRevenueCents, 0), lang),
    money(results.months.reduce((sum, month) => sum + month.nightlyRevenueCents, 0), lang), money(expenses, lang), money(total, lang),
  ]
}

function totalRows(lang: Lang, results: ReturnType<typeof computeYear>): string[][] {
  const t = TOTALS[lang]
  // число без единицы: «лет» уже в подписи строки, и ячейку можно посчитать в таблице
  const payback = (years: number | null) => years === null ? t.noPayback : decimal(years, lang)
  return [
    [t.revenue, money(results.revenueCents, lang)],
    [t.noi, money(results.noiCents, lang)],
    [t.tax, money(results.taxCents, lang)],
    [t.ownerCash, money(results.ownerCashCents, lang)],
    [t.yieldPct, results.yieldPct === null ? '' : decimal(results.yieldPct, lang)],
    [t.payback, payback(results.paybackYears)],
    [t.ownPayback, payback(results.ownPaybackYears)],
  ]
}

export function venueRows(v: VenueYear, lang: Lang): string[][] {
  const results = computeYear(v)
  return [
    venueHeader(lang),
    ...results.months.map((result, i) => monthRow(v, i + 1, lang, result)),
    yearRow(v, lang, results),
    ['', ''],
    ...totalRows(lang, results),
  ]
}

export function venueToCsv(v: VenueYear, lang: Lang): string {
  return toCsv(venueRows(v, lang), lang)
}
