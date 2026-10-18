// packs/retreat/course/form-examples.ts
// Учебная анкета курса для страницы анкеты гостя академии: юниты ведут на живую страницу с паспортом учебной недели
// через `#data=<base64url JSON>` вида `{ v: 1, retreat, tool }` (academy/lib/retreat-core/tool-link.ts).
// Ответы гостей в ссылку не идут никогда: учебные ответы — отдельный файл в public/retreat-materials, его ученик
// загружает сам. Тот же JSON читает тест академии и сверяет `expect` со сводкой
// (academy/lib/retreat-guest-form/course-examples.test.ts); диеты сводки равны диетам учебного меню `menuExample`.
import EXAMPLES from './form-examples.json'

export type FormExampleId = 'full-form'

export interface FormExample {
  id: FormExampleId
  title: { ru: string; en: string }
  data: {
    v: 1
    retreat: { currency: string; guests: number; nights: number; start: string }
    tool: Record<string, never>
  }
  /** Учебные ответы 20 вымышленных гостей: файл в public/retreat-materials, по языку урока. */
  sample: { ru: string; en: string }
  menuExample: string
  expect: { rows: number; guests: number; diets: Record<string, number>; issues: string[] }
}

export const FORM_EXAMPLES = EXAMPLES as FormExample[]

const BASE = 'https://academy.synergify.com'
const PATH = '/instrumenty/anketa-gostya/'

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Ключи по алфавиту на каждом уровне — один и тот же пример всегда даёт одну и ту же ссылку. */
function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sorted((value as Record<string, unknown>)[k])]))
  }
  return value
}

export function formExampleById(id: FormExampleId): FormExample {
  const ex = FORM_EXAMPLES.find((e) => e.id === id)
  if (!ex) throw new Error(`form-examples: нет примера ${id}`)
  return ex
}

/** Ссылка на живую анкету гостя академии с паспортом учебной недели; название — на языке урока. */
export function formHref(id: FormExampleId, locale: 'ru' | 'en'): string {
  const ex = formExampleById(id)
  const payload = sorted({ ...ex.data, retreat: { ...ex.data.retreat, title: ex.title[locale] } })
  return `${BASE}${locale === 'en' ? '/en' : ''}${PATH}#data=${toBase64Url(JSON.stringify(payload))}`
}

/** Путь к учебным ответам на сайте курса. */
export const formSamplePath = (id: FormExampleId, locale: 'ru' | 'en') => `/retreat-materials/${formExampleById(id).sample[locale]}`
