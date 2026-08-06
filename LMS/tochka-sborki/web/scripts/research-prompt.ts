// scripts/research-prompt.ts
// Print a per-lesson research prompt for the author to paste into their own agent.
// Run from web/:  npx --yes tsx scripts/research-prompt.ts <module-slug> <unit-slug> [ru|en] [--outline outline.json]
// --outline: any CourseOutline JSON (see lib/authoring/outline.ts); omit for the bundled SAMPLE_OUTLINE.
import { buildResearchPrompt } from '../lib/authoring/research'
import { extractOutlineOption, loadOutline } from '../lib/authoring/outline-io'
import { SAMPLE_OUTLINE } from '../lib/authoring/sample-outline'
import type { CourseOutline } from '../lib/authoring/outline'

let outlinePath: string | undefined
let rest: string[] = []
try {
  ({ outlinePath, rest } = extractOutlineOption(process.argv.slice(2)))
} catch (e) {
  console.error((e as Error).message)
  process.exit(1)
}

const [moduleSlug, unitSlug, localeArg] = rest
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

if (!moduleSlug || !unitSlug) {
  console.error('usage: research-prompt.ts <module-slug> <unit-slug> [ru|en] [--outline outline.json]')
  process.exit(1)
}

let outline: CourseOutline = SAMPLE_OUTLINE
if (outlinePath) {
  try {
    outline = loadOutline(outlinePath)
  } catch (e) {
    console.error((e as Error).message)
    process.exit(1)
  }
}

const mod = outline.modules.find(m => m.slug === moduleSlug)
if (!mod) {
  console.error(`module "${moduleSlug}" not found. available: ${outline.modules.map(m => m.slug).join(', ')}`)
  process.exit(1)
}
const unit = mod.units.find(u => u.slug === unitSlug)
if (!unit) {
  console.error(`unit "${unitSlug}" not found in ${moduleSlug}. available: ${mod.units.map(u => u.slug).join(', ')}`)
  process.exit(1)
}

console.log(buildResearchPrompt({
  courseName: outline.name[locale],
  moduleTitle: mod.title[locale],
  unitTitle: unit.title[locale],
  objective: unit.objective[locale],
  locale,
}))
