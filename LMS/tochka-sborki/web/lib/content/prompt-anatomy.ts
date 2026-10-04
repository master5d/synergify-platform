import type { Segment } from '@/lib/content/annotated-example'
import type { Locale } from '@/lib/intake/types'

export interface PromptAnatomyVM { caption: string; segments: Segment[] }

export const PROMPT_ANATOMY: Record<Locale, PromptAnatomyVM> = {
  ru: {
    caption: 'Анатомия промпта',
    segments: [
      { text: 'Ты — редактор рассылки', label: 'Роль', note: 'Кто отвечает: даёшь AI экспертизу и тон.', accent: 'lime' },
      { text: 'у меня письмо подписчикам на 400 слов, читают с телефона', label: 'Входные данные', note: 'Вводные: ситуация и данные.', accent: 'cyan' },
      { text: 'сократи до 150 слов, оставив призыв к действию', label: 'Задача', note: 'Что сделать — одно действие.', accent: 'amber' },
      { text: 'не менять тон и не добавлять скидки', label: 'Ограничения', note: 'Рамки: чего нельзя.', accent: 'magenta' },
      { text: 'верни готовый текст и список того, что убрал', label: 'Ожидаемый результат', note: 'Форма результата: структура вывода.', accent: 'violet' },
    ],
  },
  en: {
    caption: 'Anatomy of a prompt',
    segments: [
      { text: 'You are an email newsletter editor', label: 'Role', note: 'Who answers: you give the AI expertise and tone.', accent: 'lime' },
      { text: 'I have a 400-word email for subscribers who read on phones', label: 'Inputs', note: 'The inputs: the situation and data.', accent: 'cyan' },
      { text: 'cut it to 150 words while keeping the call to action', label: 'Task', note: 'What to do — one action.', accent: 'amber' },
      { text: 'keep the tone and do not add discounts', label: 'Constraints', note: "The limits: what's off-limits.", accent: 'magenta' },
      { text: 'return the finished copy and a list of what you removed', label: 'Expected result', note: 'The shape of the result: output structure.', accent: 'violet' },
    ],
  },
}

export function getPromptAnatomy(locale: Locale): PromptAnatomyVM {
  return PROMPT_ANATOMY[locale === 'en' ? 'en' : 'ru']
}
