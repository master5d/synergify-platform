// Серверный модуль (без 'use client'), как role-play-bound: метка <FadedExample id="…"/> из MDX получает
// пример из списка pack'а и рендерит клиентский FadedExample. Неизвестный id — пусто
// (гвард lib/faded-example.test.ts не пускает такую метку в контент).
import { FADED_EXAMPLES } from '@/lib/course/faded-examples'
import { findFadedExample, type FadedExampleData } from '@/lib/faded-example'
import { FadedExample } from '@/components/faded-example'

export function bindFadedExample(moduleSlug: string, unitSlug: string, locale: 'ru' | 'en', list: readonly FadedExampleData[] = FADED_EXAMPLES) {
  return function BoundFadedExample({ id }: { id: string }) {
    const example = findFadedExample(list, moduleSlug, unitSlug, id)
    return example ? <FadedExample example={example} locale={locale} /> : null
  }
}
