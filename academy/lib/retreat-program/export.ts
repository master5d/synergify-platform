import type { Lang } from '../retreat-calc/engine'
import { toCsv } from '../retreat-core/csv'
import type { RetreatPassport } from '../retreat-core/passport'
import { CONTINUES, CSV_FOOTER, LOAD } from './labels'
import { blockMinutes, blockTitle, DAY_END, DAY_START, dayLoad, freeMinutes, STEP, toMinutes, type Block } from './grid'
import type { PracticeCard } from './practices'

export function gridHeader(p: RetreatPassport, lang: Lang): string[] { const nights = p.nights ?? 0; const first = lang === 'ru' ? ' (заезд)' : ' (arrival)'; const last = lang === 'ru' ? ' (выезд)' : ' (departure)'; return [lang === 'ru' ? 'Время' : 'Time', ...Array.from({ length: nights + 1 }, (_, i) => `${lang === 'ru' ? 'День' : 'Day'} ${i + 1}${i === 0 ? first : i === nights ? last : ''}`)] }
const hours = (m: number, lang: Lang) => { const value = m / 60; return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', lang === 'ru' ? ',' : '.') }
export function gridRows(p: RetreatPassport, blocks: Block[], cards: PracticeCard[], lang: Lang): string[][] {
  const days = p.nights ?? 0; const rows: string[][] = [gridHeader(p, lang)]; const start = toMinutes(DAY_START); const end = toMinutes(DAY_END)
  const perDay = Array.from({ length: days + 1 }, (_, i) => blocks.filter((b) => b.day === i + 1 && toMinutes(b.start) >= start && toMinutes(b.start) < end && toMinutes(b.start) % STEP === 0).sort((a, b) => toMinutes(a.start) - toMinutes(b.start)))
  for (let minute = start; minute < end; minute += STEP) rows.push([`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`, ...perDay.map((items) => { const b = items.find((item) => toMinutes(item.start) <= minute && minute < toMinutes(item.start) + blockMinutes(item, cards.find((card) => card.id === item.practiceId))); return b ? (toMinutes(b.start) === minute ? blockTitle(b, cards, lang) : CONTINUES) : '' })])
  rows.push([CSV_FOOTER[lang].load, ...Array.from({ length: days + 1 }, (_, i) => { const load = dayLoad(i + 1, blocks, cards); return load ? LOAD[lang][load] : '' })])
  rows.push([CSV_FOOTER[lang].free, ...Array.from({ length: days + 1 }, (_, i) => hours(freeMinutes(i + 1, blocks, cards), lang))])
  return rows
}

export function gridToCsv(p: RetreatPassport, blocks: Block[], cards: PracticeCard[], lang: Lang): string {
  return toCsv(gridRows(p, blocks, cards, lang), lang)
}
