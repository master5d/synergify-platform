// Серверный модуль (без 'use client'), как self-check-bound: метка <InterestExample id="…"/> из MDX
// получает общий пример из списка pack'а и рендерит клиентский InterestExample.
import { INTEREST_EXAMPLES } from '@/lib/course/interest-examples'
import { findInterestExample, type InterestExampleItem } from '@/lib/interest-example/types'
import { InterestExample } from '@/components/interest-example'

export function bindInterestExample(moduleSlug: string, unitSlug: string, locale: 'ru' | 'en', list: readonly InterestExampleItem[] = INTEREST_EXAMPLES) {
  return function BoundInterestExample({ id }: { id: string }) {
    const item = findInterestExample(list, moduleSlug, unitSlug, id)
    return item ? <InterestExample item={item} locale={locale} /> : null
  }
}
