// lib/authoring/scaffold.ts
// Pure emitter: maps a (valid) outline to the file skeleton the AI stages fill in.
// No I/O — the caller writes the returned files to a chosen root.
import type { CourseOutline, ModuleOutline, UnitOutline } from './outline'

export interface ScaffoldFile { path: string; content: string }

const LOCALES = ['ru', 'en'] as const

function metaJson(moduleIndex: number, m: ModuleOutline, locale: 'ru' | 'en'): string {
  const meta = {
    module: moduleIndex + 1,
    title: m.title[locale],
    description: m.description[locale],
    duration: 'TODO',
    level: m.level,
    units: m.units.map(u => ({ slug: u.slug, title: u.title[locale] })),
  }
  return JSON.stringify(meta, null, 2) + '\n'
}

function unitMdx(moduleIndex: number, unitIndex: number, u: UnitOutline, locale: 'ru' | 'en'): string {
  return `---
title: "${u.title[locale]}"
unit: ${unitIndex + 1}
module: ${moduleIndex + 1}
duration: "TODO"
---

{/* objective: ${u.objective[locale]} */}

<Phase type="activation">

TODO: a bisociative mental hook — collide the learner's familiar frame with a foreign one. Mental only.

</Phase>

<Phase type="reflection">

TODO: a second, different frame on the same idea. Mental, bisociative.

</Phase>

<Phase type="concept">

TODO: the core idea, plainly. Short sentences.

</Phase>

<Phase type="practice">

TODO: one concrete applied step the learner does for real.

</Phase>
`
}

export function scaffoldCourse(o: CourseOutline): ScaffoldFile[] {
  const files: ScaffoldFile[] = []
  o.modules.forEach((m, mi) => {
    for (const locale of LOCALES) {
      files.push({ path: `content/${locale}/${m.slug}/_meta.json`, content: metaJson(mi, m, locale) })
      m.units.forEach((u, ui) => {
        files.push({ path: `content/${locale}/${m.slug}/${u.slug}.mdx`, content: unitMdx(mi, ui, u, locale) })
      })
    }
  })
  return files
}
