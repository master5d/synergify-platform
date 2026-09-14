// Серверный модуль (без 'use client'): Next запрещает вызывать функцию из client-модуля в RSC,
// поэтому привязка метки живёт здесь, а рендерит она клиентский SelfCheck.
import type { SelfCheckItem } from '@/lib/content'
import { SelfCheck } from '@/components/self-check'

/** Серверная привязка: метка <SelfCheck id="…"/> из MDX получает вопрос из moduleMeta.checks. */
export function bindSelfCheck(checks: SelfCheckItem[] | undefined, locale: 'ru' | 'en', moduleSlug: string) {
  return function BoundSelfCheck({ id }: { id: string }) {
    const item = (checks ?? []).find(c => c.id === id)
    return item ? <SelfCheck item={item} locale={locale} moduleSlug={moduleSlug} /> : null
  }
}
