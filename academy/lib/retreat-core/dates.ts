// Даты ретрита — строки `YYYY-MM-DD`, арифметика только в UTC: в браузере на другом краю света
// (и в день перевода часов) «плюс один день» не должен превращаться в «тот же день» или «плюс два».

export type IsoDate = string

const DAY_MS = 86_400_000

function parts(d: IsoDate): [number, number, number] {
  if (!isIsoDate(d)) throw new Error(`ожидалась дата YYYY-MM-DD: ${String(d)}`)
  return [Number(d.slice(0, 4)), Number(d.slice(5, 7)), Number(d.slice(8, 10))]
}

function fromUtc(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Строгий формат и реальная дата (2027-02-30 — нет). */
export function isIsoDate(s: unknown): s is IsoDate {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const [y, m, d] = [Number(s.slice(0, 4)), Number(s.slice(5, 7)), Number(s.slice(8, 10))]
  const t = new Date(Date.UTC(y, m - 1, d))
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d
}

export function addDays(d: IsoDate, n: number): IsoDate {
  const [y, m, day] = parts(d)
  return fromUtc(Date.UTC(y, m - 1, day) + n * DAY_MS)
}

/** Плюс n календарных месяцев; день, которого в целевом месяце нет, — последний день месяца. */
export function addMonths(d: IsoDate, n: number): IsoDate {
  const [y, m, day] = parts(d)
  const first = new Date(Date.UTC(y, m - 1 + n, 1))
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  return fromUtc(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(day, last)))
}

/** b − a в днях. */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  const [ya, ma, da] = parts(a)
  const [yb, mb, db] = parts(b)
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / DAY_MS)
}

/** Полные календарные месяцы от a до b (не меньше 0). */
export function monthsBetween(a: IsoDate, b: IsoDate): number {
  const [ya, ma, da] = parts(a)
  const [yb, mb, db] = parts(b)
  const m = (yb - ya) * 12 + (mb - ma) - (db < da ? 1 : 0)
  return Math.max(0, m)
}
