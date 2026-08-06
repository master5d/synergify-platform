// scripts/research-prompt.ts
// Print a per-lesson research prompt for the author to paste into their own agent.
// Run from web/:  npx --yes tsx scripts/research-prompt.ts <module-slug> <unit-slug> [ru|en]
import { buildResearchPrompt } from '../lib/authoring/research'
import { SAMPLE_OUTLINE } from '../lib/authoring/sample-outline'

const [moduleSlug, unitSlug, localeArg] = process.argv.slice(2)
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

if (!moduleSlug || !unitSlug) {
  console.error('usage: research-prompt.ts <module-slug> <unit-slug> [ru|en]')
  process.exit(1)
}

const mod = SAMPLE_OUTLINE.modules.find(m => m.slug === moduleSlug)
if (!mod) {
  console.error(`module "${moduleSlug}" not found. available: ${SAMPLE_OUTLINE.modules.map(m => m.slug).join(', ')}`)
  process.exit(1)
}
const unit = mod.units.find(u => u.slug === unitSlug)
if (!unit) {
  console.error(`unit "${unitSlug}" not found in ${moduleSlug}. available: ${mod.units.map(u => u.slug).join(', ')}`)
  process.exit(1)
}

console.log(buildResearchPrompt({
  courseName: SAMPLE_OUTLINE.name[locale],
  moduleTitle: mod.title[locale],
  unitTitle: unit.title[locale],
  objective: unit.objective[locale],
  locale,
}))
