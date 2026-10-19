// packs/retreat/course/booklet-examples.ts
// Учебный буклет урока 03/u5 для инструмента «Буклет ретрита» академии: ссылка `#data=<base64url JSON>` вида
// `{ v: 1, retreat, tool }` (academy/lib/retreat-booklet/form.ts, bookletHash). JSON собран настоящими функциями движка
// буклета из учебной недели конструктора и учебного плана таймлайна (те же данные, что в уроках 04/u2 и 03/u4), поэтому
// цифры буклета совпадают с цифрами тех уроков. Тексты буклета — на языке урока, поэтому данные лежат по локалям.
// Ошибки и замечания, которые увидит ученик, сверяет тест академии (academy/lib/retreat-booklet/course-examples.test.ts).
import EXAMPLES from './booklet-examples.json'

export type BookletExampleId = 'practice-booklet'

export interface BookletExample {
  id: BookletExampleId
  title: { ru: string; en: string }
  data: Record<'ru' | 'en', { v: 1; retreat: Record<string, unknown>; tool: Record<string, unknown> }>
  expect: Record<'ru' | 'en', { today: string; errors: Record<string, unknown>[]; warnings: Record<string, unknown>[]; hashLength: number }>
}

export const BOOKLET_EXAMPLES = EXAMPLES as BookletExample[]

const BASE = 'https://academy.synergify.com'
const PATH = '/instrumenty/buklet/'

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Ключи по алфавиту на каждом уровне — тот же буклет всегда даёт ту же ссылку (как stableJson академии). */
function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sorted((value as Record<string, unknown>)[k])]))
  }
  return value
}

export function bookletExampleById(id: BookletExampleId): BookletExample {
  const ex = BOOKLET_EXAMPLES.find((e) => e.id === id)
  if (!ex) throw new Error(`booklet-examples: нет примера ${id}`)
  return ex
}

/** Ссылка на живой буклет академии с учебным буклетом на языке урока. */
export function bookletHref(id: BookletExampleId, locale: 'ru' | 'en'): string {
  const ex = bookletExampleById(id)
  return `${BASE}${locale === 'en' ? '/en' : ''}${PATH}#data=${toBase64Url(JSON.stringify(sorted(ex.data[locale])))}`
}
