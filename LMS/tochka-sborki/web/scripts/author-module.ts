// scripts/author-module.ts
// Тонкий CLI «module-pack wizard» (Ф2 S1): валидирует outline гостевого модуля и
// скаффолдит его скелет в целевой pack. Pure-часть — lib/authoring/module-scaffold.ts.
// Run from web/:  npx --yes tsx scripts/author-module.ts <course-pack> <outline.json> [--date YYYY-MM-DD]
// No-clobber: если любой целевой файл уже существует — отказ, ничего не пишется.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { validateModuleOutline } from '../lib/authoring/module-outline'
import type { ModuleOutline } from '../lib/authoring/module-outline'
import { scaffoldModule, writeModuleScaffold } from '../lib/authoring/module-scaffold'
import { buildResearchPrompt } from '../lib/authoring/research'

const HERE = dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
const dateIdx = args.indexOf('--date')
const date = dateIdx >= 0 ? args[dateIdx + 1] : new Date().toISOString().slice(0, 10)
const positional = args.filter((_, i) => i !== dateIdx && i !== dateIdx + 1 || dateIdx < 0)
const [packSlug, outlinePath] = positional

if (!packSlug || !outlinePath) {
  console.error('usage: author-module.ts <course-pack> <outline.json> [--date YYYY-MM-DD]')
  process.exit(1)
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error(`--date must be YYYY-MM-DD, got "${date}"`)
  process.exit(1)
}

const packRoot = resolve(HERE, '..', 'packs', packSlug)
const ruRoot = join(packRoot, 'content', 'ru')
if (!existsSync(ruRoot)) {
  console.error(`course-pack "${packSlug}" not found (no ${ruRoot})`)
  process.exit(1)
}

let outline: ModuleOutline
try {
  outline = JSON.parse(readFileSync(outlinePath, 'utf8'))
} catch (e) {
  console.error(`cannot read/parse outline: ${outlinePath}: ${(e as Error).message}`)
  process.exit(1)
}

const existingModuleDirs = readdirSync(ruRoot)
  .filter(name => statSync(join(ruRoot, name)).isDirectory())

const errors = validateModuleOutline(outline, existingModuleDirs)
if (errors.length) {
  console.error('Module outline invalid:')
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}

const files = scaffoldModule(outline, date)
const result = writeModuleScaffold(packRoot, files)
if (result.conflicts.length) {
  console.error('Refusing to clobber existing files (nothing written):')
  for (const c of result.conflicts) console.error('  - ' + c)
  process.exit(1)
}

for (const f of result.written) console.log('wrote packs/' + packSlug + '/' + f)

// Next steps: sovereign research-промпты по юнитам (готовые к вставке в агент мастера —
// scripts/research-prompt.ts знает только SAMPLE_OUTLINE, гостевые модули он не видит).
async function printNextSteps() {
  const { COURSE } = await import(pathToFileURL(join(packRoot, 'course.config.ts')).href) as { COURSE: { name: string } }
  console.log('\n=== NEXT STEPS ===')
  console.log(`1. Research: для каждого юнита ниже — вставь промпт в СВОЙ агент, ответ сохрани в notes/<module>__<unit>.txt`)
  for (const u of outline.units) {
    console.log(`\n--- research prompt: ${outline.slug}/${u.slug} ---`)
    console.log(buildResearchPrompt({
      courseName: COURSE.name,
      moduleTitle: outline.title.ru,
      unitTitle: u.title.ru,
      objective: u.objective.ru,
      locale: 'ru',
    }))
  }
  console.log('\n2. Draft/review: scripts/review-lesson.ts <mdx> прогоняет структуру и читабельность любого файла.')
  console.log(`3. Гварды перед PR: COURSE_PACK=${packSlug} npx vitest run lib/content/manifest-guard.test.ts`)
  console.log('   (manifest-гвард держит рамку манифеста курса по всему контенту и словарю pack\'а)')
}

printNextSteps().catch((e) => { console.error(e); process.exit(1) })
