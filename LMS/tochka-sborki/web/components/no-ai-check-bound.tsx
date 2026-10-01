// Серверный модуль (без 'use client'), как role-play-bound: метка <NoAiCheck id="…"/> из MDX получает
// вопросы из списка pack'а и рендерит клиентский NoAiCheck. Неизвестный id — пусто
// (гвард lib/no-ai-check.test.ts не пускает такую метку в контент).
import { NO_AI_CHECKS } from '@/lib/course/no-ai-checks'
import { findNoAiCheck, type NoAiCheckData } from '@/lib/no-ai-check'
import { NoAiCheck } from '@/components/no-ai-check'

export function bindNoAiCheck(moduleSlug: string, unitSlug: string, locale: 'ru' | 'en', list: readonly NoAiCheckData[] = NO_AI_CHECKS) {
  return function BoundNoAiCheck({ id }: { id: string }) {
    const check = findNoAiCheck(list, moduleSlug, unitSlug, id)
    return check ? <NoAiCheck check={check} locale={locale} /> : null
  }
}
