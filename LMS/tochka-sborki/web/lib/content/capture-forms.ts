import type { Locale } from '@/lib/dictionaries'

export interface CaptureFormConfig {
  /** Tag stored on the lead; also the `id` used by getCaptureForm. */
  event: string
  heading: string
  blurb: string
  /** City <select> options. Empty array → the form renders a free-text city input. */
  cities: string[]
  /** Transparent reason the optional phone field is asked (shown beneath it). */
  phoneJustification: string
  /** GDPR consent checkbox copy. */
  consentLabel: string
  cta: string
  successMessage: string
}

const CAPTURE_FORMS: Record<string, Record<Locale, CaptureFormConfig>> = {
  'retreat-inner-evolution': {
    ru: {
      event: 'retreat-inner-evolution',
      heading: 'Интерес к ретриту «Внутренняя эволюция»',
      blurb: 'Оставь контакты — расскажем о ближайших датах и городах, без спама и давления. Отпишешься в один клик в любой момент.',
      cities: ['Нашвилл', 'Остин', 'Сан-Франциско', 'Онлайн'],
      phoneJustification: 'Телефон по желанию — для ретритов и когорт нужен личный контакт, не только письмо. Можно оставить только email.',
      consentLabel: 'Согласен(на) на обработку контактов, чтобы получать информацию об этом событии.',
      cta: 'Оставить заявку',
      successMessage: '✓ Спасибо! Мы на связи — напишем о датах и деталях.',
    },
    en: {
      event: 'retreat-inner-evolution',
      heading: 'Interest in the "Inner Evolution" retreat',
      blurb: 'Leave your details — we will share upcoming dates and cities. No spam, no pressure. Unsubscribe anytime in one click.',
      cities: ['Nashville', 'Austin', 'San Francisco', 'Online'],
      phoneJustification: 'Phone is optional — retreats and cohorts need personal contact, not just email. You can leave email only.',
      consentLabel: 'I consent to my contact details being processed to receive information about this event.',
      cta: 'Register interest',
      successMessage: '✓ Thank you! We will be in touch with dates and details.',
    },
  },
  // Открытый разбор (AMA). Регистрация живёт на своём домене, а не во внешнем сервисе:
  // лид уходит тем же путём, что и остальные, — POST /api/leads/capture → D1 event_leads.
  // Города не спрашиваем (встреча онлайн) → cities: [] даёт free-text поле, поэтому
  // подпись переиспользована под часовой пояс.
  'ama-office-hours': {
    ru: {
      event: 'ama-office-hours',
      heading: 'Запись на открытый разбор',
      blurb: 'Оставь почту — пришлём ссылку и время ближайшей встречи. Одно письмо перед разбором, без рассылок и напоминаний каждый день.',
      cities: [],
      phoneJustification: 'Телефон не нужен — встреча идёт онлайн, ссылку пришлём письмом.',
      consentLabel: 'Согласен(на) получить письмо со ссылкой и временем ближайшего разбора.',
      cta: 'Записаться',
      successMessage: '✓ Записал. Ссылку и время пришлём письмом перед встречей.',
    },
    en: {
      event: 'ama-office-hours',
      heading: 'Register for the open AMA',
      blurb: 'Leave your email — we will send the link and time of the next session. One email before the session; no drip, no daily reminders.',
      cities: [],
      phoneJustification: 'No phone needed — the session is online and the link comes by email.',
      consentLabel: 'I agree to receive one email with the link and time of the next session.',
      cta: 'Register',
      successMessage: '✓ You are on the list. The link and time will arrive by email before the session.',
    },
  },
}

export function getCaptureForm(id: string, locale: Locale): CaptureFormConfig | null {
  return CAPTURE_FORMS[id]?.[locale] ?? null
}
