// scripts/scaffold-course.ts
// Thin writer CLI: validate + de-hustle-lint the sample outline, then write the scaffold
// skeleton to a target root. Run from web/:  npx --yes tsx scripts/scaffold-course.ts [root]
// Default root: ../../_template (i.e. LMS/_template), relative to web/.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scaffoldCourse } from '../lib/authoring/scaffold'
import { validateOutline } from '../lib/authoring/outline'
import { lintOutlineDehustle } from '../lib/authoring/dehustle'
import { SAMPLE_OUTLINE } from '../lib/authoring/sample-outline'

const HERE = dirname(fileURLToPath(import.meta.url))
const root = resolve(HERE, '..', process.argv[2] ?? '../../_template')

const errors = validateOutline(SAMPLE_OUTLINE)
if (errors.length) { console.error('Outline invalid:\n' + errors.join('\n')); process.exit(1) }

const banned = lintOutlineDehustle(SAMPLE_OUTLINE)
if (banned.length) { console.error('De-hustle lint failed: ' + banned.join(', ')); process.exit(1) }

for (const f of scaffoldCourse(SAMPLE_OUTLINE)) {
  const dest = join(root, f.path)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, f.content, 'utf8')
  console.log('wrote ' + dest)
}
