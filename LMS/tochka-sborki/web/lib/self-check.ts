// Чистая логика «проверь себя» (intake LMS#8): ответ не хранится, наружу — только анонимное
// событие аналитики, один раз на вопрос за просмотр (решение владельца 2026-09-14).
import type { SelfCheckItem } from './content'

export function isCorrect(item: Pick<SelfCheckItem, 'answer'>, picked: number | null): boolean {
  return picked !== null && picked === item.answer
}

export function makeTracker(send: (props: { unit: string; objective: string; correct: boolean }) => void) {
  const sent = new Set<string>()
  return (item: SelfCheckItem, correct: boolean) => {
    if (sent.has(item.id)) return
    sent.add(item.id)
    send({ unit: item.unit, objective: item.objective, correct })
  }
}
