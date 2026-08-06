// scripts/module-plan-prompt.ts
// Sovereign-эмиттер Plan-стадии гостевого модуля: печатает промпт фрактальной
// декомпозиции для агента МАСТЕРА (движок не зовёт LLM). Рамка = MANIFEST целевого pack'а.
// Run from web/:  npx --yes tsx scripts/module-plan-prompt.ts <course-pack> "<идея модуля>" [ru|en]
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { buildModulePlanPrompt } from '../lib/authoring/module-plan-prompt'
import type { ManifestRule } from '../lib/authoring/manifest'

const HERE = dirname(fileURLToPath(import.meta.url))
const [packSlug, idea, localeArg] = process.argv.slice(2)
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

if (!packSlug || !idea) {
  console.error('usage: module-plan-prompt.ts <course-pack> "<module idea, one line>" [ru|en]')
  process.exit(1)
}

const packRoot = resolve(HERE, '..', 'packs', packSlug)
if (!existsSync(packRoot)) {
  console.error(`course-pack "${packSlug}" not found at ${packRoot}`)
  process.exit(1)
}

// Целевой pack задаётся аргументом, поэтому @pack-alias (= АКТИВНЫЙ pack) не годится —
// грузим манифест и конфиг целевого pack'а динамически. Без top-level await: tsx
// собирает scripts/ в cjs (в package.json нет "type": "module").
async function main() {
  const { MANIFEST } = await import(pathToFileURL(join(packRoot, 'manifest.ts')).href) as { MANIFEST: ManifestRule[] }
  const { COURSE } = await import(pathToFileURL(join(packRoot, 'course.config.ts')).href) as { COURSE: { name: string } }

  console.log(buildModulePlanPrompt({
    courseName: COURSE.name,
    packSlug,
    idea,
    locale,
    manifestLabels: MANIFEST.map(r => r.label),
  }))
}

main().catch((e) => { console.error(e); process.exit(1) })
