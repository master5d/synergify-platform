// packs/retreat/course/ai-doubles.ts
// Форма эталона (AiDoublesVM + резолвер). Данные — не «AI-двойники» (их у курса нет), а четыре
// несущие детали курса: band на витрине честно рассказывает, что человек разберёт. Ноль обещаний результата.
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export interface AiDouble { key: string; icon: string; name: Bi; does: Bi }

export const AI_DOUBLE_KEYS = ['deal', 'cash', 'cancel', 'guest'] as const

export interface ResolvedDouble { key: string; icon: string; name: string; does: string }

export interface AiDoublesVM { heading: string; lead: string; doubles: ResolvedDouble[] }

const HEADING: Bi = { ru: 'Что курс разбирает', en: 'What the course works through' }

const LEAD: Bi = {
  ru: 'Не мотивация и не продажи — четыре несущие детали сделки. Каждая проверяется расчётом или датой.',
  en: 'Not motivation and not sales — four load-bearing parts of the deal. Each is checked with a calculation or a date.',
}

const AI_DOUBLES: AiDouble[] = [
  { key: 'deal', icon: '🤝',
    name: { ru: 'Одна сделка с двух сторон', en: 'One deal, two sides' },
    does: { ru: 'ведущий и площадка считают одну и ту же группу — и видят, кто несёт пустое место', en: 'the leader and the venue count the same group — and see who carries an empty place' } },
  { key: 'cash', icon: '📅',
    name: { ru: 'Касса во времени', en: 'Cash over time' },
    does: { ru: 'деньги гостей должны прийти раньше, чем уходит платёж площадке', en: "guests' money has to arrive before the venue payment goes out" } },
  { key: 'cancel', icon: '↩️',
    name: { ru: 'Два календаря отмен', en: 'Two cancellation calendars' },
    does: { ru: 'сроки отмены у площадки и у гостей сверены так, чтобы между ними не было дыры', en: "the venue's and the guests' cancellation dates line up with no gap between them" } },
  { key: 'guest', icon: '🧭',
    name: { ru: 'Гость как процесс', en: 'The guest as a process' },
    does: { ru: 'анкета, меню, прибытие и согласия идут одной цепочкой, а не вспоминаются на месте', en: 'the form, the menu, arrival and consents run as one chain, not remembered on the spot' } },
]

export function getAiDoubles(locale: Locale): AiDoublesVM {
  const L: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  return {
    heading: HEADING[L],
    lead: LEAD[L],
    doubles: AI_DOUBLES.map(d => ({ key: d.key, icon: d.icon, name: d.name[L], does: d.does[L] })),
  }
}
