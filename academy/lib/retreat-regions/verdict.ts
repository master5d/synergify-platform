import type { Bi, Mark, Verdict } from './types'

// Итоговый вердикт совпадения выбранной темы и аудитории с регионом
export function vibeVerdict(theme: Mark | null, audience: Mark | null): Verdict | null {
  if (theme === null && audience === null) return null

  const effectiveTheme = theme ?? 'neutral'
  const effectiveAudience = audience ?? 'neutral'

  const hasMatch = effectiveTheme === 'match' || effectiveAudience === 'match'
  const hasClash = effectiveTheme === 'clash' || effectiveAudience === 'clash'

  if (hasClash && hasMatch) return 'yes-but'
  if (hasClash && !hasMatch) return 'rather-no'
  if (hasMatch && !hasClash) return 'yes'
  return 'place-neutral'
}

// Двуязычные текстовые подписи вердиктов
export const VERDICT_TEXT: Record<Verdict, Bi> = {
  yes: { ru: 'Да, место совпадает', en: 'Yes, the place fits' },
  'yes-but': { ru: 'Да, но с оговоркой', en: 'Yes, with a caveat' },
  'rather-no': { ru: 'Скорее нет', en: 'Probably not' },
  'place-neutral': {
    ru: 'Место не решает — решает программа',
    en: 'The place does not decide — the programme does',
  },
}
