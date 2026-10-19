// Лист прибытия: строка = гость (колонки шаблона курса arrival-list.<lang>.csv).
// Это данные гостей: они живут только в памяти страницы и в CSV у ведущего — ни в ссылке, ни в localStorage.

import type { Lang } from '../retreat-calc/engine'
import { addDays, isIsoDate } from '../retreat-core/dates'
import type { RetreatPassport } from '../retreat-core/passport'
import { parseCsv, toCsv } from '../retreat-core/csv'

export const ARRIVAL_FIELDS = [
  'guest', 'phone', 'flightIn', 'dateIn', 'timeIn', 'airport', 'meetBy', 'meetPoint',
  'flightOut', 'dateOut', 'timeOut', 'transferBack', 'booking', 'note',
] as const
export type ArrivalRow = Record<(typeof ARRIVAL_FIELDS)[number], string>

export const ARRIVAL_CSV_HEADER: Record<Lang, string[]> = {
  ru: ['Гость', 'Телефон в дороге', 'Рейс прибытия', 'Дата прибытия', 'Время прибытия', 'Аэропорт', 'Кто встречает',
    'Место встречи', 'Рейс отъезда', 'Дата отъезда', 'Время отъезда', 'Трансфер обратно', 'Статус брони', 'Примечание'],
  en: ['Guest', 'Phone on the way', 'Arrival flight', 'Arrival date', 'Arrival time', 'Airport', 'Who meets them',
    'Meeting point', 'Departure flight', 'Departure date', 'Departure time', 'Return transfer', 'Booking status', 'Note'],
}

export type ArrivalIssueId = 'arrival-after-start' | 'arrival-too-early' | 'departure-before-end' | 'no-meeter' | 'bad-date'
export interface ArrivalIssue { row: number; id: ArrivalIssueId }

export const emptyArrival = (): ArrivalRow =>
  Object.fromEntries(ARRIVAL_FIELDS.map((f) => [f, ''])) as ArrivalRow

const isHeader = (r: string[]) =>
  [ARRIVAL_CSV_HEADER.ru, ARRIVAL_CSV_HEADER.en].some((h) => h[0] === r[0]?.trim() && h[1] === r[1]?.trim())

/** Подсказка под таблицей шаблона: заполнена только первая колонка, и это фраза с точкой или двоеточием в конце,
 *  а не длинное имя гостя. */
const isNote = (r: string[]) => {
  const first = (r[0] ?? '').trim()
  return r.slice(1).every((v) => v.trim() === '') && first.split(/\s+/).length >= 5 && /[.:]$/.test(first)
}

/** Дата из таблицы: ISO как есть; `ДД.ММ.ГГГГ` (так выгружают Excel и Google Sheets в RU-локали) — в ISO.
 *  Американское `М/Д/ГГГГ` не угадываем: оно неотличимо от `Д/М/ГГГГ`, такую дату проверка отметит. */
export function normalizeDate(s: string, lang?: Lang): string {
  const value = s.trim()
  const isoParts = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(value)
  const dotParts = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value)
  const slashParts = lang ? /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value) : null
  const m = isoParts
    ? [isoParts[1], isoParts[2], isoParts[3]]
    : dotParts
      ? [dotParts[3], dotParts[2], dotParts[1]]
      : slashParts
        ? lang === 'en' ? [slashParts[3], slashParts[1], slashParts[2]] : [slashParts[3], slashParts[2], slashParts[1]]
        : null
  if (!m) return value
  const iso = `${m[0]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
  return isIsoDate(iso) ? iso : value
}

/** Строки из CSV любой таблицы; заголовок и подсказки шаблона курса (RU или EN) пропускаются, колонки — по порядку шаблона. */
export function parseArrivalsCsv(text: string, lang?: Lang): ArrivalRow[] {
  const rows = parseCsv(text).filter((r) => !isNote(r))
  const header = rows[0]
  const body = rows.length && isHeader(rows[0]) ? rows.slice(1) : rows
  const oldFields = ARRIVAL_FIELDS.filter((f) => f !== 'booking')
  // с заголовком формат читается по нему; без заголовка — по ширине строки: 14 колонок — новый, меньше — старый без брони
  const withHeader = !!header && isHeader(header)
  const hasBooking = withHeader && (header.includes(ARRIVAL_CSV_HEADER.ru[12]) || header.includes(ARRIVAL_CSV_HEADER.en[12]))
  return body.map((r) => {
    const sourceFields = (withHeader ? hasBooking : r.length >= ARRIVAL_FIELDS.length) ? ARRIVAL_FIELDS : oldFields
    const row = emptyArrival()
    sourceFields.forEach((f, i) => { row[f] = (r[i] ?? '').trim() })
    return { ...row, dateIn: normalizeDate(row.dateIn, lang), dateOut: normalizeDate(row.dateOut, lang) }
  })
}

export function arrivalsToCsv(rows: ArrivalRow[], lang: Lang): string {
  return toCsv([ARRIVAL_CSV_HEADER[lang], ...rows.map((r) => ARRIVAL_FIELDS.map((f) => r[f]))], lang)
}

/** Проверки дат относительно паспорта. Номер строки — с 1, как видит ведущий. */
export function checkArrivals(rows: ArrivalRow[], p: RetreatPassport, lang?: Lang): ArrivalIssue[] {
  const issues: ArrivalIssue[] = []
  if (!p.start || !isIsoDate(p.start)) return issues
  const end = addDays(p.start, p.nights ?? 0)
  rows.forEach((raw, i) => {
    const row = i + 1
    // дата, набранная руками как ДД.ММ.ГГГГ, проверяется так же, как пришедшая из CSV
    const r = { ...raw, dateIn: normalizeDate(raw.dateIn, lang), dateOut: normalizeDate(raw.dateOut, lang) }
    if ((r.dateIn && !isIsoDate(r.dateIn)) || (r.dateOut && !isIsoDate(r.dateOut))) issues.push({ row, id: 'bad-date' })
    if (isIsoDate(r.dateIn)) {
      if (r.dateIn > p.start!) issues.push({ row, id: 'arrival-after-start' })
      if (r.dateIn < addDays(p.start!, -2)) issues.push({ row, id: 'arrival-too-early' })
    }
    if (isIsoDate(r.dateOut) && r.dateOut < end) issues.push({ row, id: 'departure-before-end' })
    if (!r.meetBy.trim()) issues.push({ row, id: 'no-meeter' })
  })
  return issues
}
