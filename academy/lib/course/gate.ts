// Admission-гейт курса: дверь, не сейф. Уроки бесплатны и не секретны — гейт
// является ритуалом входа («вход заслуженный»), а не DRM. Проверка server-verified:
// worker подтверждает admission по реальному прогрессу Точки Сборки.
import type { Locale } from '../registry'

export const API_BASE = 'https://ai.synergify.com'
export const ADMISSION_COURSE = 'tochka-sborki'

export interface AcademyMe {
  email?: string
  admissions?: { course: string; granted_at: number }[]
}

/** Есть ли у профиля admission нужного курса. */
export function isAdmitted(me: AcademyMe | null | undefined): boolean {
  return Boolean(me?.admissions?.some((a) => a.course === ADMISSION_COURSE))
}

export type GateState = 'checking' | 'admitted' | 'gated'

export interface GateCopy {
  checking: string
  eyebrow: string
  heading: string
  body: string[]
  cta: string
  ctaHref: string
  returnHint: string
  backLabel: string
}

const COPY: Record<Locale, GateCopy> = {
  ru: {
    checking: 'дверь узнаёт тебя…',
    eyebrow: 'вход',
    heading: 'Этот урок открывается после Точки Сборки',
    body: [
      'В академию нельзя записаться — в неё можно только войти. Не потому, что мы любим закрытые двери: сначала собери свою точку — потом учись её двигать.',
      'Программа курса открыта на странице курса. Сами уроки ждут тех, кто прошёл «Точку Сборки» — открытый и бесплатный курс, дверь в школу.',
    ],
    cta: 'Пройти Точку Сборки →',
    ctaHref: 'https://ai.synergify.com',
    returnHint: 'Уже прошёл? Войди на ai.synergify.com под своим входом и вернись сюда — дверь узнает тебя.',
    backLabel: '← к программе курса',
  },
  en: {
    checking: 'the door is recognizing you…',
    eyebrow: 'entrance',
    heading: 'This lesson opens after Tochka Sborki',
    body: [
      'You cannot sign up for the academy — you can only enter it. Not because we like closed doors: first assemble your point of assembly, then learn to move it.',
      'The course program is open on the course page. The lessons themselves wait for those who completed Tochka Sborki — an open and free course, the door into the school.',
    ],
    cta: 'Take Tochka Sborki →',
    ctaHref: 'https://ai.synergify.com/en/',
    returnHint: 'Already completed it? Sign in at ai.synergify.com and come back — the door will recognize you.',
    backLabel: '← back to the course program',
  },
}

export function gateCopy(locale: Locale): GateCopy {
  return COPY[locale]
}

/**
 * Проверка входа с самоисцелением: если admission ещё не выдан, но курс
 * пройден, — идемпотентный POST /admission выдаст его прямо у двери.
 * Любой сбой (нет сессии, нет сети, 403) → 'gated' (fail-closed: дверь,
 * которая при поломке распахнута, — не дверь).
 */
export async function checkAdmission(fetchFn: typeof fetch = fetch): Promise<GateState> {
  try {
    const meRes = await fetchFn(`${API_BASE}/api/academy/me`, { credentials: 'include' })
    if (meRes.ok) {
      const me = (await meRes.json()) as AcademyMe
      if (isAdmitted(me)) return 'admitted'
    } else if (meRes.status !== 401 && meRes.status !== 403) {
      return 'gated'
    }
    // Сессия есть, admission нет (или 401 — тогда POST тоже вернёт 401) → пробуем заслуженный вход.
    const grantRes = await fetchFn(`${API_BASE}/api/academy/admission`, {
      method: 'POST',
      credentials: 'include',
    })
    if (grantRes.ok) {
      const grant = (await grantRes.json()) as { granted?: boolean }
      if (grant.granted) return 'admitted'
    }
    return 'gated'
  } catch {
    return 'gated'
  }
}
