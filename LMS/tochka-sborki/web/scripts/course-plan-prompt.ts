// scripts/course-plan-prompt.ts
// Sovereign-эмиттер Plan-стадии НОВОГО КУРСА (Ф3): печатает промпт фрактальной
// декомпозиции для агента ВЛАДЕЛЬЦА (движок не зовёт LLM). Рамка тона = CORE_MANIFEST.
// Run from web/:  npx --yes tsx scripts/course-plan-prompt.ts "<идея курса в одну строку>" [ru|en] [--domain <url>]
import { buildCoursePlanPrompt } from '../lib/authoring/course-plan-prompt'
import { CORE_MANIFEST } from '../lib/authoring/manifest'

const args = process.argv.slice(2)
const domainIdx = args.indexOf('--domain')
let domain: string | undefined
if (domainIdx >= 0) {
  domain = args[domainIdx + 1]
  if (!domain || domain.startsWith('--')) {
    console.error('--domain requires a <url> argument')
    process.exit(1)
  }
  args.splice(domainIdx, 2)
}

const [idea, localeArg] = args
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

if (!idea) {
  console.error('usage: course-plan-prompt.ts "<course idea, one line>" [ru|en] [--domain <url>]')
  process.exit(1)
}

console.log(buildCoursePlanPrompt({
  idea,
  locale,
  domain,
  manifestLabels: CORE_MANIFEST.map(r => r.label),
}))
