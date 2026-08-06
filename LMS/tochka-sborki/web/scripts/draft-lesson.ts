// scripts/draft-lesson.ts
// Print a deterministic MDX lesson draft for a unit, woven from research notes.
// Run from web/:  npx --yes tsx scripts/draft-lesson.ts <module-slug> <unit-slug> [ru|en] [notes-file]
// notes-file: a saved agent reply in the S2 labeled format; omit to use the bundled SAMPLE_NOTES.
import { readFileSync } from 'node:fs'
import { draftLesson, validateDraftMdx, SAMPLE_NOTES } from '../lib/authoring/draft'
import { parseResearchNotes } from '../lib/authoring/research'
import { SAMPLE_OUTLINE } from '../lib/authoring/sample-outline'

const [moduleSlug, unitSlug, localeArg, notesFile] = process.argv.slice(2)
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

if (!moduleSlug || !unitSlug) {
  console.error('usage: draft-lesson.ts <module-slug> <unit-slug> [ru|en] [notes-file]')
  process.exit(1)
}

const moduleIndex = SAMPLE_OUTLINE.modules.findIndex(m => m.slug === moduleSlug)
if (moduleIndex < 0) {
  console.error(`module "${moduleSlug}" not found. available: ${SAMPLE_OUTLINE.modules.map(m => m.slug).join(', ')}`)
  process.exit(1)
}
const mod = SAMPLE_OUTLINE.modules[moduleIndex]
const unitIndex = mod.units.findIndex(u => u.slug === unitSlug)
if (unitIndex < 0) {
  console.error(`unit "${unitSlug}" not found in ${moduleSlug}. available: ${mod.units.map(u => u.slug).join(', ')}`)
  process.exit(1)
}
const unit = mod.units[unitIndex]

let notes = SAMPLE_NOTES
if (notesFile) {
  const parsed = parseResearchNotes(readFileSync(notesFile, 'utf8'))
  if (parsed.errors.length) {
    console.error('notes parse errors:\n' + parsed.errors.join('\n'))
    process.exit(1)
  }
  notes = parsed.notes
}

const mdx = draftLesson({
  unitTitle: unit.title[locale], unitIndex, moduleIndex,
  objective: unit.objective[locale], notes, locale,
})

for (const issue of validateDraftMdx(mdx)) console.error(`# ${issue}`)
console.log(mdx)
