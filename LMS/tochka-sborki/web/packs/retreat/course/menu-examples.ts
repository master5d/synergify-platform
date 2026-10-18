// packs/retreat/course/menu-examples.ts
// Учебные недели курса для генератора меню академии: юниты ведут на живую страницу с заполненной формой
// через `#data=<base64url JSON>` вида `{ v: 1, retreat, tool }` (academy/lib/retreat-core/tool-link.ts).
// Данные — в menu-examples.json: тот же файл читает тест академии и сверяет `expect` с движком меню
// (academy/lib/retreat-menu/course-examples.test.ts). Даты паспорта — 2028, как у учебных планов таймлайна.
// Неделя — пересказ меню шефа из интейка владельца без имён и без исходной валюты; цены круглые и учебные.
import EXAMPLES from './menu-examples.json'

export type MenuExampleId = 'plant-week'

export interface MenuExample {
  id: MenuExampleId
  title: { ru: string; en: string }
  data: {
    v: 1
    retreat: { currency: string; guests: number; nights: number; start: string }
    tool: { diets: Record<string, number> }
  }
  /** Сетка блюд на языке урока; итоги и замечания у языков одинаковы. */
  grid: { ru: Record<string, unknown>; en: Record<string, unknown> }
  expect: { perGuestWeek: number; perGroup: number; options: number; issues: Record<string, unknown>[] }
}

export const MENU_EXAMPLES = EXAMPLES as MenuExample[]

const BASE = 'https://academy.synergify.com'
const PATH = '/instrumenty/generator-menyu/'

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

export function menuExampleById(id: MenuExampleId): MenuExample {
  const ex = MENU_EXAMPLES.find((e) => e.id === id)
  if (!ex) throw new Error(`menu-examples: нет примера ${id}`)
  return ex
}

/** Ссылка на живой генератор меню академии с заполненной учебной неделей; название — на языке урока. */
export function menuHref(id: MenuExampleId, locale: 'ru' | 'en'): string {
  const ex = menuExampleById(id)
  const payload = sorted({ ...ex.data, retreat: { ...ex.data.retreat, title: ex.title[locale] }, tool: { ...ex.data.tool, grid: ex.grid[locale] } })
  return `${BASE}${locale === 'en' ? '/en' : ''}${PATH}#data=${toBase64Url(JSON.stringify(payload))}`
}
