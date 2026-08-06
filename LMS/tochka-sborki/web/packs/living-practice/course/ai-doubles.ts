// packs/living-practice/course/ai-doubles.ts
// Форма эталона (AiDoublesVM + резолвер). Данные — не «AI-двойники» (их у курса
// практики нет), а четыре несущие детали живого круга: band на витрине честно
// рассказывает, что человек получает от формата. Ноль обещаний результата.
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export interface AiDouble { key: string; icon: string; name: Bi; does: Bi }

export const AI_DOUBLE_KEYS = ['witness', 'floor', 'rotation', 'exit'] as const

export interface ResolvedDouble { key: string; icon: string; name: string; does: string }

export interface AiDoublesVM { heading: string; lead: string; doubles: ResolvedDouble[] }

const HEADING: Bi = { ru: 'Из чего сделан живой круг', en: 'What a living circle is made of' }

const LEAD: Bi = {
  ru: 'Не техники и не уровни — четыре несущие детали формата. Каждая проверяется простым вопросом.',
  en: 'Not techniques and not levels — four load-bearing parts of the format. Each is checked with a simple question.',
}

const AI_DOUBLES: AiDouble[] = [
  { key: 'witness', icon: '👥',
    name: { ru: 'Свидетель', en: 'A witness' },
    does: { ru: 'опыт слышат живые люди — не смайликом, а ответом', en: 'living people hear your experience — with an answer, not an emoji' } },
  { key: 'floor', icon: '🗣️',
    name: { ru: 'Слово по кругу', en: 'The floor goes around' },
    does: { ru: 'за встречу слово успевает взять каждый; молчание — законный ответ', en: 'everyone gets the floor within one meeting; silence is a legitimate answer' } },
  { key: 'rotation', icon: '🔄',
    name: { ru: 'Вращение ролей', en: 'Rotating roles' },
    does: { ru: 'вести круг — не должность: так не отрастает властная вертикаль', en: 'leading is not a post: no vertical of power gets to grow' } },
  { key: 'exit', icon: '🚪',
    name: { ru: 'Свободный выход', en: 'A free exit' },
    does: { ru: 'уйти можно молча, вернуться — без объяснений', en: 'you may leave quietly and return without explanations' } },
]

export function getAiDoubles(locale: Locale): AiDoublesVM {
  const L: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  return {
    heading: HEADING[L],
    lead: LEAD[L],
    doubles: AI_DOUBLES.map(d => ({ key: d.key, icon: d.icon, name: d.name[L], does: d.does[L] })),
  }
}
