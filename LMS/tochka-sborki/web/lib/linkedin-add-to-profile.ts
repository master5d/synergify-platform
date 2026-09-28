// «Добавить в профиль LinkedIn» (intake LMS#18, Coursera): ссылка LinkedIn Add to Profile,
// раздел Licenses & certifications. Без API и ключей — LinkedIn читает поля из URL-параметров.
// Формат — официальная страница Add to Profile (addtoprofile.linkedin.com, раздел
// «Certifications»): https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME
//   &name=…&organizationId=… | &organizationName=… (ровно одно из двух)
//   &issueYear=…&issueMonth=…(1–12)&expirationYear=…&expirationMonth=…&certUrl=…&certId=…
// У академии нет страницы-организации с известным ID → organizationName. Срока действия у
// сертификата нет → expiration* не передаём. Пустое поле не шлём вовсе: пустой `certId=`
// LinkedIn подставил бы в форму как пустую строку.
import type { Locale } from '@/lib/dictionaries'
import { REGISTRY, type AcademyRegistry } from '@/lib/academy/registry'

export const LINKEDIN_ADD_TO_PROFILE = 'https://www.linkedin.com/profile/add'

export interface LinkedInCertification {
  /** Название сертификата (курс). */
  name: string
  /** Выдавшая организация (без LinkedIn-страницы → organizationName). */
  organizationName: string
  /** Дата выпуска — ISO-строка или Date; месяц/год берутся в UTC, как `completedAt` проверки. */
  issuedAt?: string | Date | null
  /** Credential ID — код проверки сертификата. */
  certId?: string | null
  /** Credential URL — публичная страница проверки. */
  certUrl?: string | null
}

function clean(v: string | null | undefined): string {
  return (v ?? '').trim()
}

/** Ссылка Add to Profile; null — если нет названия или организации (форма без них бессмысленна). */
export function linkedInAddToProfileUrl(c: LinkedInCertification): string | null {
  const name = clean(c.name)
  const org = clean(c.organizationName)
  if (!name || !org) return null
  const params: [string, string][] = [
    ['startTask', 'CERTIFICATION_NAME'],
    ['name', name],
    ['organizationName', org],
  ]
  if (c.issuedAt) {
    const d = c.issuedAt instanceof Date ? c.issuedAt : new Date(c.issuedAt)
    if (!Number.isNaN(d.getTime())) {
      params.push(['issueYear', String(d.getUTCFullYear())], ['issueMonth', String(d.getUTCMonth() + 1)])
    }
  }
  const certUrl = clean(c.certUrl)
  if (certUrl) params.push(['certUrl', certUrl])
  const certId = clean(c.certId)
  if (certId) params.push(['certId', certId])
  // encodeURIComponent, а не URLSearchParams: пробел — %20, как в примерах LinkedIn (не «+»).
  return `${LINKEDIN_ADD_TO_PROFILE}?${params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`
}

/** Название курса и организация для сертификата — из LMS/registry.json (единый источник). */
export function certificationIdentity(
  courseSlug: string,
  locale: Locale,
  r: AcademyRegistry = REGISTRY,
): { name: string; organizationName: string } | null {
  const course = r.courses.find(c => c.slug === courseSlug)
  if (!course) return null
  return { name: course.name[locale], organizationName: r.academy.org.name }
}
