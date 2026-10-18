// Лист прибытия: строка = гость (колонки шаблона курса arrival-list.<lang>.csv).
// Это данные гостей: они живут только в памяти страницы и в CSV у ведущего — ни в ссылке, ни в localStorage.

import type { Lang } from '../retreat-calc/engine'
import { addDays, isIsoDate } from '../retreat-core/dates'
import type { RetreatPassport } from '../retreat-core/passport'
import { parseCsv, toCsv } from './csv'

export const ARRIVAL_FIELDS = [
  'guest', 'phone', 'flightIn', 'dateIn', 'timeIn', 'airport', 'meetBy', 'meetPoint',
  'flightOut', 'dateOut', 'timeOut', 'transferBack', 'note',
] as const
export type ArrivalRow = Record<(typeof ARRIVAL_FIELDS)[number], string>

export const ARRIVAL_CSV_HEADER: Record<Lang, string[]> = {
  ru: ['Гость', 'Телефон в дороге', 'Рейс прибытия', 'Дата прибытия', 'Время прибытия', 'Аэропорт', 'Кто встречает',
    'Место встречи', 'Рейс отъезда', 'Дата отъезда', 'Время отъезда', 'Трансфер обратно', 'Примечание'],
  en: ['Guest', 'Phone on the way', 'Arrival flight', 'Arrival date', 'Arrival time', 'Airport', 'Who meets them',
    'Meeting point', 'Departure flight', 'Departure date', 'Departure time', 'Return transfer', 'Note'],
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

/** Байты файла → текст: UTF-8, а если файл не в UTF-8 — cp1251 (так сохраняет «CSV (разделители — запятые)»
 *  русский Excel). Без этого кириллица молча превращалась бы в «�». */
export function decodeCsvBytes(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1251').decode(bytes)
  }
}

/** Дата из таблицы: ISO как есть; `ДД.ММ.ГГГГ` (так выгружают Excel и Google Sheets в RU-локали) — в ISO.
 *  Американское `М/Д/ГГГГ` не угадываем: оно неотличимо от `Д/М/ГГГГ`, такую дату проверка отметит. */
export function normalizeDate(s: string): string {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(s.trim())
  if (!m) return s.trim()
  const iso = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return isIsoDate(iso) ? iso : s.trim()
}

/** Строки из CSV любой таблицы; заголовок и подсказки шаблона курса (RU или EN) пропускаются, колонки — по порядку шаблона. */
export function parseArrivalsCsv(text: string): ArrivalRow[] {
  const rows = parseCsv(text).filter((r) => !isNote(r))
  const body = rows.length && isHeader(rows[0]) ? rows.slice(1) : rows
  return body.map((r) => {
    const row = Object.fromEntries(ARRIVAL_FIELDS.map((f, i) => [f, (r[i] ?? '').trim()])) as ArrivalRow
    return { ...row, dateIn: normalizeDate(row.dateIn), dateOut: normalizeDate(row.dateOut) }
  })
}

export function arrivalsToCsv(rows: ArrivalRow[], lang: Lang): string {
  return toCsv([ARRIVAL_CSV_HEADER[lang], ...rows.map((r) => ARRIVAL_FIELDS.map((f) => r[f]))], lang)
}

/** Проверки дат относительно паспорта. Номер строки — с 1, как видит ведущий. */
export function checkArrivals(rows: ArrivalRow[], p: RetreatPassport): ArrivalIssue[] {
  const issues: ArrivalIssue[] = []
  if (!p.start || !isIsoDate(p.start)) return issues
  const end = addDays(p.start, p.nights ?? 0)
  rows.forEach((raw, i) => {
    const row = i + 1
    // дата, набранная руками как ДД.ММ.ГГГГ, проверяется так же, как пришедшая из CSV
    const r = { ...raw, dateIn: normalizeDate(raw.dateIn), dateOut: normalizeDate(raw.dateOut) }
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
