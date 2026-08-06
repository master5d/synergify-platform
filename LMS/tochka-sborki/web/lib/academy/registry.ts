// web/lib/academy/registry.ts
// Typed loader + validation for the academy course registry.
// SoT is LMS/registry.json (repo-level, shared by every surface) — this module
// gives the engine types, the parsed REGISTRY, and validateRegistry.
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'
import registryJson from '../../../../registry.json'

export type CourseStatus = 'live' | 'coming-soon'

export interface CourseEntry {
  slug: string
  name: Bi
  tagline: Bi
  url: string
  status: CourseStatus
  locales: readonly Locale[]
}

export interface AcademyRegistry {
  academy: { name: string; fullName: Bi; url: string | null; org: { name: string } }
  courses: CourseEntry[]
}

export const REGISTRY = registryJson as AcademyRegistry

const SLUG_RE = /^[a-z0-9-]+$/
const STATUSES: readonly CourseStatus[] = ['live', 'coming-soon']
const KNOWN_LOCALES: readonly Locale[] = ['ru', 'en']

function isValidUrl(url: string): boolean {
  return url.startsWith('https://') && !url.endsWith('/')
}

function biFilled(v: Bi): boolean {
  return v.ru.trim().length > 0 && v.en.trim().length > 0
}

/** Returns one message per violation; [] = valid. Mirrors validateOutline's shape. */
export function validateRegistry(r: AcademyRegistry): string[] {
  const errors: string[] = []
  if (r.academy.name.trim().length === 0) errors.push('academy.name is empty')
  if (!biFilled(r.academy.fullName)) {
    errors.push('academy.fullName must be non-empty in ru and en')
  }
  if (r.academy.url !== null && !isValidUrl(r.academy.url)) {
    errors.push('academy.url must be null or https:// without trailing slash')
  }
  if (r.academy.org.name.trim().length === 0) errors.push('academy.org.name is empty')
  const seen = new Set<string>()
  for (const c of r.courses) {
    const at = `courses[${c.slug}]`
    if (!SLUG_RE.test(c.slug)) errors.push(`${at}: slug must match ^[a-z0-9-]+$`)
    if (seen.has(c.slug)) errors.push(`${at}: duplicate slug`)
    seen.add(c.slug)
    if (!biFilled(c.name)) errors.push(`${at}: name must be non-empty in ru and en`)
    if (!biFilled(c.tagline)) errors.push(`${at}: tagline must be non-empty in ru and en`)
    if (!isValidUrl(c.url)) errors.push(`${at}: url must be https:// without trailing slash`)
    if (!STATUSES.includes(c.status)) {
      errors.push(`${at}: status must be one of ${STATUSES.join(', ')}`)
    }
    if (c.locales.length === 0 || c.locales.some((l) => !KNOWN_LOCALES.includes(l))) {
      errors.push(`${at}: locales must be a non-empty subset of ${KNOWN_LOCALES.join(', ')}`)
    }
  }
  if (!r.courses.some((c) => c.status === 'live')) {
    errors.push('registry must contain at least one live course')
  }
  return errors
}

export interface ResolvedCourse {
  slug: string
  name: string
  tagline: string
  url: string
  status: CourseStatus
}

/** Localized course list (registry order preserved) — what the catalog/switcher renders. */
export function resolveCourses(locale: Locale, r: AcademyRegistry = REGISTRY): ResolvedCourse[] {
  return r.courses.map((c) => ({
    slug: c.slug,
    name: c.name[locale],
    tagline: c.tagline[locale],
    url: c.url,
    status: c.status,
  }))
}

/** Live courses of the academy other than this app (self identified by url === selfUrl).
 *  What the CourseSwitcher renders; [] with a single-course registry (dark-ship). */
export function resolveOtherCourses(
  locale: Locale,
  selfUrl: string,
  r: AcademyRegistry = REGISTRY,
): ResolvedCourse[] {
  return resolveCourses(locale, r).filter(
    (c) => c.status === 'live' && c.url !== selfUrl,
  )
}
