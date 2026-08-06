// Build-time reader for the academy course registry (LMS/registry.json).
// fs-read, not a source import: the academy app is independent from hub.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type Locale = 'ru' | 'en'

interface Bi { ru: string; en: string }

export interface AcademyInfo { name: string; fullName: Bi; url: string | null }

export interface AcademyCourse {
  slug: string
  name: string
  tagline: string
  url: string
  status: 'live' | 'coming-soon'
}

interface RegistryFile {
  academy: AcademyInfo
  courses: { slug: string; name: Bi; tagline: Bi; url: string; status: 'live' | 'coming-soon' }[]
}

function registry(): RegistryFile {
  const raw = readFileSync(join(process.cwd(), '..', 'LMS', 'registry.json'), 'utf8')
  return JSON.parse(raw) as RegistryFile
}

export function getAcademy(): AcademyInfo {
  return registry().academy
}

/** Localized course list, registry order, ALL statuses (live + coming-soon). */
export function getCourses(locale: Locale): AcademyCourse[] {
  return registry().courses.map((c) => ({
    slug: c.slug,
    name: c.name[locale],
    tagline: c.tagline[locale],
    url: c.url,
    status: c.status,
  }))
}
