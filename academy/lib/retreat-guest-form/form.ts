// Форма страницы анкеты: паспорт и набор включённых вопросов — больше ничего. Ответы гостей сюда не входят:
// их держит отдельное состояние сводки, поэтому ни ссылка, ни черновик их не видят даже по ошибке.

import type { IsoDate } from '../retreat-core/dates'
import { passportFromCalcLink, pickPassport, type RetreatPassport } from '../retreat-core/passport'
import { encodeToolLink, type DecodedTool } from '../retreat-core/tool-link'
import { DIETS, type Diets } from '../retreat-menu/engine'
import { pickMenuTool } from '../retreat-menu/form'
import { defaultForm as timelineDefaultForm } from '../retreat-timeline/form'
import { DEFAULT_ON, normalizeOn, type QuestionId } from './questions'

export interface GuestFormState { passport: RetreatPassport; on: QuestionId[] }
export interface FormLinkTool { on: QuestionId[] }

export const FORM_DRAFT_KEY = 'retreat-guest-form:draft'
export const FORM_PATH = '/instrumenty/anketa-gostya/'

/** Allowlist ссылки анкеты: только набор вопросов. Ссылка без набора (из соседнего инструмента) — все вопросы. */
export function pickFormTool(raw: unknown): FormLinkTool {
  const o = typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  return { on: Array.isArray(o.on) ? normalizeOn(o.on) : [...DEFAULT_ON] }
}

export function defaultForm(today: IsoDate): GuestFormState {
  return { passport: timelineDefaultForm(today).passport, on: [...DEFAULT_ON] }
}

export function formHash(f: GuestFormState): string {
  return encodeToolLink({ v: 1, retreat: pickPassport(f.passport), tool: { on: normalizeOn(f.on) } })
}

export function draftOf(f: GuestFormState): string {
  return JSON.stringify({ passport: pickPassport(f.passport), tool: { on: normalizeOn(f.on) } })
}

/** Своя ссылка, ссылка соседнего инструмента (берётся паспорт) или калькулятора v1. Ошибка ссылки — null. */
export function formFromDecoded(d: DecodedTool<FormLinkTool>, today: IsoDate): GuestFormState | null {
  if (!d.ok) return null
  const base = defaultForm(today)
  if (d.kind === 'calc') return { ...base, passport: { ...base.passport, ...passportFromCalcLink(d.calc, today) } }
  return { passport: { ...base.passport, ...d.link.retreat }, on: d.link.tool.on }
}

export function formFromDraft(text: string | null, today: IsoDate): GuestFormState | null {
  if (!text) return null
  try {
    const o = JSON.parse(text) as Record<string, unknown>
    return formFromDecoded({ ok: true, kind: 'tool', link: { v: 1, retreat: pickPassport(o.passport), tool: pickFormTool(o.tool) } }, today)
  } catch {
    return null
  }
}

/** Ссылка в генератор меню с числами по диетам из сводки — агрегаты без имён. Сетки в ней нет, поэтому черновик меню
 *  остаётся (правило `withDraftMenu`); `other` меню не знает — его отбрасывает allowlist меню. Особые диеты идут
 *  явными нулями: пустые числа меню заменило бы диетами из своего черновика, то есть прошлого ретрита. */
export function menuHashWithDiets(p: RetreatPassport, diets: Diets | Record<string, number>): string {
  const zeros = Object.fromEntries(DIETS.filter((d) => d !== 'standard').map((d) => [d, 0]))
  return encodeToolLink({ v: 1, retreat: pickPassport(p), tool: { diets: pickMenuTool({ diets: { ...zeros, ...diets } }).diets } })
}

/** Анкета с паспортом соседнего инструмента и всеми вопросами. */
export const formHashFromPassport = (p: RetreatPassport): string => encodeToolLink({ v: 1, retreat: pickPassport(p), tool: {} })
