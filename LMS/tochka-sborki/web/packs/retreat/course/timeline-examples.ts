// packs/retreat/course/timeline-examples.ts
// Учебные планы курса для таймлайна ретрита академии: юниты ведут на живую страницу с заполненной формой
// через `#data=<base64url JSON>` вида `{ v: 1, retreat, tool }` (academy/lib/retreat-core/tool-link.ts).
// Данные — в timeline-examples.json: тот же файл читает тест академии и сверяет `expect` с движком таймлайна
// (academy/lib/retreat-timeline/course-examples.test.ts). Даты — 2027–2028: пока они в будущем, страница
// не отмечает вехи учебного плана как прошедшие. Цифры круглые и учебные — не из чьих-то реальных ретритов.
import EXAMPLES from './timeline-examples.json'

export type TimelineExampleId = 'leader-plan' | 'fixed-plan'

export interface TimelineExample {
  id: TimelineExampleId
  title: { ru: string; en: string }
  data: {
    v: 1
    retreat: { currency: string; guests: number; nights: number; start: string }
    tool: Record<string, unknown>
  }
  expect: Record<string, string | string[]>
}

export const TIMELINE_EXAMPLES = EXAMPLES as TimelineExample[]

const BASE = 'https://academy.synergify.com'
const PATH = '/instrumenty/tajmlajn/'

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Ключи по алфавиту на каждом уровне — один и тот же план всегда даёт одну и ту же ссылку. */
function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sorted((value as Record<string, unknown>)[k])]))
  }
  return value
}

export function timelineExampleById(id: TimelineExampleId): TimelineExample {
  const ex = TIMELINE_EXAMPLES.find((e) => e.id === id)
  if (!ex) throw new Error(`timeline-examples: нет примера ${id}`)
  return ex
}

/** Ссылка на живой таймлайн академии с заполненным учебным планом; название — на языке урока. */
export function timelineHref(id: TimelineExampleId, locale: 'ru' | 'en'): string {
  const ex = timelineExampleById(id)
  const payload = sorted({ ...ex.data, retreat: { ...ex.data.retreat, title: ex.title[locale] } })
  return `${BASE}${locale === 'en' ? '/en' : ''}${PATH}#data=${toBase64Url(JSON.stringify(payload))}`
}
