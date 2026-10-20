// Сводка ответов анкеты: CSV из сервиса ведущего (Google Forms, Typeform, своя таблица) разбирается в браузере.
// Это данные гостей: они живут только в памяти страницы и в скачанных CSV — ни в ссылке, ни в localStorage.
// Из сводки наружу без файла уходят только числа по диетам (агрегаты без имён).

import type { Lang } from '../retreat-calc/engine'
import { parseCsvNumbered, toCsv } from '../retreat-core/csv'
import type { DietId } from '../retreat-menu/engine'
import { emptyArrival, normalizeDate, type ArrivalRow } from '../retreat-timeline/arrivals'
import { guestLabel, PICKUP_NOTE } from './labels'
import { normalizeOn, QUESTIONS, type ChoiceId, type Question, type QuestionId } from './questions'

/** `lines[i]` — номер строки `rows[i]` в файле: пустые строки выброшены, номера не сдвигаются. */
export interface AnswersTable { header: string[]; rows: string[][]; lines: number[] }
export type ColumnMap = Partial<Record<QuestionId, number>>

export interface GuestAnswer {
  /** Номер строки в файле, как видит ведущий: заголовок — строка 1. */
  row: number
  /** Ответы как в файле (обрезаны пробелы). */
  values: Partial<Record<QuestionId, string>>
  /** Узнанный вариант у вопросов с вариантами; нераспознанная диета — `other`. */
  choice: Partial<Record<QuestionId, ChoiceId>>
}

export type SummaryIssueId = 'missing-column' | 'duplicate-guest' | 'unknown-choice' | 'no-emergency'
  | 'more-answers-than-guests' | 'severe-allergy' | 'no-name'
export interface SummaryIssue { id: SummaryIssueId; row?: number; question?: QuestionId; guest?: string }

export interface Summary {
  on: QuestionId[]
  guests: GuestAnswer[]
  diets: Partial<Record<DietId | 'other', number>>
  otherDiets: { guest: string; row: number; text: string }[]
  issues: SummaryIssue[]
}

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]))

/** Без регистра, «ё» = «е», пробелы схлопнуты: так ведущий набирает варианты и вопросы в своём сервисе. */
const fold = (s: string) => s.normalize('NFC').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim()

/** Заголовок колонки и текст вопроса сравниваются без номера в начале, без вариантов в скобках и знаков в конце:
 *  строка из текста анкеты («13. Как вы едите (всё / …)») целиком в заголовке тоже узнаётся. */
export function normalizeHeader(s: string): string {
  return fold(s).replace(/^\d+[.)]\s*/, '').replace(/[\s?:.*]+$/, '').replace(/\s*\([^)]*\)$/, '').replace(/[\s?:.*]+$/, '')
}

export function readAnswers(text: string): AnswersTable {
  const recs = parseCsvNumbered(text)
  return { header: (recs[0]?.cells ?? []).map((h) => h.trim()), rows: recs.slice(1).map((r) => r.cells), lines: recs.slice(1).map((r) => r.row) }
}

/** Колонка совпадает с текстом вопроса или его короткой подписью на любом языке; первое совпадение выигрывает. */
export function matchColumns(header: string[], on: QuestionId[]): ColumnMap {
  const map: ColumnMap = {}
  const taken = new Set<number>()
  const cols = header.map(normalizeHeader)
  for (const id of normalizeOn(on)) {
    const q = BY_ID.get(id)!
    const names = new Set([q.text.ru, q.text.en, q.short.ru, q.short.en].map(normalizeHeader))
    const i = cols.findIndex((c, idx) => !taken.has(idx) && names.has(c))
    if (i >= 0) { map[id] = i; taken.add(i) }
  }
  return map
}

const OTHER_PREFIX = /^(other|другое)\s*:\s*([\s\S]*)$/i

/** Прежние подписи вариантов и их формы, которые ведущий мог оставить в своей анкете (шаблон курса — «согласен(на)»). */
const SYNONYMS: Partial<Record<QuestionId, Record<ChoiceId, string[]>>> = {
  touch: {
    yes: ['согласен', 'согласна', 'согласен(на)', 'согласен (на)', 'i agree'],
    no: ['не согласен', 'не согласна', 'не согласен(на)', 'не согласен (на)', 'i do not agree'],
  },
  diet: {
    'vegan-gluten-free': ['веган, без глютена', 'веган и без глютена', 'vegan and gluten-free', 'vegan + gluten-free'],
  },
}

/** Вариант по подписи любого языка или по id; `Other: …` / `Другое: …` Google Forms — `other` с текстом. */
function recognize(q: Question, raw: string): { choice?: ChoiceId; otherText?: string } {
  const m = OTHER_PREFIX.exec(raw)
  if (m && q.choices?.includes('other')) return { choice: 'other', otherText: m[2].trim() }
  const n = fold(raw)
  const choice = q.choices?.find((c) => c === n || fold(q.choiceText![c].ru) === n || fold(q.choiceText![c].en) === n
    || (SYNONYMS[q.id]?.[c] ?? []).some((s) => fold(s) === n))
  return choice ? { choice, otherText: choice === 'other' ? '' : undefined } : {}
}

export function summarize(t: AnswersTable, map: ColumnMap, on: QuestionId[], guestsInPassport?: number): Summary {
  const enabled = normalizeOn(on)
  const issues: SummaryIssue[] = []
  for (const id of enabled) {
    const i = map[id]
    if (i === undefined || i < 0 || i >= t.header.length) issues.push({ id: 'missing-column', question: id })
  }
  const col = (id: QuestionId) => {
    const i = map[id]
    return i !== undefined && i >= 0 && i < t.header.length && enabled.includes(id) ? i : undefined
  }

  const guests: GuestAnswer[] = []
  const otherText = new Map<GuestAnswer, string>()
  // проблемы строки копятся при ней: строка, вытесненная повтором, уносит свои проблемы с собой
  const rowIssues = new Map<GuestAnswer, SummaryIssue[]>()
  const byName = new Map<string, number>()
  t.rows.forEach((cells, idx) => {
    const g: GuestAnswer = { row: t.lines[idx], values: {}, choice: {} }
    const own: SummaryIssue[] = []
    rowIssues.set(g, own)
    for (const id of enabled) {
      const i = col(id)
      if (i === undefined) continue
      const raw = (cells[i] ?? '').trim()
      g.values[id] = raw
      const q = BY_ID.get(id)!
      if (q.kind !== 'choice' || !raw) continue
      const r = recognize(q, raw)
      if (r.choice) g.choice[id] = r.choice
      else if (id === 'diet') g.choice[id] = 'other'
      if (r.otherText !== undefined) otherText.set(g, r.otherText)
      if (!r.choice) {
        if (id === 'diet') otherText.set(g, raw)
        own.push({ id: 'unknown-choice', row: g.row, question: id })
      }
    }
    // имя — без срезания скобок: «Иван Петров (Ваня)» и «Иван Петров» — разные гости
    const key = fold(g.values.name ?? '')
    if (!key) {
      own.push({ id: 'no-name', row: g.row })
      guests.push(g)
      return
    }
    const prev = byName.get(key)
    if (prev === undefined) {
      byName.set(key, guests.length)
      guests.push(g)
    } else {
      // повторная отправка формы: остаётся последняя строка, убранная называется
      issues.push({ id: 'duplicate-guest', row: guests[prev].row, guest: g.values.name })
      guests[prev] = g
    }
  })

  const diets: Summary['diets'] = {}
  const otherDiets: Summary['otherDiets'] = []
  for (const g of guests) {
    issues.push(...rowIssues.get(g)!)
    const d = g.choice.diet as DietId | 'other' | undefined
    if (d) diets[d] = (diets[d] ?? 0) + 1
    if (d === 'other') otherDiets.push({ guest: g.values.name ?? '', row: g.row, text: otherText.get(g) ?? '' })
    if (col('emergency') !== undefined && !g.values.emergency) issues.push({ id: 'no-emergency', row: g.row, guest: g.values.name })
    if (g.choice.allergySeverity === 'severe') issues.push({ id: 'severe-allergy', row: g.row, guest: g.values.name })
  }
  if (guestsInPassport !== undefined && guests.length > guestsInPassport) issues.push({ id: 'more-answers-than-guests' })
  return { on: enabled, guests, diets, otherDiets, issues }
}

/** Ответ для таблиц: подпись узнанного варианта на языке выгрузки, иначе — как в файле. */
export function answerText(g: GuestAnswer, id: QuestionId, lang: Lang): string {
  const raw = g.values[id] ?? ''
  const c = g.choice[id]
  const q = BY_ID.get(id)!
  if (!c || !q.choiceText) return raw
  const label = q.choiceText[c][lang]
  if (c !== 'other') return label
  const m = OTHER_PREFIX.exec(raw)
  const text = m ? m[2].trim() : raw.toLowerCase() === q.choiceText.other.ru.toLowerCase() || raw.toLowerCase() === q.choiceText.other.en.toLowerCase() ? '' : raw
  return text ? `${label}: ${text}` : label
}

/** Черновик листа прибытия в колонках шаблона курса: кто встречает и трансфер обратно заполняет ведущий. */
export function arrivalsOf(s: Summary, lang: Lang): ArrivalRow[] {
  return s.guests.map((g) => ({
    ...emptyArrival(),
    guest: g.values.name || guestLabel(g.row, lang),
    phone: g.values.phone ?? '',
    flightIn: g.values.flightIn ?? '',
    dateIn: normalizeDate(g.values.dateIn ?? '', lang),
    timeIn: g.values.timeIn ?? '',
    airport: g.values.airport ?? '',
    flightOut: g.values.flightOut ?? '',
    dateOut: normalizeDate(g.values.dateOut ?? '', lang),
    timeOut: g.values.timeOut ?? '',
    note: g.choice.pickup === 'yes' ? PICKUP_NOTE[lang] : '',
  }))
}

function routedCsv(s: Summary, ids: QuestionId[], lang: Lang): string {
  const cols = ids.filter((id) => s.on.includes(id))
  const header = cols.map((id) => BY_ID.get(id)!.short[lang])
  const rows = s.guests.map((g) => cols.map((id) => (id === 'name' ? g.values.name || guestLabel(g.row, lang) : answerText(g, id, lang))))
  return toCsv([header, ...rows], lang)
}

export const CHEF_COLUMNS: QuestionId[] = ['name', 'diet', 'allergies', 'allergySeverity', 'nonEat']
export const SAFETY_COLUMNS: QuestionId[] = ['name', 'phone', 'emergency', 'allergies', 'allergySeverity', 'loadLimits', 'breathingLimits', 'senses', 'touch', 'insurance', 'photo']

/** Для шефа: питание и аллергии, без рейсов и здоровья. */
export const chefToCsv = (s: Summary, lang: Lang) => routedCsv(s, CHEF_COLUMNS, lang)
/** «Важно знать на месте»: связь, экстренный контакт, аллергии, ограничения, касание, страховка, фото. */
export const safetyToCsv = (s: Summary, lang: Lang) => routedCsv(s, SAFETY_COLUMNS, lang)

export const wishesToCsv = (s: Summary, lang: Lang): string => {
  const guests = s.guests.filter((g) => (g.values.expectations ?? '').trim())
  return toCsv([
    [lang === 'ru' ? 'Имя' : 'Name', 'expectations'],
    ...guests.map((g) => [g.values.name || guestLabel(g.row, lang), g.values.expectations!.trim()]),
  ], lang)
}
