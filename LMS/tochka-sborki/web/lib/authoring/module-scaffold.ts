// lib/authoring/module-scaffold.ts
// Pure-эмиттер скелета ОДНОГО гостевого модуля (Ф2 S1) + no-clobber writer.
// scaffoldModule — чистая функция (тестируется без fs); writeModuleScaffold —
// единственное место с I/O, отказывается писать поверх существующих файлов.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { ModuleOutline, ModuleUnitOutline } from './module-outline'
import type { ScaffoldFile } from './scaffold'
import type { ModuleStamp } from './module-stamp'

const LOCALES = ['ru', 'en'] as const
type Locale = (typeof LOCALES)[number]

const MIN_PER_UNIT = 10

function moduleNumber(slug: string): number {
  return parseInt(slug.slice(0, 2), 10)
}

function duration(units: number, locale: Locale): string {
  return `~${units * MIN_PER_UNIT} ${locale === 'ru' ? 'мин' : 'min'}`
}

function metaJson(o: ModuleOutline, locale: Locale): string {
  const meta = {
    module: moduleNumber(o.slug),
    title: o.title[locale],
    description: o.description[locale],
    duration: duration(o.units.length, locale),
    level: 0,
    units: o.units.map(u => ({ slug: u.slug, title: u.title[locale] })),
  }
  return JSON.stringify(meta, null, 2) + '\n'
}

function unitMdx(o: ModuleOutline, unitIndex: number, u: ModuleUnitOutline, locale: Locale): string {
  return `---
title: "${u.title[locale]}"
unit: ${unitIndex + 1}
module: ${moduleNumber(o.slug)}
duration: "~${MIN_PER_UNIT} ${locale === 'ru' ? 'мин' : 'min'}"
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

function stampJson(o: ModuleOutline, date: string): string {
  const stamp: ModuleStamp = {
    slug: o.slug,
    author: o.author.contact !== undefined
      ? { name: o.author.name, contact: o.author.contact }
      : { name: o.author.name },
    created: date,
    manifest_ack: true,
  }
  return JSON.stringify(stamp, null, 2) + '\n'
}

/** Pure: (валидный) module-outline → файлы скелета с путями от корня pack'а.
 *  _module.json — только в RU-канон каталоге. */
export function scaffoldModule(o: ModuleOutline, date: string): ScaffoldFile[] {
  const files: ScaffoldFile[] = []
  for (const locale of LOCALES) {
    const dir = `content/${locale}/${o.slug}`
    files.push({ path: `${dir}/_meta.json`, content: metaJson(o, locale) })
    o.units.forEach((u, ui) => {
      files.push({ path: `${dir}/${u.slug}.mdx`, content: unitMdx(o, ui, u, locale) })
    })
  }
  files.push({ path: `content/ru/${o.slug}/_module.json`, content: stampJson(o, date) })
  return files
}

export interface WriteModuleResult { written: string[]; conflicts: string[] }

/** No-clobber: если ЛЮБОЙ целевой файл уже существует — не пишет НИЧЕГО. */
export function writeModuleScaffold(packRoot: string, files: ScaffoldFile[]): WriteModuleResult {
  const conflicts = files.filter(f => existsSync(join(packRoot, f.path))).map(f => f.path)
  if (conflicts.length) return { written: [], conflicts }
  const written: string[] = []
  for (const f of files) {
    const dest = join(packRoot, f.path)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, f.content, 'utf8')
    written.push(f.path)
  }
  return { written, conflicts: [] }
}
