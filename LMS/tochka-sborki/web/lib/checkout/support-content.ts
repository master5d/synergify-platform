import type { Locale } from '@/lib/dictionaries'

export interface SupportPreset { label: string; cents: number }
export interface SupportContent {
  eyebrow: string
  title: string
  lead: string
  presets: SupportPreset[]
  customLabel: string
  customPlaceholder: string
  submitLabel: string
  footnote: string
  errorMsg: string
  thanksTitle: string
  thanksBody: string
}

const PRESETS: SupportPreset[] = [
  { label: '$3', cents: 300 },
  { label: '$7', cents: 700 },
  { label: '$15', cents: 1500 },
]

export function buildSupportContent(locale: Locale): SupportContent {
  if (locale === 'en') {
    return {
      eyebrow: 'Support',
      title: 'Support the work',
      lead: 'The course is free and stays free. If it helped, you can chip in to support the creator — no pressure, no strings.',
      presets: PRESETS,
      customLabel: 'Custom amount',
      customPlaceholder: 'Amount in $',
      submitLabel: 'Support →',
      footnote: 'This supports the creator (a sole proprietor) — it is not a tax-deductible nonprofit donation.',
      errorMsg: 'Temporarily unavailable — please try again.',
      thanksTitle: 'Thank you 🙏',
      thanksBody: 'Your support helps keep the course open and free. Come back anytime.',
    }
  }
  return {
    eyebrow: 'Поддержать',
    title: 'Поддержать проект',
    lead: 'Курс был и останется бесплатным. Если он оказался полезным — можешь поддержать автора. Без обязательств и давления.',
    presets: PRESETS,
    customLabel: 'Своя сумма',
    customPlaceholder: 'Сумма в $',
    submitLabel: 'Поддержать →',
    footnote: 'Это поддержка автора (ИП), а не пожертвование в нонпрофит с налоговым вычетом.',
    errorMsg: 'Временно недоступно — попробуй ещё раз.',
    thanksTitle: 'Спасибо 🙏',
    thanksBody: 'Твоя поддержка помогает держать курс открытым и бесплатным. Возвращайся в любой момент.',
  }
}
