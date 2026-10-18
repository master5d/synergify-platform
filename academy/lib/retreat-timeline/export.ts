// Выгрузка вех: CSV в колонках шаблона курса (timeline.<lang>.csv) и календарь .ics (RFC 5545, события на весь день).

import type { Lang } from '../retreat-calc/engine'
import { addDays } from '../retreat-core/dates'
import { toCsv } from './csv'
import type { Milestone } from './engine'
import { milestoneLabel, SOURCE_LABELS, WHO_LABELS } from './labels'

export const TIMELINE_CSV_HEADER: Record<Lang, string[]> = {
  ru: ['Дней до старта', 'Дата', 'Кто', 'Что', 'Сумма', 'Статус', 'Откуда срок'],
  en: ['Days before start', 'Date', 'Who', 'What', 'Amount', 'Status', 'Where the deadline comes from'],
}

/** Центы → сумма в единицах валюты; дробная часть — через запятую в RU (как ждёт русский Excel). */
export function money(cents: number, lang: Lang): string {
  const s = cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2)
  return lang === 'ru' ? s.replace('.', ',') : s
}

export function milestonesToCsv(ms: Milestone[], lang: Lang): string {
  const rows = ms.map((m) => [
    String(m.daysBefore), m.date, WHO_LABELS[lang][m.who], milestoneLabel(m, lang),
    m.amountCents === null ? '' : money(m.amountCents, lang), '', SOURCE_LABELS[lang][m.source],
  ])
  return toCsv([TIMELINE_CSV_HEADER[lang], ...rows], lang)
}

function icsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Свёртка строки по 75 октетов UTF-8; продолжение начинается с пробела. Символ не режется пополам. */
function fold(line: string): string {
  const enc = new TextEncoder()
  const out: string[] = []
  let cur = ''
  let size = 0
  for (const ch of line) {
    const n = enc.encode(ch).length
    if (size + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; size = 0 }
    cur += ch
    size += n
  }
  out.push(cur)
  return out.join('\r\n ')
}

const compact = (d: string) => d.replace(/-/g, '')

/** `stamp` — момент выгрузки `YYYYMMDDTHHMMSSZ` (DTSTAMP по RFC 5545); без него — дата вехи, для детерминизма тестов. */
export function milestonesToIcs(ms: Milestone[], title: string, lang: Lang, stamp?: string): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//academy.synergify.com//retreat-timeline//${lang.toUpperCase()}`, 'CALSCALE:GREGORIAN']
  // UID события — веха + ретрит (дата заезда и название), без даты самой вехи: после правки сроков повторный
  // импорт обновляет события, а не плодит дубли; два ретрита с одним стартом не перетирают друг друга.
  const start = ms.find((m) => m.id === 'arrival')?.date ?? ''
  let h = 0x811c9dc5
  for (const ch of new TextEncoder().encode(title)) h = Math.imul(h ^ ch, 0x01000193) >>> 0
  const retreatId = `${start}-${h.toString(16)}`
  for (const m of ms) {
    const what = milestoneLabel(m, lang)
    const details = [WHO_LABELS[lang][m.who], m.amountCents === null ? '' : money(m.amountCents, lang), SOURCE_LABELS[lang][m.source]]
      .filter(Boolean).join(' · ')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${m.id}${m.n !== undefined ? `-${m.n}` : ''}-${retreatId}@academy.synergify.com`,
      `DTSTAMP:${stamp ?? `${compact(m.date)}T000000Z`}`,
      `DTSTART;VALUE=DATE:${compact(m.date)}`,
      `DTEND;VALUE=DATE:${compact(addDays(m.date, 1))}`,
      `SUMMARY:${icsText(title ? `${title}: ${what}` : what)}`,
      `DESCRIPTION:${icsText(details)}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}
