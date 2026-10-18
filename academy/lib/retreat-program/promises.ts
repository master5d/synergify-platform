import type { Lang } from '../retreat-calc/engine'

export const PROMISE_PATTERNS: { pattern: string; label: Record<Lang, string> }[] = [
  {
    pattern: '(практика|ретрит|программа) (исцеляет|исцелит|вылечит)|(practice|retreat|program) (heals|will heal|cures)',
    label: { ru: 'обещание исцеления', en: 'healing claim' },
  },
  ...[
    ['исцел', 'упоминание исцеления', 'healing mention'],
    ['вылеч', 'обещание лечения', 'treatment claim'],
    ['экстрасенс', 'экстрасенсорное обещание', 'psychic claim'],
    ['сверхспособн', 'обещание сверхспособностей', 'superpower claim'],
    ['избав(им|ит|ишь)ся от', 'обещание избавления', 'get-rid-of claim'],
    ['очищ(ение|ает) (организм|печен)', 'обещание очищения', 'detox claim'],
    ['\\bheal(s|ing|ed|er)?\\b', 'обещание исцеления', 'healing claim'],
    ['\\bcures?\\b', 'обещание лечения', 'treatment claim'],
    ['psychic', 'экстрасенсорное обещание', 'psychic claim'],
    ['superpower', 'обещание сверхспособностей', 'superpower claim'],
    ['get rid of', 'обещание избавления', 'get-rid-of claim'],
    ['detox', 'обещание очищения', 'detox claim'],
  ].map(([pattern, ru, en]) => ({ pattern, label: { ru, en } })),
]

export function findPromises(text: string): string[] {
  const found: string[] = []
  for (const { pattern } of PROMISE_PATTERNS) {
    const matches = text.match(new RegExp(pattern, 'gi'))
    if (matches) found.push(...matches)
  }
  return found
}
