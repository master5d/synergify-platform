// lib/authoring/orchestrate.ts
// S5 of the course-authoring engine: compose S1-S4 into one pure authoring pass that reports
// per-unit status (needs-research / ready / needs-polish). Report-only, no I/O, no writes.
import type { CourseOutline } from './outline'
import type { ResearchNotes } from './research'
import type { Locale } from '@/lib/dictionaries'
import { validateOutline } from './outline'
import { draftLesson, validateDraftMdx } from './draft'
import { lintReadability } from './review'

export type UnitStatus = 'needs-research' | 'ready' | 'needs-polish'

export interface UnitResult {
  moduleSlug: string
  unitSlug: string
  status: UnitStatus
  mdx?: string          // present when a draft was produced (ready | needs-polish)
  findings?: string[]   // present + non-empty for needs-polish
}

export interface AuthoringReport {
  outlineErrors: string[]
  units: UnitResult[]
}

/** Pure: compose S1 (validateOutline) + S3 (draftLesson/validateDraftMdx) + S4 (lintReadability)
 *  into a per-unit report. notesByUnit is keyed `${moduleSlug}/${unitSlug}`. No writes. */
export function runAuthoringPass(
  outline: CourseOutline,
  notesByUnit: Record<string, ResearchNotes>,
  locale: Locale,
): AuthoringReport {
  const outlineErrors = validateOutline(outline)
  const units: UnitResult[] = []
  outline.modules.forEach((m, mi) => {
    m.units.forEach((u, ui) => {
      const notes = notesByUnit[`${m.slug}/${u.slug}`]
      if (!notes) {
        units.push({ moduleSlug: m.slug, unitSlug: u.slug, status: 'needs-research' })
        return
      }
      const mdx = draftLesson({
        unitTitle: u.title[locale], unitIndex: ui, moduleIndex: mi,
        objective: u.objective[locale], notes, locale,
      })
      const findings = [...validateDraftMdx(mdx), ...lintReadability(mdx)]
      units.push({
        moduleSlug: m.slug, unitSlug: u.slug,
        status: findings.length ? 'needs-polish' : 'ready',
        mdx,
        ...(findings.length ? { findings } : {}),
      })
    })
  })
  return { outlineErrors, units }
}
