// Ссылка инструмента ведущего: `#data=<base64url JSON>` с `{ v: 1, retreat: <паспорт>, tool: <своё> }`.
// Фрагмент не уходит на сервер. Схема — allowlist: паспорт берёт только свои поля, инструмент — свои (pickTool),
// всё прочее отбрасывается. Поэтому данные гостей в ссылку не попадают, даже если их туда подложить.
// Ссылка калькулятора v1 (без ключа `retreat`) тоже понимается — её разбирает decodeLink калькулятора.

import type { Lang } from '../retreat-calc/engine'
import { decodeLink, fromBase64Url, MAX_FRAGMENT, toBase64Url, type LinkData } from '../retreat-calc/link'
import { pickPassport, type RetreatPassport } from './passport'

export const TOOL_LINK_VERSION = 1

export interface ToolLink<T> {
  v: 1
  retreat: RetreatPassport
  tool: T
}

export type DecodedTool<T> =
  | { ok: true; kind: 'tool'; link: ToolLink<T> }
  | { ok: true; kind: 'calc'; calc: LinkData }
  | { ok: false; error: string }

const MESSAGES = {
  ru: {
    none: 'в ссылке нет данных инструмента',
    broken: 'данные в ссылке повреждены',
    notObject: 'данные в ссылке не объект',
    version: (v: string) => `версия данных ${v} не поддерживается (нужна ${TOOL_LINK_VERSION})`,
  },
  en: {
    none: 'the link carries no tool data',
    broken: 'the data in the link is damaged',
    notObject: 'the data in the link is not an object',
    version: (v: string) => `data version ${v} is not supported (expected ${TOOL_LINK_VERSION})`,
  },
}

/** JSON с отсортированными ключами: одна и та же ссылка для одних и тех же данных. */
function stableJson(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, (v as Record<string, unknown>)[k]]))
      : v,
  )
}

/** Паспорт проходит allowlist и при записи: лишние ключи из состояния формы в ссылку не уходят.
 *  Поля инструмента вызывающий собирает сам, явным списком (см. `toolOf` у таймлайна). */
export function encodeToolLink<T>(l: ToolLink<T>): string {
  return `#data=${toBase64Url(stableJson({ v: l.v, retreat: pickPassport(l.retreat), tool: l.tool }))}`
}

export function decodeToolLink<T>(hash: string, pickTool: (raw: unknown) => T, lang: Lang): DecodedTool<T> {
  const t = MESSAGES[lang]
  if (hash.length > MAX_FRAGMENT) return { ok: false, error: t.broken }
  const m = /^#?data=([A-Za-z0-9_-]+)$/.exec(hash.trim())
  if (!m) return { ok: false, error: t.none }
  let raw: unknown
  try {
    raw = JSON.parse(fromBase64Url(m[1]))
  } catch {
    return { ok: false, error: t.broken }
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ok: false, error: t.notObject }
  const o = raw as Record<string, unknown>
  if (!('retreat' in o)) {
    const calc = decodeLink(hash, lang)
    return calc.ok ? { ok: true, kind: 'calc', calc: calc.data } : { ok: false, error: calc.error }
  }
  if (o.v !== TOOL_LINK_VERSION) return { ok: false, error: t.version(String(o.v)) }
  return { ok: true, kind: 'tool', link: { v: 1, retreat: pickPassport(o.retreat), tool: pickTool(o.tool) } }
}
