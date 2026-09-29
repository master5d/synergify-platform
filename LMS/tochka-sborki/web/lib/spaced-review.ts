// Интервальный повтор самопроверок — пилот (BACKLOG «Педагогика 1», intake LMS#20: retrieval + spacing).
// Чистая логика, без React и без хранилища: коробки Лейтнера, разбор localStorage, выбор «к повтору».
//
// Алгоритм (объясняется одной фразой ученику и автору):
//   коробки 0/1/2/3 = повтор через 1/3/7/21 день;
//   первый ответ кладёт вопрос в коробку 0 (повтор завтра), как бы ни ответил;
//   верный ответ В СРОК (или позже) — на коробку выше, в последней остаётся (раз в 21 день);
//   верный ответ РАНЬШЕ срока — ничего не меняет (это не повтор через паузу, а перечитывание);
//   неверный ответ — всегда в коробку 0.
// Ответ хранится в браузере ученика (как unit_progress); вошедший ученик ещё и шлёт копию на сервер (syncAnswer ниже).
import type { SelfCheckItem } from './content'

export const INTERVAL_DAYS = [1, 3, 7, 21] as const
export const LAST_BOX = INTERVAL_DAYS.length - 1
export const DAY_MS = 24 * 60 * 60 * 1000
/** Сколько вопросов «Вспомни» за один заход в юнит. */
export const REVIEW_LIMIT = 3

export type Locale = 'ru' | 'en'

/** Копия вопроса на момент ответа: блок «Вспомни» стоит в ДРУГОМ юните, и вопросов прошлых модулей
 *  на странице нет. Копия обновляется при каждом ответе — правка автора доезжает со следующим ответом. */
export interface ReviewSnapshot { question: string; options: string[]; answer: number; explain: string }

export interface ReviewRecord {
  module: string
  unit: string
  id: string
  box: number
  /** Когда повторить, мс epoch. */
  due: number
  /** Время последнего ответа, мс epoch. */
  last: number
  /** Верен ли последний ответ. */
  correct: boolean
  /** Сколько раз отвечал. */
  n: number
  q: Partial<Record<Locale, ReviewSnapshot>>
}

/** Ключ записи: id вопроса уникален только внутри модуля (Ruling 7 самопроверок). */
export type ReviewStore = Record<string, ReviewRecord>

export const reviewKey = (module: string, id: string) => `${module}/${id}`

/** localStorage-ключ курса: у pack'ов разные progressKey, путать записи курсов на одном домене нельзя. */
export const storageKey = (courseKey: string) => `check_reviews:${courseKey}`

/** Следующая коробка и срок. prev = null — первый ответ на этот вопрос. */
export function scheduleNext(
  prev: Pick<ReviewRecord, 'box' | 'due'> | null,
  correct: boolean,
  now: number,
): { box: number; due: number } {
  const at = (box: number) => ({ box, due: now + INTERVAL_DAYS[box] * DAY_MS })
  if (!prev) return at(0)
  if (!correct) return at(0)
  if (now < prev.due) return { box: prev.box, due: prev.due }   // раньше срока — не повтор
  return at(Math.min(prev.box + 1, LAST_BOX))
}

export function snapshotOf(item: Pick<SelfCheckItem, 'question' | 'options' | 'answer' | 'explain'>): ReviewSnapshot {
  return { question: item.question, options: [...item.options], answer: item.answer, explain: item.explain }
}

/** Записать ответ. Новый объект, вход не мутируется (живёт в состоянии React). */
export function applyAnswer(
  store: ReviewStore,
  a: { module: string; item: Pick<SelfCheckItem, 'id' | 'unit' | 'question' | 'options' | 'answer' | 'explain'>; correct: boolean; locale: Locale; now: number },
): ReviewStore {
  const key = reviewKey(a.module, a.item.id)
  const prev = store[key] ?? null
  const { box, due } = scheduleNext(prev, a.correct, a.now)
  const rec: ReviewRecord = {
    module: a.module,
    unit: a.item.unit,
    id: a.item.id,
    box,
    due,
    last: a.now,
    correct: a.correct,
    n: (prev?.n ?? 0) + 1,
    q: { ...(prev?.q ?? {}), [a.locale]: snapshotOf(a.item) },
  }
  return { ...store, [key]: rec }
}

const isStr = (x: unknown): x is string => typeof x === 'string' && x.length > 0
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)

function parseSnapshot(x: unknown): ReviewSnapshot | null {
  if (!x || typeof x !== 'object') return null
  const s = x as Record<string, unknown>
  if (!isStr(s.question) || !Array.isArray(s.options) || !s.options.every(o => typeof o === 'string')) return null
  if (!isNum(s.answer) || s.answer < 0 || s.answer >= s.options.length) return null
  return { question: s.question, options: s.options as string[], answer: s.answer, explain: typeof s.explain === 'string' ? s.explain : '' }
}

/** Разбор хранилища: там может оказаться что угодно (как у unit_progress) — мусорные записи отбрасываются. */
export function parseStore(raw: string | null): ReviewStore {
  if (!raw) return {}
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return {} }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  const out: ReviewStore = {}
  for (const [key, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue
    const r = v as Record<string, unknown>
    if (!isStr(r.module) || !isStr(r.unit) || !isStr(r.id) || !isNum(r.due) || !isNum(r.last)) continue
    if (key !== reviewKey(r.module, r.id)) continue
    const box = isNum(r.box) ? Math.min(Math.max(Math.trunc(r.box), 0), LAST_BOX) : 0
    const q: Partial<Record<Locale, ReviewSnapshot>> = {}
    const rq = (r.q && typeof r.q === 'object' ? r.q : {}) as Record<string, unknown>
    for (const l of ['ru', 'en'] as const) {
      const s = parseSnapshot(rq[l])
      if (s) q[l] = s
    }
    out[key] = { module: r.module, unit: r.unit, id: r.id, box, due: r.due, last: r.last, correct: r.correct === true, n: isNum(r.n) ? r.n : 1, q }
  }
  return out
}

export interface DueCard { key: string; record: ReviewRecord; snapshot: ReviewSnapshot }

/**
 * Что повторить сейчас: срок подошёл, юнит вопроса ПРОЙДЕН и это не текущий юнит (свой вопрос ученик
 * встретит в тексте). Порядок: самые просроченные, при равенстве — нижняя коробка (слабее помнит).
 * Нет копии вопроса на языке страницы — берём другую: вопрос лучше, чем пустота; нет никакой — пропуск.
 */
export function pickDue(
  store: ReviewStore,
  o: { now: number; locale: Locale; current: { module: string; unit: string }; isCompleted: (module: string, unit: string) => boolean; limit?: number },
): DueCard[] {
  const other: Locale = o.locale === 'ru' ? 'en' : 'ru'
  return Object.entries(store)
    .filter(([, r]) => r.due <= o.now)
    .filter(([, r]) => !(r.module === o.current.module && r.unit === o.current.unit))
    .filter(([, r]) => o.isCompleted(r.module, r.unit))
    .flatMap(([key, record]) => {
      const snapshot = record.q[o.locale] ?? record.q[other]
      return snapshot ? [{ key, record, snapshot }] : []
    })
    .sort((a, b) => a.record.due - b.record.due || a.record.box - b.record.box || a.key.localeCompare(b.key))
    .slice(0, o.limit ?? REVIEW_LIMIT)
}

/** Событие аналитики ответа на повтор — числитель метрики стоп-критерия. */
export type ReviewEvent = { module: string; unit: string; correct: boolean; box: number }

// ---- браузерное хранилище (тонкая обёртка, ошибки хранилища глушатся как в unit-progress) ----

export function readStore(courseKey: string): ReviewStore {
  try { return parseStore(localStorage.getItem(storageKey(courseKey))) } catch { return {} }
}

export function writeStore(courseKey: string, store: ReviewStore): void {
  try { localStorage.setItem(storageKey(courseKey), JSON.stringify(store)) } catch {}
}

/** Прочитать → записать ответ → сохранить. Возвращает запись после ответа (или null, если хранилища нет). */
export function recordAnswer(
  courseKey: string,
  a: Parameters<typeof applyAnswer>[1],
): ReviewRecord | null {
  if (typeof window === 'undefined') return null
  const next = applyAnswer(readStore(courseKey), a)
  writeStore(courseKey, next)
  return next[reviewKey(a.module, a.item.id)] ?? null
}

// ---- копия ответа на сервер (POST /api/checks/answer, воркер lib/check-reviews.ts) ----
// localStorage остаётся источником для «Вспомни»; сервер ведёт свои коробки для метрики стоп-критерия
// (/api/admin/stats → spacedReview) и будущего письма «повтори». Best-effort: только для вошедших
// (аноним получил бы 401 — запрос не шлём вовсе), сбой сети/сервера ученик не замечает.

export type AnswerSource = 'lesson' | 'review' | 'card'

export interface ServerAnswer { course: string; module: string; unit: string; checkId: string; correct: boolean; source: AnswerSource }

export function answerPayload(a: ServerAnswer) {
  return { course: a.course, module: a.module, unit: a.unit, check_id: a.checkId, correct: a.correct, source: a.source }
}

/** Отправить копию ответа. authed=false — ничего не делает. Никогда не бросает. */
export async function syncAnswer(authed: boolean, a: ServerAnswer, fetchFn: typeof fetch = fetch): Promise<void> {
  if (!authed) return
  try {
    await fetchFn('/api/checks/answer', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answerPayload(a)),
      keepalive: true,
    })
  } catch {}
}
