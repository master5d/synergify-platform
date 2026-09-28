// Служба заботы (волна 18, 2026-09-28): одно окно помощи для Точки Сборки, академии и mamaev.coach.
// Конфиг — LMS/care.json (тот же файл читают страницы курса и академии): темы, срок ответа, лимиты.
// Здесь — чистые функции: валидация обращения, письма владельцу и обратившемуся.
import care from '../../../LMS/care.json'

export type CareLocale = 'ru' | 'en'
export type CareSite = keyof typeof care.sites
export type CareTopic = (typeof care.topics)[number]['key']

export const CARE = care
export const CARE_TOPICS = care.topics.map(t => t.key) as CareTopic[]
export const CARE_SITES = Object.keys(care.sites) as CareSite[]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface CareRequest {
  site: CareSite
  topic: CareTopic
  message: string
  email: string
  pageUrl: string | null
  locale: CareLocale
}

export type CareValidation = { ok: true; value: CareRequest } | { ok: false; error: string }

/** Сайт — из тела (закрытый список); без него — по Origin запроса. */
export function siteFromOrigin(origin: string | null): CareSite | null {
  if (!origin) return null
  for (const s of CARE_SITES) {
    const o = care.sites[s].origin
    if (origin === o || origin === o.replace('https://', 'https://www.')) return s
  }
  return null
}

export function validateCare(body: Record<string, unknown>, origin: string | null): CareValidation {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const site = (CARE_SITES as string[]).includes(str(body.site)) ? (str(body.site) as CareSite) : siteFromOrigin(origin)
  if (!site) return { ok: false, error: 'Unknown site' }
  const topic = str(body.topic)
  if (!(CARE_TOPICS as string[]).includes(topic)) return { ok: false, error: 'Unknown topic' }
  const message = str(body.message)
  if (message.length < care.limits.messageMin) return { ok: false, error: 'Message too short' }
  if (message.length > care.limits.messageMax) return { ok: false, error: 'Message too long' }
  const email = str(body.email).toLowerCase()
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return { ok: false, error: 'Valid email required' }
  let pageUrl: string | null = str(body.pageUrl) || null
  if (pageUrl) {
    if (pageUrl.length > care.limits.pageUrlMax) return { ok: false, error: 'Page URL too long' }
    try {
      const u = new URL(pageUrl)
      if (u.protocol !== 'https:' && u.protocol !== 'http:') return { ok: false, error: 'Invalid page URL' }
    } catch {
      return { ok: false, error: 'Invalid page URL' }
    }
  }
  const locale: CareLocale = body.locale === 'en' ? 'en' : 'ru'
  return { ok: true, value: { site, topic: topic as CareTopic, message, email, pageUrl, locale } }
}

export function topicLabel(topic: CareTopic, locale: CareLocale): string {
  return care.topics.find(t => t.key === topic)?.[locale] ?? topic
}

export function siteName(site: CareSite, locale: CareLocale): string {
  return care.sites[site].name[locale]
}

export const CARE_FROM_ADDRESS = 'noreply@synergify.com'

/** Письмо владельцу: всё, что нужно, чтобы ответить, не открывая журнал. */
export function buildOwnerCareEmail(r: CareRequest, meta: { id: string; stored: boolean; userId: string | null }) {
  return {
    subject: `Служба заботы · ${siteName(r.site, 'ru')} · ${topicLabel(r.topic, 'ru')}`,
    text: [
      `Сайт: ${siteName(r.site, 'ru')} (${r.site})`,
      `Тема: ${topicLabel(r.topic, 'ru')}`,
      `Email: ${r.email}${meta.userId ? ` (вошёл, user ${meta.userId})` : ''}`,
      `Страница: ${r.pageUrl ?? '—'}`,
      `Язык: ${r.locale}`,
      `Обращение: ${meta.id}${meta.stored ? '' : ' — В ЖУРНАЛ НЕ ЗАПИСАНО (таблица care_requests недоступна, миграция 0020?)'}`,
      '',
      r.message,
    ].join('\n'),
  }
}

/** Автоответ обратившемуся. Текст обращения НЕ повторяется (форма не должна становиться
 *  ретранслятором чужого текста на произвольный адрес); обещание — только срок из конфига. */
export function buildCareAutoreply(r: CareRequest) {
  const l = r.locale
  const name = siteName(r.site, l)
  const when = care.responseTime[l]
  if (l === 'en') {
    return {
      from: `${name} care <${CARE_FROM_ADDRESS}>`,
      subject: 'We got your message',
      text: [
        'Hello!',
        '',
        `We received your message to the ${name} care desk (topic: ${topicLabel(r.topic, l)}).`,
        `A person will reply to this address ${when}.`,
        '',
        'If you did not write to us, just ignore this email.',
      ].join('\n'),
    }
  }
  return {
    from: `Служба заботы · ${name} <${CARE_FROM_ADDRESS}>`,
    subject: 'Мы получили ваше обращение',
    text: [
      'Здравствуйте!',
      '',
      `Мы получили ваше обращение в службу заботы «${name}» (тема: ${topicLabel(r.topic, l)}).`,
      `Живой человек ответит на этот адрес ${when}.`,
      '',
      'Если вы нам не писали — просто проигнорируйте это письмо.',
    ].join('\n'),
  }
}

/** Публичная часть конфига — для страниц, которые не могут прочитать LMS/care.json на сборке (mamaev.coach). */
export function publicCareConfig() {
  return { responseTime: care.responseTime, topics: care.topics, limits: care.limits }
}
