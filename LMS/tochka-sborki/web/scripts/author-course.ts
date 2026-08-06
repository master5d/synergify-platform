// scripts/author-course.ts
// Dry-run authoring dashboard: for each unit of SAMPLE_OUTLINE, report needs-research / ready /
// needs-polish + the next step. Reads research notes from <notes-dir>/<module>__<unit>.txt.
// Writes nothing. Run from web/:  npx --yes tsx scripts/author-course.ts [notes-dir] [ru|en]
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runAuthoringPass } from '../lib/authoring/orchestrate'
import { parseResearchNotes } from '../lib/authoring/research'
import type { ResearchNotes } from '../lib/authoring/research'
import { SAMPLE_OUTLINE } from '../lib/authoring/sample-outline'

const [notesDir, localeArg] = process.argv.slice(2)
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

const notesByUnit: Record<string, ResearchNotes> = {}
if (notesDir) {
  for (const m of SAMPLE_OUTLINE.modules) {
    for (const u of m.units) {
      const file = join(notesDir, `${m.slug}__${u.slug}.txt`)
      if (!existsSync(file)) continue
      const parsed = parseResearchNotes(readFileSync(file, 'utf8'))
      if (parsed.errors.length) {
        console.error(`# ${m.slug}/${u.slug}: notes parse errors: ${parsed.errors.join('; ')}`)
        continue
      }
      notesByUnit[`${m.slug}/${u.slug}`] = parsed.notes
    }
  }
}

const report = runAuthoringPass(SAMPLE_OUTLINE, notesByUnit, locale)

if (report.outlineErrors.length) {
  for (const e of report.outlineErrors) console.log(`# outline: ${e}`)
} else {
  console.log('outline: OK')
}

const tally: Record<string, number> = { ready: 0, 'needs-research': 0, 'needs-polish': 0 }
for (const u of report.units) {
  tally[u.status]++
  let hint = ''
  if (u.status === 'needs-research') hint = `  → research-prompt ${u.moduleSlug} ${u.unitSlug}`
  else if (u.status === 'needs-polish') hint = `  → review-lesson <draft>  [${(u.findings ?? []).join('; ')}]`
  console.log(`[${u.status}] ${u.moduleSlug}/${u.unitSlug}${hint}`)
}
console.log(`summary: ${tally.ready} ready, ${tally['needs-research']} needs-research, ${tally['needs-polish']} needs-polish`)
