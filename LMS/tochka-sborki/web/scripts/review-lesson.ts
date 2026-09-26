// scripts/review-lesson.ts
// Review a lesson-draft MDX file: run structural (validateDraftMdx) + readability
// (lintReadability) + pedagogy (lintPhaseOrder) checks, print findings to stderr, and print
// a polish prompt to stdout for the author's agent.
// Run from web/:  npx --yes tsx scripts/review-lesson.ts <mdx-file> [ru|en]
import { readFileSync } from 'node:fs'
import { validateDraftMdx } from '../lib/authoring/draft'
import { lintReadability, lintPhaseOrder, buildPolishPrompt } from '../lib/authoring/review'

const [mdxFile, localeArg] = process.argv.slice(2)
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

if (!mdxFile) {
  console.error('usage: review-lesson.ts <mdx-file> [ru|en]')
  process.exit(1)
}

let mdx: string
try {
  mdx = readFileSync(mdxFile, 'utf8')
} catch {
  console.error(`cannot read file: ${mdxFile}`)
  process.exit(1)
}

const findings = [...validateDraftMdx(mdx), ...lintReadability(mdx), ...lintPhaseOrder(mdx)]
for (const issue of findings) console.error(`# ${issue}`)
console.log(buildPolishPrompt(mdx, findings, locale))
