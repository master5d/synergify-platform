// Служба заботы (волна 18, 2026-09-28): страница помощи курса — /care/ (+ /en/care/).
// НЕ путать с /support/ — там «Поддержать» (донат). Темы, срок ответа и лимиты — из общего
// LMS/care.json (его же читают воркер /api/care и академия), здесь только копия страницы
// и сетевые функции с подставным fetch (тот же приём, что lib/graduate-retro.ts).
import care from '../../../care.json'
import type { Locale } from '@/lib/dictionaries'

export const CARE = care
export type CareTopicKey = (typeof care.topics)[number]['key']
export type CareSite = keyof typeof care.sites

/** Какой сайт шлёт обращение: курс школы в подпути академии — «academy», иначе — курс. */
export function careSiteFor(courseDomain: string): CareSite {
  return courseDomain.startsWith(care.sites.academy.origin) ? 'academy' : 'tochka-sborki'
}

export function careTopics(locale: Locale): { key: CareTopicKey; label: string }[] {
  return care.topics.map(t => ({ key: t.key as CareTopicKey, label: t[locale] }))
}

export interface CareCopy {
  eyebrow: string
  title: string
  lead: string
  promises: string[]
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
  relatedLabel: string
  feedbackLink: string
  feedbackNote: string
  amaLink: string
  amaNote: string
  footerLink: string
}

export function careCopy(locale: Locale): CareCopy {
  const when = care.responseTime[locale]
  if (locale === 'en') {
    return {
      eyebrow: '// care desk',
      title: 'Care desk',
      lead: 'Stuck, can’t sign in, or something looks broken? Write here — this is one window for help with the course.',
      promises: [
        'Sign-in and access, a lesson you’re stuck in, a question about the content, a technical problem.',
        `A person answers by email ${when}.`,
        'We use your email only to reply to this message.',
      ],
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
      relatedLabel: 'Also here',
      feedbackLink: 'Module feedback',
      feedbackNote: 'a review of a module, not a request for help',
      amaLink: 'Open Q&A (AMA)',
      amaNote: 'bring your question to a live group session',
      footerLink: 'Care desk',
    }
  }
  return {
    eyebrow: '// служба заботы',
    title: 'Служба заботы',
    lead: 'Застрял, не можешь войти или что-то сломалось? Напиши сюда — это одно окно помощи по курсу.',
    promises: [
      'Вход и доступ, застрявший урок, вопрос по содержанию, техническая проблема.',
      `Отвечает живой человек, на почту, ${when}.`,
      'Email нужен только для ответа на это обращение.',
    ],
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
    relatedLabel: 'Ещё здесь',
    feedbackLink: 'Отзыв о модуле',
    feedbackNote: 'оценка модуля, а не просьба о помощи',
    amaLink: 'Открытый разбор (AMA)',
    amaNote: 'принеси вопрос на живую групповую встречу',
    footerLink: 'Служба заботы',
  }
}

export interface CareFields {
  topic: string
  message: string
  email: string
  pageUrl: string
  company: string // honeypot
}

/** Клиентская проверка до сети; сервер проверяет то же самое заново. */
export function validateCareFields(f: CareFields): (keyof CareFields)[] {
  const bad: (keyof CareFields)[] = []
  if (!care.topics.some(t => t.key === f.topic)) bad.push('topic')
  const m = f.message.trim()
  if (m.length < care.limits.messageMin || m.length > care.limits.messageMax) bad.push('message')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) bad.push('email')
  return bad
}

/** Email вошедшего ученика для предзаполнения; гость → пустая строка. */
export async function fetchCareEmail(fetchImpl: typeof fetch): Promise<string> {
  try {
    const res = await fetchImpl('/api/auth/me', { credentials: 'include' })
    if (!res.ok) return ''
    const data: { email?: string } = await res.json().catch(() => ({}))
    return typeof data.email === 'string' ? data.email : ''
  } catch {
    return ''
  }
}

export type CareSubmitResult = 'ok' | 'rate-limited' | 'error'

export async function submitCare(
  fetchImpl: typeof fetch,
  f: CareFields,
  meta: { site: CareSite; locale: Locale },
): Promise<CareSubmitResult> {
  try {
    const res = await fetchImpl('/api/care', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site: meta.site,
        locale: meta.locale,
        topic: f.topic,
        message: f.message.trim(),
        email: f.email.trim(),
        pageUrl: f.pageUrl.trim(),
        company: f.company,
      }),
    })
    if (res.ok) return 'ok'
    return res.status === 429 ? 'rate-limited' : 'error'
  } catch {
    return 'error'
  }
}
