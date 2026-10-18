// Тексты года площадки RU/EN — один источник для страницы и CSV: месяцы, типы площадки, модели сделки, сценарии,
// строки итогов года и тексты проверок. Проза контроллера; термины — по курсу (05/u3, 05/u4): «выручка» и «итог»,
// а не «прибыль»; «чистый операционный доход», «доходность», «окупаемость» — с определением в подсказке.

import type { Lang } from '../retreat-calc/engine'
import type { DealModel, Scenario, VenueIssue, VenueType } from './engine'

export const MONTHS: Record<Lang, string[]> = {
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}
export const YEAR: Record<Lang, string> = { ru: 'Год', en: 'Year' }

export const VENUE_TYPE: Record<Lang, Record<VenueType, string>> = {
  ru: { 'all-season': 'Всесезонная', 'seasonal': 'Сезонная (глэмпинг)' },
  en: { 'all-season': 'All-season', 'seasonal': 'Seasonal (glamping)' },
}
export const DEAL: Record<Lang, Record<DealModel, string>> = {
  ru: { full_campus: 'Полный кампус', per_guest: 'Оплата за гостя с минимумом', buyout: 'Выкуп' },
  en: { full_campus: 'Full campus', per_guest: 'Per guest with a minimum', buyout: 'Buyout' },
}
export const SCENARIO: Record<Lang, Record<Scenario, string>> = {
  ru: { 'as-set': 'Как задано', 'nightly-only': 'Только посуточно', 'retreats-only': 'Только ретриты' },
  en: { 'as-set': 'As set', 'nightly-only': 'Nightly only', 'retreats-only': 'Retreats only' },
}

/** Строки итогов года под таблицей месяцев в CSV и на странице. */
export const TOTALS: Record<Lang, {
  revenue: string; noi: string; tax: string; ownerCash: string; yieldPct: string; payback: string; ownPayback: string
  noPayback: string; years: (y: string) => string
}> = {
  ru: {
    revenue: 'Выручка года',
    noi: 'Чистый операционный доход (до налога и долга)',
    tax: 'Налог',
    ownerCash: 'Денежный итог хозяина (после налога и долга)',
    yieldPct: 'Доходность, % в год (операционный доход ÷ вложения)',
    payback: 'Окупаемость проекта, лет',
    ownPayback: 'Окупаемость своих денег, лет',
    noPayback: 'не окупается',
    years: (y) => `${y} лет`,
  },
  en: {
    revenue: 'Revenue for the year',
    noi: 'Net operating income (before tax and debt)',
    tax: 'Tax',
    ownerCash: 'Owner’s cash result (after tax and debt)',
    yieldPct: 'Yield, % a year (operating income ÷ investment)',
    payback: 'Project payback, years',
    ownPayback: 'Payback of own money, years',
    noPayback: 'does not pay back',
    years: (y) => `${y} years`,
  },
}

export function issueText(i: VenueIssue, lang: Lang): string {
  const ru = lang === 'ru'
  const m = i.month !== undefined ? MONTHS[lang][i.month - 1] : ''
  switch (i.id) {
    case 'weeks-overflow':
      return ru ? `${m}: ретритные недели и пустые дни не помещаются в месяц.` : `${m}: retreat weeks and gap days do not fit in the month.`
    case 'retreat-in-closed-month':
      return ru ? `${m}: месяц закрыт, а в нём стоят гости. Выручка закрытого месяца не считается.` : `${m}: the month is closed but has guests. A closed month earns nothing.`
    case 'closed-months-free':
      return ru ? 'Закрытые месяцы ничего не стоят? Охрана, кредит, налоги на землю и консервация обычно остаются.' : 'Do closed months cost nothing? Security, loans, land taxes and winterising usually remain.'
    case 'season-too-short':
      return ru ? 'Открытые месяцы не покрывают расходы закрытых и годовые. Сезон короче, чем нужно.' : 'The open months do not cover the closed months and annual costs. The season is too short.'
    case 'week-loses-money':
      return ru ? `${m}: ретритная неделя даёт меньше, чем посуточная сдача тех же ночей.` : `${m}: a retreat week brings less than renting the same nights by the night.`
    case 'no-annual-costs':
      return ru ? 'Нет страховки, резерва на замену и налога. Без них окупаемость выходит слишком быстрой.' : 'No insurance, replacement reserve or tax. Without them payback looks far too quick.'
  }
}

export const DISCLAIMER: Record<Lang, string> = {
  ru: 'Это модель, а не финансовый совет. Налоги и долг — по правилам вашей страны и договора.',
  en: 'This is a model, not financial advice. Taxes and debt follow your country’s rules and your contracts.',
}
