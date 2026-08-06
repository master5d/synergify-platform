import type { Segment } from '@/lib/content/annotated-example'
import type { Locale } from '@/lib/intake/types'

export interface PromptAnatomyVM { caption: string; segments: Segment[] }

export const PROMPT_ANATOMY: Record<Locale, PromptAnatomyVM> = {
  ru: {
    caption: 'Анатомия промпта',
    segments: [
      { text: 'Ты — senior Python-разработчик', label: 'Роль', note: 'Кто отвечает: даёшь AI экспертизу и тон.', accent: 'lime' },
      { text: 'у меня FastAPI-проект, где ручка /report отвечает 4 секунды', label: 'Контекст', note: 'Вводные: ситуация и данные.', accent: 'cyan' },
      { text: 'найди узкие места и предложи, как ускорить', label: 'Задача', note: 'Что сделать — одно действие.', accent: 'amber' },
      { text: 'без смены базы данных', label: 'Ограничения', note: 'Рамки: чего нельзя.', accent: 'magenta' },
      { text: 'ответь нумерованным списком с примерами кода', label: 'Формат', note: 'Форма результата: структура вывода.', accent: 'violet' },
    ],
  },
  en: {
    caption: 'Anatomy of a prompt',
    segments: [
      { text: 'You are a senior Python developer', label: 'Role', note: 'Who answers: you give the AI expertise and tone.', accent: 'lime' },
      { text: 'I have a FastAPI project where the /report endpoint takes 4 seconds', label: 'Context', note: 'The inputs: the situation and data.', accent: 'cyan' },
      { text: 'find the bottlenecks and suggest how to speed it up', label: 'Task', note: 'What to do — one action.', accent: 'amber' },
      { text: 'without switching the database', label: 'Constraints', note: "The limits: what's off-limits.", accent: 'magenta' },
      { text: 'answer as a numbered list with code examples', label: 'Format', note: 'The shape of the result: output structure.', accent: 'violet' },
    ],
  },
}

export function getPromptAnatomy(locale: Locale): PromptAnatomyVM {
  return PROMPT_ANATOMY[locale === 'en' ? 'en' : 'ru']
}
