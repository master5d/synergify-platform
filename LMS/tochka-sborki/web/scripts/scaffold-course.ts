// scripts/scaffold-course.ts
// Thin writer CLI: validate + de-hustle-lint an outline, then write the scaffold
// skeleton to a target root. Run from web/:  npx --yes tsx scripts/scaffold-course.ts [root] [--outline outline.json]
// Default root: ../../_template (i.e. LMS/_template), relative to web/.
// --outline: any CourseOutline JSON (see lib/authoring/outline.ts); omit for the bundled SAMPLE_OUTLINE.
// No-clobber (writeModuleScaffold pattern): if ANY target file exists — refuse, write nothing.
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scaffoldCourse } from '../lib/authoring/scaffold'
import { validateOutline } from '../lib/authoring/outline'
import type { CourseOutline } from '../lib/authoring/outline'
import { lintOutlineDehustle } from '../lib/authoring/dehustle'
import { extractOutlineOption, loadOutline } from '../lib/authoring/outline-io'
import { writeModuleScaffold } from '../lib/authoring/module-scaffold'
import { SAMPLE_OUTLINE } from '../lib/authoring/sample-outline'

const HERE = dirname(fileURLToPath(import.meta.url))

let outlinePath: string | undefined
let rest: string[] = []
try {
  ({ outlinePath, rest } = extractOutlineOption(process.argv.slice(2)))
} catch (e) {
  console.error((e as Error).message)
  process.exit(1)
}

const root = resolve(HERE, '..', rest[0] ?? '../../_template')

let outline: CourseOutline = SAMPLE_OUTLINE
if (outlinePath) {
  try {
    outline = loadOutline(outlinePath)
  } catch (e) {
    console.error((e as Error).message)
    process.exit(1)
  }
}

const errors = validateOutline(outline)
if (errors.length) { console.error('Outline invalid:\n' + errors.join('\n')); process.exit(1) }

const banned = lintOutlineDehustle(outline)
if (banned.length) { console.error('De-hustle lint failed: ' + banned.join(', ')); process.exit(1) }

const result = writeModuleScaffold(root, scaffoldCourse(outline))
if (result.conflicts.length) {
  console.error('Refusing to clobber existing files (nothing written):')
  for (const c of result.conflicts) console.error('  - ' + c)
  process.exit(1)
}
for (const f of result.written) console.log('wrote ' + resolve(root, f))
