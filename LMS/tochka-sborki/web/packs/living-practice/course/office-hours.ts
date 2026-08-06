// packs/living-practice/course/office-hours.ts
// Форма эталона. AMA для этого курса пока не идёт: amaRegisterUrl = '' — движок
// честно гасит CTA (паттерн «рендерить тёмным при пустых данных»). 1:1 — указатель
// на общее наставничество владельца, без обещаний.
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export interface OfficeHoursData {
  amaRegisterUrl: string            // '' скрывает CTA
  mentorUrl: string
  eyebrow: Bi
  heading: Bi
  intro: Bi
  amaCtaLabel: Bi
  cadenceNote: Bi
  oneToOneCtaLabel: Bi
  oneToOneBlurb: Bi
  honestNote: Bi
}

export interface OfficeHoursVM {
  eyebrow: string
  heading: string
  intro: string
  ama: { available: boolean; registerUrl: string; ctaLabel: string; cadenceNote: string }
  oneToOne: { url: string; ctaLabel: string; blurb: string }
  honestNote: string
}

export const OFFICE_HOURS: OfficeHoursData = {
  amaRegisterUrl: '',
  mentorUrl: 'https://mentor.mamaev.coach',
  eyebrow: { ru: 'За пределами курса', en: 'Beyond the course' },
  heading: {
    ru: 'Живой разговор — когда он появится',
    en: 'A live conversation — when it opens',
  },
  intro: {
    ru: 'Курс читается сам по себе. Живые групповые встречи вокруг него пока не идут — когда откроются, запись появится здесь.',
    en: 'The course reads on its own. Live group sessions around it are not running yet — when they open, registration will appear here.',
  },
  amaCtaLabel: { ru: 'Записаться на встречу', en: 'Register for a session' },
  cadenceNote: {
    ru: 'Дату и формат увидишь на странице записи, когда встречи откроются.',
    en: 'You will see the date and format on the registration page once sessions open.',
  },
  oneToOneCtaLabel: { ru: 'Личная работа 1:1', en: 'Work 1:1' },
  oneToOneBlurb: {
    ru: 'Нужен разговор именно о твоей ситуации? Личное наставничество — отдельно, на mentor.mamaev.coach.',
    en: 'Need a conversation about your own situation? 1:1 mentorship is separate, at mentor.mamaev.coach.',
  },
  honestNote: {
    ru: 'Курс самодостаточен и бесплатен — это опциональный следующий шаг, а не платный замок. И ни один формат здесь не заменяет психотерапию.',
    en: 'The course is complete and free — this is an optional next step, not a paywall. And no format here replaces psychotherapy.',
  },
}

export function resolveOfficeHours(data: OfficeHoursData, locale: Locale): OfficeHoursVM {
  const k: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  return {
    eyebrow: data.eyebrow[k],
    heading: data.heading[k],
    intro: data.intro[k],
    ama: {
      available: data.amaRegisterUrl.trim().length > 0,
      registerUrl: data.amaRegisterUrl.startsWith('/') && k === 'en'
        ? `/en${data.amaRegisterUrl}`
        : data.amaRegisterUrl,
      ctaLabel: data.amaCtaLabel[k],
      cadenceNote: data.cadenceNote[k],
    },
    oneToOne: { url: data.mentorUrl, ctaLabel: data.oneToOneCtaLabel[k], blurb: data.oneToOneBlurb[k] },
    honestNote: data.honestNote[k],
  }
}

export function getOfficeHours(locale: Locale): OfficeHoursVM {
  return resolveOfficeHours(OFFICE_HOURS, locale)
}
