import type { Locale } from '@/lib/intake/types'

export interface WillWontVM {
  heading: string
  willLabel: string
  wontLabel: string
  will: string[]
  wont: string[]
  punchline?: string
}

interface Entry { heading: string; will: string[]; wont: string[]; punchline?: string }

export const LABELS: Record<Locale, { will: string; wont: string }> = {
  ru: { will: 'Будет', wont: 'Не будет' },
  en: { will: 'Will', wont: "Won't" },
}

export const WILL_WONT: Record<string, Record<Locale, Entry>> = {
  'course-intro': {
    ru: {
      heading: 'Честный контракт',
      will: [
        'соберёшь рабочую штуку своими руками (бот, лендинг, автоматизация)',
        'научишься писать задачу для AI и держать цикл',
        'выберешь стек под себя — платный или суверенный',
        'пройдёшь путь от первого промпта до агента',
      ],
      wont: [
        'обещаний «100к за неделю» и income-flex',
        'воды и пересказа документации',
        'волшебной кнопки «сделай за меня»',
        'привязки к одному вендору',
      ],
      punchline: 'Без воды и без хайпа — честный обмен: ты вкладываешь внимание, курс даёт навык.',
    },
    en: {
      heading: 'An honest deal',
      will: [
        'you build a working thing with your own hands (a bot, a landing page, an automation)',
        'you learn to write the task for the AI and hold the loop',
        'you choose a stack that fits you — paid or sovereign',
        'you walk the path from your first prompt to an agent',
      ],
      wont: [
        "promises of '100k in a week' or income flexing",
        'filler or rehashing the docs',
        "a magic 'do-it-for-me' button",
        'lock-in to a single vendor',
      ],
      punchline: 'No fluff, no hype — an honest exchange: you invest attention, the course gives you skill.',
    },
  },
}

export function getWillWont(id: string, locale: Locale): WillWontVM | null {
  const L: Locale = locale === 'en' ? 'en' : 'ru'
  const entry = WILL_WONT[id]?.[L]
  if (!entry) return null
  return {
    heading: entry.heading,
    willLabel: LABELS[L].will,
    wontLabel: LABELS[L].wont,
    will: entry.will,
    wont: entry.wont,
    punchline: entry.punchline,
  }
}
