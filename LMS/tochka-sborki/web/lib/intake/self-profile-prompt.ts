import type { Locale } from './types'

/** Оборачивает companion-charter в запрос на лингвистический/учебный профиль. Copy-only. */
export function buildSelfProfilePrompt(charter: string, locale: Locale): string {
  if (locale === 'en') {
    return [
      'Here is my co-thinking profile:',
      '',
      charter,
      '',
      '---',
      'Based on this profile, build my **linguistic and learning profile**: how to best explain things to me, at what pace, through which kinds of examples and metaphors. Then propose a hyper-individualized path for learning AI tools tailored to me.',
      'Start by asking me 1–2 clarifying questions before you write the profile.',
    ].join('\n')
  }
  return [
    'Вот мой профиль со-мышления:',
    '',
    charter,
    '',
    '---',
    'На основе этого профиля собери мой **лингвистический и учебный профиль**: как со мной лучше объяснять, в каком темпе, через какие примеры и метафоры. Затем предложи гипериндивидуализированный путь освоения AI-инструментов под меня.',
    'Сначала задай мне 1–2 уточняющих вопроса, прежде чем писать профиль.',
  ].join('\n')
}
