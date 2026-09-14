// Чистая логика «проверь себя» (intake LMS#8): ответ не хранится, наружу — только анонимное
// событие аналитики, один раз на вопрос за просмотр (решение владельца 2026-09-14).
import type { SelfCheckItem } from './content'

export type SelfCheckEvent = { module: string; unit: string; objective: string; correct: boolean }

export function isCorrect(item: Pick<SelfCheckItem, 'answer'>, picked: number | null): boolean {
  return picked !== null && picked === item.answer
}

/** Событие несёт модуль (Ruling 7): id вопросов и целей уникальны только внутри модуля. */
export function makeTracker(send: (props: SelfCheckEvent) => void, moduleSlug: string) {
  const sent = new Set<string>()
  return (item: SelfCheckItem, correct: boolean) => {
    if (sent.has(item.id)) return
    sent.add(item.id)
    send({ module: moduleSlug, unit: item.unit, objective: item.objective, correct })
  }
}

const NOTES = {
  ru: { right: '— верный ответ', mine: '— ваш ответ' },
  en: { right: '— correct answer', mine: '— your answer' },
}

/** Текстовая пометка варианта после «Проверить» (WCAG 1.4.1: состояние не только цветом). */
export function optionNote(
  index: number,
  item: Pick<SelfCheckItem, 'answer'>,
  picked: number | null,
  shown: boolean,
  locale: 'ru' | 'en',
): string | null {
  if (!shown) return null
  if (index === item.answer) return NOTES[locale].right
  if (index === picked) return NOTES[locale].mine
  return null
}
