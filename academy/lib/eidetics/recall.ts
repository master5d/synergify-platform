// lib/eidetics/recall.ts
// Чистый движок тренажёра «Запомни ряд»: выбор ряда по seed, разбор ответа, подсчёт, окно
// отложенной проверки. Без DOM и часов — время приходит аргументом.
import type { Locale } from '../dictionaries'
import { shuffle } from '../speedreading/schulte'
import { DEFAULT_AUDIENCE, WORD_BANKS, type Audience } from './word-banks'

export type SeriesKind = 'words' | 'digits'

export const WORD_LENGTHS = [10, 15, 20] as const
export const DIGIT_LENGTHS = [10, 20] as const

/** Отложенная проверка открывается не раньше чем через час. Решение дизайна тренажёра
 *  (проверка «через время», а не сразу), а не цифра из исследования. */
export const MIN_DELAY_MS = 60 * 60 * 1000

export interface RecallScore { inOrder: number; anyOrder: number; total: number }

export function pickSeries(
  kind: SeriesKind, length: number, seed: number, locale: Locale, audience: Audience = DEFAULT_AUDIENCE,
): string[] {
  if (kind === 'digits') {
    let s = seed >>> 0
    const out: string[] = []
    for (let i = 0; i < length; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0
      out.push(String(s % 10))
    }
    return out
  }
  const bank = WORD_BANKS[audience].map(w => w[locale])
  return shuffle(bank, seed).slice(0, Math.min(length, bank.length))
}

export function normalizeItem(s: string): string {
  return s.trim().toLowerCase().replace(/ё/g, 'е')
}

/** Разбор ввода: слова — через пробелы/запятые/переносы; цифры — любые цифры подряд. */
export function parseAnswer(kind: SeriesKind, text: string): string[] {
  if (kind === 'digits') return text.replace(/\D/g, '').split('').filter(Boolean)
  return text.split(/[\s,;.]+/).map(normalizeItem).filter(Boolean)
}

/** inOrder — совпадения на своём месте; anyOrder — сколько элементов ряда названо вообще
 *  (каждый засчитывается не больше, чем встречается в ряду). */
export function scoreRecall(series: string[], answer: string[]): RecallScore {
  const want = series.map(normalizeItem)
  const got = answer.map(normalizeItem)
  let inOrder = 0
  for (let i = 0; i < want.length; i++) if (got[i] !== undefined && got[i] === want[i]) inOrder++
  const pool = new Map<string, number>()
  for (const w of want) pool.set(w, (pool.get(w) ?? 0) + 1)
  let anyOrder = 0
  for (const g of got) {
    const left = pool.get(g) ?? 0
    if (left > 0) { anyOrder++; pool.set(g, left - 1) }
  }
  return { inOrder, anyOrder, total: want.length }
}

export function isDelayedDue(studiedAt: number, now: number): boolean {
  return now - studiedAt >= MIN_DELAY_MS
}

/** Доля (0..100) — для цифр засчитываем порядок, для слов — «названо вообще». */
export function scorePercent(kind: SeriesKind, score: RecallScore): number {
  if (score.total === 0) return 0
  const hit = kind === 'digits' ? score.inOrder : score.anyOrder
  return Math.round((hit / score.total) * 100)
}
