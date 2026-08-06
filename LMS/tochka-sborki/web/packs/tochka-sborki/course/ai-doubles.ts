// lib/course/ai-doubles.ts
// The five "AI doubles" the learner builds — a compact, metrics-free preview of the
// u3-clones curriculum lesson, surfaced on the showcase. Keyed bilingual data + a
// locale-flattening resolver (mirrors lib/course/showcase.ts).
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export interface AiDouble { key: string; icon: string; name: Bi; does: Bi }

export const AI_DOUBLE_KEYS = ['communication', 'meetings', 'content', 'learning', 'automation'] as const

export interface ResolvedDouble { key: string; icon: string; name: string; does: string }

export interface AiDoublesVM { heading: string; lead: string; doubles: ResolvedDouble[] }

const HEADING: Bi = { ru: 'Пять AI-двойников, которых ты соберёшь', en: "Five AI doubles you'll build" }

const LEAD: Bi = {
  ru: 'Не «сделай за меня» — это рой, который ты отправляешь строить. Каждого собираешь сам.',
  en: "Not 'do it for me' — it's a swarm you send to build. You build each one yourself.",
}

const AI_DOUBLES: AiDouble[] = [
  { key: 'communication', icon: '📨',
    name: { ru: 'Коммуникация', en: 'Communication' },
    does: { ru: 'отвечает на письма твоим голосом', en: 'replies to emails in your voice' } },
  { key: 'meetings', icon: '🎧',
    name: { ru: 'Разбор встреч', en: 'Meeting intelligence' },
    does: { ru: 'конспект встречи и задачи после звонка', en: 'summaries and tasks after calls' } },
  { key: 'content', icon: '✍️',
    name: { ru: 'Контент', en: 'Content' },
    does: { ru: 'посты, клипы и идеи в твоём стиле', en: 'posts, clips and ideas in your style' } },
  { key: 'learning', icon: '📚',
    name: { ru: 'Обучение', en: 'Learning' },
    does: { ru: 'учит тебя новому по расписанию', en: 'teaches you new things on a schedule' } },
  { key: 'automation', icon: '⚙️',
    name: { ru: 'Автоматизация', en: 'Automation' },
    does: { ru: 'пайплайн: данные → отчёт, ссылка → конспект', en: 'pipeline: data → report, link → summary' } },
]

export function getAiDoubles(locale: Locale): AiDoublesVM {
  const L: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  return {
    heading: HEADING[L],
    lead: LEAD[L],
    doubles: AI_DOUBLES.map(d => ({ key: d.key, icon: d.icon, name: d.name[L], does: d.does[L] })),
  }
}
