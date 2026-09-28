// Служба заботы школы (волна 18, 2026-09-28): /zabota/ (+ /en/zabota/).
// Темы, срок ответа и лимиты — из общего LMS/care.json (его же читают воркер /api/care и курс).
// fs-мост на сборке, как lib/registry.ts: апп академии не импортирует исходники движка.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Locale } from './registry'

interface Bi { ru: string; en: string }
interface CareFile {
  responseTime: Bi
  topics: ({ key: string } & Bi)[]
  limits: { messageMin: number; messageMax: number; pageUrlMax: number }
}

export function careConfig(): CareFile {
  return JSON.parse(readFileSync(join(process.cwd(), '..', 'LMS', 'care.json'), 'utf8')) as CareFile
}

export interface CareFormCopy {
  topics: { key: string; label: string }[]
  limits: CareFile['limits']
  topicLabel: string
  topicPlaceholder: string
  messageLabel: string
  messageHint: string
  emailLabel: string
  emailHint: string
  pageUrlLabel: string
  pageUrlHint: string
  submit: string
  submitting: string
  success: string
  error: string
  rateLimited: string
  requiredError: string
}

export interface CarePageCopy {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  heading: string
  lead: string
  promises: string[]
  relatedLabel: string
  related: { label: string; href: string; note: string }[]
  backLabel: string
  form: CareFormCopy
}

export function getCare(locale: Locale): CarePageCopy {
  const c = careConfig()
  const when = c.responseTime[locale]
  const topics = c.topics.map((t) => ({ key: t.key, label: t[locale] }))
  if (locale === 'en') {
    return {
      metaTitle: 'Care desk — Synergema Authentica Starseed Holon Academy',
      metaDescription: `One window for help with the school: sign-in, practice, content, technical problems. A person answers ${when}.`,
      eyebrow: 'care desk',
      heading: 'Care desk',
      lead: 'Can’t get in, stuck in a practice, or something is broken? Write here — one window for help with the school.',
      promises: [
        'Sign-in and access, a step you’re stuck on, a question about the content, a technical problem.',
        `A person answers by email ${when}.`,
        'Your email is used only to reply to this message.',
      ],
      relatedLabel: 'also here',
      related: [
        { label: 'House rules', href: '/en/pravila/', note: 'how the school works' },
        { label: 'Practice feedback', href: '/praktika/en/feedback/', note: 'a review of a step, not a request for help' },
      ],
      backLabel: '← back to the school',
      form: {
        topics,
        limits: c.limits,
        topicLabel: 'Topic',
        topicPlaceholder: 'Choose a topic',
        messageLabel: 'What happened',
        messageHint: 'What you did, what you expected, what you saw instead.',
        emailLabel: 'Email for the reply',
        emailHint: 'Filled in if you’re signed in — you can change it.',
        pageUrlLabel: 'Link to the page where it happened (optional)',
        pageUrlHint: 'Copy it from the address bar.',
        submit: 'Send',
        submitting: 'Sending…',
        success: `Got it. We sent a confirmation to your email and will reply ${when}.`,
        error: 'Couldn’t send. Check your connection and try again.',
        rateLimited: 'Too many messages in a short time. Please try again in an hour.',
        requiredError: 'Choose a topic and describe what happened.',
      },
    }
  }
  return {
    metaTitle: 'Служба заботы — школа синергемы',
    metaDescription: `Одно окно помощи по школе: вход, практика, содержание, технические проблемы. Отвечает живой человек ${when}.`,
    eyebrow: 'служба заботы',
    heading: 'Служба заботы',
    lead: 'Не получается войти, застрял в практике или что-то сломалось? Напиши сюда — это одно окно помощи по школе.',
    promises: [
      'Вход и доступ, застрявший шаг, вопрос по содержанию, техническая проблема.',
      `Отвечает живой человек, на почту, ${when}.`,
      'Email нужен только для ответа на это обращение.',
    ],
    relatedLabel: 'ещё здесь',
    related: [
      { label: 'Правила дома', href: '/pravila/', note: 'как устроена школа' },
      { label: 'Отзыв о практике', href: '/praktika/feedback/', note: 'оценка шага, а не просьба о помощи' },
    ],
    backLabel: '← в школу',
    form: {
      topics,
      limits: c.limits,
      topicLabel: 'Тема',
      topicPlaceholder: 'Выбери тему',
      messageLabel: 'Что случилось',
      messageHint: 'Что делал, чего ждал, что увидел вместо этого.',
      emailLabel: 'Email для ответа',
      emailHint: 'Подставлен, если ты вошёл, — можно поменять.',
      pageUrlLabel: 'Ссылка на страницу, где это случилось (необязательно)',
      pageUrlHint: 'Скопируй из адресной строки.',
      submit: 'Отправить',
      submitting: 'Отправляем…',
      success: `Получили. Подтверждение ушло на почту, ответим ${when}.`,
      error: 'Не получилось отправить. Проверь соединение и попробуй ещё раз.',
      rateLimited: 'Слишком много обращений подряд. Попробуй через час.',
      requiredError: 'Выбери тему и опиши, что случилось.',
    },
  }
}
