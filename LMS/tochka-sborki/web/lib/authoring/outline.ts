// lib/authoring/outline.ts
// Typed course-outline contract + a pure validator. The deterministic spine the
// AI authoring stages (research/draft/review) later write into. No I/O.
import type { Bi } from '@/lib/course'

export interface UnitOutline { slug: string; title: Bi; objective: Bi }
export interface ModuleOutline { slug: string; title: Bi; description: Bi; level: number; units: UnitOutline[] }
export interface CourseOutline { name: Bi; modules: ModuleOutline[] }

const MODULE_SLUG = /^\d{2}-[a-z0-9-]+$/
const UNIT_SLUG = /^u\d+-[a-z0-9-]+$/

function biComplete(b: Bi | undefined | null): boolean {
  return !!b && typeof b.ru === 'string' && b.ru.trim().length > 0
    && typeof b.en === 'string' && b.en.trim().length > 0
}

/** Returns [] when valid, else a list of human-readable error messages. */
export function validateOutline(o: CourseOutline): string[] {
  const errors: string[] = []
  if (!biComplete(o.name)) errors.push('course name must be non-empty in ru and en')
  if (!o.modules || o.modules.length === 0) errors.push('course must have at least one module')

  const moduleSlugs = new Set<string>()
  for (const m of o.modules ?? []) {
    if (!MODULE_SLUG.test(m.slug)) errors.push(`module slug "${m.slug}" must match NN-slug (e.g. 01-intro)`)
    if (moduleSlugs.has(m.slug)) errors.push(`duplicate module slug "${m.slug}"`)
    moduleSlugs.add(m.slug)
    if (!Number.isInteger(m.level) || m.level < 1) errors.push(`module "${m.slug}" level must be an integer >= 1`)
    if (!biComplete(m.title)) errors.push(`module "${m.slug}" title must be non-empty in ru and en`)
    if (!biComplete(m.description)) errors.push(`module "${m.slug}" description must be non-empty in ru and en`)
    if (!m.units || m.units.length === 0) errors.push(`module "${m.slug}" must have at least one unit`)

    const unitSlugs = new Set<string>()
    for (const u of m.units ?? []) {
      if (!UNIT_SLUG.test(u.slug)) errors.push(`unit slug "${u.slug}" must match uN-slug (e.g. u1-intro)`)
      if (unitSlugs.has(u.slug)) errors.push(`duplicate unit slug "${u.slug}" in module "${m.slug}"`)
      unitSlugs.add(u.slug)
      if (!biComplete(u.title)) errors.push(`unit "${u.slug}" title must be non-empty in ru and en`)
      if (!biComplete(u.objective)) errors.push(`unit "${u.slug}" objective must be non-empty in ru and en`)
    }
  }
  return errors
}
