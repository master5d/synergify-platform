import type { Env } from './types'

// Интервальный повтор самопроверок — серверная половина пилота (BACKLOG «Педагогика 1», intake LMS#20).
// За флагом SPACED_REVIEW_ENABLED: при выключенном флаге ни эндпоинт, ни статистика в D1 не ходят.
// Включено 2026-09-29 (миграция 0022 применена к prod D1, слово владельца).
// Алгоритм — копия web/lib/spaced-review.ts (движок и воркер не делят код); совпадение держит
// check-reviews.test.ts: те же интервалы и те же переходы на одной таблице случаев.

export const INTERVAL_DAYS = [1, 3, 7, 21] as const
export const LAST_BOX = INTERVAL_DAYS.length - 1
const DAY = 24 * 60 * 60

export type ReviewSource = 'lesson' | 'review' | 'card'
export const SOURCES: readonly ReviewSource[] = ['lesson', 'review', 'card']

const strip = (s: string | undefined) => (s ?? '').replace(/^﻿/, '').trim()

export function spacedReviewEnabled(env: Pick<Env, 'SPACED_REVIEW_ENABLED'>): boolean {
  return strip(env.SPACED_REVIEW_ENABLED) === '1'
}

/** Коробки Лейтнера, секунды. prev = null — первый ответ. Правила — как в web/lib/spaced-review.ts. */
export function scheduleNext(prev: { box: number; due_at: number } | null, correct: boolean, nowSec: number): { box: number; due_at: number } {
  const at = (box: number) => ({ box, due_at: nowSec + INTERVAL_DAYS[box] * DAY })
  if (!prev || !correct) return at(0)
  if (nowSec < prev.due_at) return { box: prev.box, due_at: prev.due_at }
  return at(Math.min(prev.box + 1, LAST_BOX))
}

export interface ReviewRow { module: string; unit: string; check_id: string; box: number; due_at: number }

/**
 * «Что повторить сегодня» для учебного письма: подошедшие по сроку, самые просроченные первыми,
 * при равенстве — нижняя коробка. Чистая функция; выборку строк делает loadDue.
 */
export function dueToday(rows: ReviewRow[], nowSec: number, limit = 2): ReviewRow[] {
  return rows
    .filter(r => r.due_at <= nowSec)
    .sort((a, b) => a.due_at - b.due_at || a.box - b.box || `${a.module}/${a.check_id}`.localeCompare(`${b.module}/${b.check_id}`))
    .slice(0, limit)
}

export async function loadDue(db: D1Database, userId: string, course: string, nowSec: number, limit = 2): Promise<ReviewRow[]> {
  const { results } = await db.prepare(
    'SELECT module, unit, check_id, box, due_at FROM check_reviews WHERE user_id = ? AND course = ? AND due_at <= ?'
  ).bind(userId, course, nowSec).all<ReviewRow>()
  return dueToday(results ?? [], nowSec, limit)
}

/** Данные шага письма «повтори 2 вопроса» (шаблон — email-templates/drafts/, в Listmonk НЕ залит).
 *  Текстов вопросов у воркера нет: письмо зовёт в курс, а вопросы показывает блок «Вспомни». */
export function reviewEmailData(due: ReviewRow[], continueUrl: string): Record<string, string | number> | null {
  if (due.length === 0) return null
  return { review_count: due.length, review_url: continueUrl }
}

const ID = /^[a-z0-9][a-z0-9._-]{0,79}$/i

export interface AnswerInput { course: string; module: string; unit: string; check_id: string; correct: boolean; source: ReviewSource }

/** Разбор тела POST /api/checks/answer. null — тело негодно. */
export function parseAnswer(body: unknown): AnswerInput | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const s = (k: string) => (typeof b[k] === 'string' && ID.test(b[k] as string) ? (b[k] as string) : null)
  const course = s('course'), module = s('module'), unit = s('unit'), check_id = s('check_id')
  if (!course || !module || !unit || !check_id) return null
  if (typeof b.correct !== 'boolean') return null
  const source = (SOURCES as readonly unknown[]).includes(b.source) ? (b.source as ReviewSource) : 'lesson'
  return { course, module, unit, check_id, correct: b.correct, source }
}

/** Записать ответ: прочитать коробку, пересчитать, upsert. Возвращает новое расписание. */
export async function storeAnswer(db: D1Database, userId: string, a: AnswerInput, nowSec: number): Promise<{ box: number; due_at: number }> {
  const prev = await db.prepare(
    'SELECT box, due_at FROM check_reviews WHERE user_id = ? AND course = ? AND module = ? AND check_id = ?'
  ).bind(userId, a.course, a.module, a.check_id).first<{ box: number; due_at: number }>()
  const next = scheduleNext(prev ?? null, a.correct, nowSec)
  const reviewedAt = a.source === 'review' ? nowSec : null
  await db.prepare(`
    INSERT INTO check_reviews (user_id, course, module, check_id, unit, box, due_at, last_at, last_correct, answers, reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    ON CONFLICT (user_id, course, module, check_id) DO UPDATE SET
      unit = excluded.unit, box = excluded.box, due_at = excluded.due_at, last_at = excluded.last_at,
      last_correct = excluded.last_correct, answers = check_reviews.answers + 1,
      reviewed_at = COALESCE(excluded.reviewed_at, check_reviews.reviewed_at)
  `).bind(userId, a.course, a.module, a.check_id, a.unit, next.box, next.due_at, nowSec, a.correct ? 1 : 0, reviewedAt).run()
  return next
}

/** Стоп-критерий пилота: из учеников, у кого был повод повторить (есть запись с наступившим сроком
 *  или ответ на повтор), — сколько ответили на повтор хоть раз. */
export interface SpacedReviewStats { course: string; eligible: number; answered: number }

export async function loadSpacedReviewStats(db: D1Database, nowSec: number): Promise<SpacedReviewStats[]> {
  const { results } = await db.prepare(`
    SELECT course,
           COUNT(DISTINCT CASE WHEN due_at <= ? OR reviewed_at IS NOT NULL THEN user_id END) AS eligible,
           COUNT(DISTINCT CASE WHEN reviewed_at IS NOT NULL THEN user_id END) AS answered
    FROM check_reviews GROUP BY course ORDER BY course
  `).bind(nowSec).all<SpacedReviewStats>()
  return results ?? []
}

export interface ModuleCheckSummary { unit: string; check_id: string; learners: number; wrong: number }

/**
 * Сводка к живой встрече (intake LMS#30, flipped classroom): по каждому вопросу модуля — сколько учеников на него
 * отвечали и у скольких ПОСЛЕДНИЙ ответ неверный. Только агрегат: ни user_id, ни email наружу не уходят.
 * Истории ответов в таблице нет — «последний ответ» и есть то, что знаем. Самые трудные — сверху.
 */
export async function loadModuleCheckSummary(db: D1Database, course: string, module: string): Promise<ModuleCheckSummary[]> {
  const { results } = await db.prepare(`
    SELECT unit, check_id, COUNT(*) AS learners,
           SUM(CASE WHEN last_correct = 0 THEN 1 ELSE 0 END) AS wrong
    FROM check_reviews WHERE course = ? AND module = ?
    GROUP BY unit, check_id
    ORDER BY wrong DESC, learners DESC, unit, check_id
  `).bind(course, module).all<ModuleCheckSummary>()
  return results ?? []
}
