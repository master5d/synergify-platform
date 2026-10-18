// packs/retreat/course/program-examples.ts
// Учебная неделя курса для конструктора программы академии: юниты ведут на живую страницу с заполненной сеткой
// через `#data=<base64url JSON>` вида `{ v: 1, retreat, tool: { blocks } }` (academy/lib/retreat-core/tool-link.ts).
// Карточек в ссылке нет: практики берутся из реестра ученика, а у нового ученика это стартовый набор академии
// (academy/lib/retreat-program/starter.ts) — поэтому `practiceId` здесь только из стартового набора. Тот же JSON читает
// тест академии и сверяет `expect` с проверками сетки (academy/lib/retreat-program/course-examples.test.ts).
import EXAMPLES from './program-examples.json'

export type ProgramExampleId = 'practice-week'

export interface ProgramBlock { day: number; start: string; minutes: number; kind: string; practiceId?: string }

export interface ProgramExample {
  id: ProgramExampleId
  title: { ru: string; en: string }
  data: {
    v: 1
    retreat: { currency: string; guests: number; nights: number; start: string }
    tool: { blocks: ProgramBlock[] }
  }
  expect: { issues: Record<string, unknown>[] }
}

export const PROGRAM_EXAMPLES = EXAMPLES as ProgramExample[]

const BASE = 'https://academy.synergify.com'
const PATH = '/instrumenty/konstruktor-programmy/'

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Ключи по алфавиту на каждом уровне — одна и та же неделя всегда даёт одну и ту же ссылку. */
function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sorted((value as Record<string, unknown>)[k])]))
  }
  return value
}

export function programExampleById(id: ProgramExampleId): ProgramExample {
  const ex = PROGRAM_EXAMPLES.find((e) => e.id === id)
  if (!ex) throw new Error(`program-examples: нет примера ${id}`)
  return ex
}

/** Ссылка на живой конструктор программы академии с учебной неделей; название — на языке урока. */
export function programHref(id: ProgramExampleId, locale: 'ru' | 'en'): string {
  const ex = programExampleById(id)
  const payload = sorted({ ...ex.data, retreat: { ...ex.data.retreat, title: ex.title[locale] } })
  return `${BASE}${locale === 'en' ? '/en' : ''}${PATH}#data=${toBase64Url(JSON.stringify(payload))}`
}
