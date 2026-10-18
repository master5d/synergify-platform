// packs/retreat/course/venue-examples.ts
// Учебные площадки курса для года площадки академии: юниты 05/u3 и 05/u4 ведут на живую страницу с заполненной моделью
// через `#data=<base64url JSON>` вида `{ v: 1, retreat: { currency, title }, tool: <площадка> }`
// (academy/lib/retreat-core/tool-link.ts). Тот же JSON читает тест академии и сверяет `expect` с движком
// (academy/lib/retreat-venue/course-examples.test.ts). Глэмпинг — по мотивам модели из интейка (6 модулей, ночь 140,
// вложения 630 000), но с честным годом: сезон, расходы закрытых месяцев, налог и резерв на замену.
import EXAMPLES from './venue-examples.json'

export type VenueExampleId = 'retreat-center' | 'glamping'

export interface VenueExample {
  id: VenueExampleId
  title: { ru: string; en: string }
  currency: string
  venue: Record<string, unknown>
  expect: { noiCents: number; yieldPct: number; paybackYears: number; issues: Record<string, unknown>[] }
}

export const VENUE_EXAMPLES = EXAMPLES as VenueExample[]

const BASE = 'https://academy.synergify.com'
const PATH = '/instrumenty/god-ploshchadki/'

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Ключи по алфавиту на каждом уровне — одна и та же площадка всегда даёт одну и ту же ссылку. */
function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sorted((value as Record<string, unknown>)[k])]))
  }
  return value
}

export function venueExampleById(id: VenueExampleId): VenueExample {
  const ex = VENUE_EXAMPLES.find((e) => e.id === id)
  if (!ex) throw new Error(`venue-examples: нет примера ${id}`)
  return ex
}

/** Ссылка на живой год площадки академии с учебной моделью; название — на языке урока. */
export function venueHref(id: VenueExampleId, locale: 'ru' | 'en'): string {
  const ex = venueExampleById(id)
  const payload = sorted({ v: 1, retreat: { currency: ex.currency, title: ex.title[locale] }, tool: ex.venue })
  return `${BASE}${locale === 'en' ? '/en' : ''}${PATH}#data=${toBase64Url(JSON.stringify(payload))}`
}
