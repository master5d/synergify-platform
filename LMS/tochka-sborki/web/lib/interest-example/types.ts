// lib/interest-example/types.ts — контракт данных примера концепт-фазы (без алиасов: его тянет воркер).
import type { Interest } from './interests'

/** Размеченный пример: общий текст в двух локалях. В MDX юнита — только метка <InterestExample id="…"/>.
 *  Текст — 1–3 абзаца прозы (разделитель — пустая строка), допускается инлайн-код в `…`;
 *  кодовых блоков, таблиц и ссылок нет (гвард registry.test.ts). */
export interface InterestExampleItem {
  module: string
  unit: string
  id: string
  text: { ru: string; en: string }
}

export type InterestLocale = 'ru' | 'en'

/** Ответ воркера POST /api/interest-example. Прецедент деградации — prose_source='template'. */
export type InterestExampleResponse =
  | { source: 'interest'; interest: Interest; text: string }
  | { source: 'template'; reason: 'no_interest' | 'rejected' | 'unavailable' | 'pending' }

export function findInterestExample(
  list: readonly InterestExampleItem[], module: string, unit: string, id: string,
): InterestExampleItem | undefined {
  return list.find(x => x.module === module && x.unit === unit && x.id === id)
}
