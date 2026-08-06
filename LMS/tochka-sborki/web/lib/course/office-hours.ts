// web/lib/course/office-hours.ts
// Engine+data for the office-hours AMA bridge (free group Ask-Me-Anything) + a light
// pointer to separate 1:1 mentorship at mentor.mamaev.coach. Display = components/office-hours-card.tsx.
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export interface OfficeHoursData {
  amaRegisterUrl: string            // '' скрывает CTA; своя страница записи — /ama/ (см. app/ama)
  mentorUrl: string                 // https://mentor.mamaev.coach
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
  amaRegisterUrl: '/ama/',
  mentorUrl: 'https://mentor.mamaev.coach',
  eyebrow: { ru: 'За пределами курса', en: 'Beyond the course' },
  heading: {
    ru: 'Открытый разбор (AMA) — спроси что угодно',
    en: 'Open AMA office-hours — ask me anything',
  },
  intro: {
    ru: 'Живая групповая встреча: приноси свои вопросы по агентам, стеку, застрявшим проектам — разбираем вместе, бесплатно.',
    en: 'A live group session: bring your questions about agents, your stack, stuck projects — we work through them together, free.',
  },
  amaCtaLabel: { ru: 'Записаться на разбор', en: 'Register for the AMA' },
  cadenceNote: {
    ru: 'Встречи проходят регулярно; ближайшую дату и формат увидишь на странице записи.',
    en: 'Sessions run regularly; you’ll see the next date and format on the registration page.',
  },
  oneToOneCtaLabel: { ru: 'Личная работа 1:1', en: 'Work 1:1' },
  oneToOneBlurb: {
    ru: 'Нужен разбор именно твоего случая? Личное наставничество — отдельно, на mentor.mamaev.coach.',
    en: 'Need a deep dive on your own case? 1:1 mentorship is separate, at mentor.mamaev.coach.',
  },
  honestNote: {
    ru: 'Курс самодостаточен и бесплатен — это опциональный следующий шаг, а не платный замок.',
    en: 'The course is complete and free — this is an optional next step, not a paywall.',
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
      // Внутренний путь ('/ama/') локализуется; внешний URL остаётся как есть,
      // чтобы owner мог в любой момент подменить его на сторонний сервис.
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
