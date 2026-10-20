// packs/one-to-one/course/ai-doubles.ts
// Форма эталона (AiDoublesVM + резолвер). Данные — не «AI-двойники» (их у курса нет), а четыре
// несущие детали курса: band на витрине честно рассказывает, что человек разберёт. Ноль обещаний результата.
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export interface AiDouble { key: string; icon: string; name: Bi; does: Bi }

export const AI_DOUBLE_KEYS = ['map', 'method', 'limit', 'step'] as const

export interface ResolvedDouble { key: string; icon: string; name: string; does: string }

export interface AiDoublesVM { heading: string; lead: string; doubles: ResolvedDouble[] }

const HEADING: Bi = { ru: 'Что курс разбирает', en: 'What the course works through' }

const LEAD: Bi = {
  ru: 'Не мотивация и не продажи — четыре вещи, которые остаются у тебя в руках. Каждая проверяется на твоей практике.',
  en: 'Not motivation and not sales — four things that stay in your hands. Each is checked against your own practice.',
}

const AI_DOUBLES: AiDouble[] = [
  { key: 'map', icon: '🗺️',
    name: { ru: 'Карта практики', en: 'A map of your practice' },
    does: { ru: 'для каждого клиента видно, что он получает от метода, а что от отношений с тобой', en: 'for each client you see what they get from the method and what from their relationship with you' } },
  { key: 'method', icon: '📄',
    name: { ru: 'Метод на одной странице', en: 'A method on one page' },
    does: { ru: 'сессия описана шагами, и видно, какие шаги выдержат двух человек сразу', en: 'the session is described in steps, and you see which steps hold two people at once' } },
  { key: 'limit', icon: '⏳',
    name: { ru: 'Расчёт предела', en: 'The limit, worked out' },
    does: { ru: 'посчитаны цена твоего рабочего времени и потолок недели', en: 'the price of your working time and the weekly ceiling are worked out' } },
  { key: 'step', icon: '🪜',
    name: { ru: 'План первого шага', en: 'The plan of the first step' },
    does: { ru: 'встреча на 2–7 человек стоит в плане с датой, и ясно, кто остаётся один на один', en: 'a meeting for 2–7 people is in the plan with a date, and it is clear who stays one to one' } },
]

export function getAiDoubles(locale: Locale): AiDoublesVM {
  const L: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  return {
    heading: HEADING[L],
    lead: LEAD[L],
    doubles: AI_DOUBLES.map(d => ({ key: d.key, icon: d.icon, name: d.name[L], does: d.does[L] })),
  }
}
