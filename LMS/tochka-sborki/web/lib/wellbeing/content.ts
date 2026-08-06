import type { Locale } from '@/lib/intake/types'

type L<T> = Record<Locale, T>

export const WB = {
  reengage: {
    title: { ru: 'Ты возвращаешься', en: 'You came back' } as L<string>,
    body: (g11: string | null, outcome: string | null, questsLeft: number, locale: Locale): string => {
      const anchor = g11
        ? (locale === 'ru' ? `${g11} тоже не останавливался(ась). ` : `${g11} didn't stop either. `)
        : ''
      const goal = outcome
        ? (locale === 'ru' ? `до «${outcome}» ` : `from "${outcome}" `)
        : ''
      return locale === 'ru'
        ? `${anchor}Ты в ${questsLeft} квестах ${goal}— продолжим с того места, где остановился(ась)?`
        : `${anchor}You're ${questsLeft} quests ${goal}away — pick up where you left off?`
    },
    cta: { ru: 'Продолжить →', en: 'Continue →' } as L<string>,
  },
  checkin: {
    title: { ru: 'Как ты держишься?', en: 'How are you holding up?' } as L<string>,
    ok: { ru: 'Норм', en: "I'm good" } as L<string>,
    overwhelmed: { ru: 'Перегружен(а)', en: 'A bit overwhelmed' } as L<string>,
    relief: {
      ru: 'Сбавь темп — переключись на режим «Командир», иди мелкими шагами. Прогресс не сгорит.',
      en: 'Ease off — switch to Commander mode and take small steps. Your progress is safe.',
    } as L<string>,
  },
  rest: {
    title: { ru: 'Сделай паузу', en: 'Take a breather' } as L<string>,
    body: {
      ru: 'Ты прошёл(ла) много за короткое время. Отдых — часть пути; прогресс никуда не денется.',
      en: "You've covered a lot in a short stretch. Rest is part of the path — your progress stays put.",
    } as L<string>,
    ack: { ru: 'Понятно', en: 'Got it' } as L<string>,
  },
  calibrate: {
    title: (moduleTitle: string, locale: Locale): string =>
      locale === 'ru' ? `«${moduleTitle}» пройден. Как сложность?` : `"${moduleTitle}" cleared. How was the challenge?`,
    easier: { ru: 'Легко', en: 'Too easy' } as L<string>,
    right: { ru: 'В самый раз', en: 'Just right' } as L<string>,
    harder: { ru: 'Тяжело', en: 'Too much' } as L<string>,
  },
} as const
