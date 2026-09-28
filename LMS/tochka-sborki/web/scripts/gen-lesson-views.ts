// Генератор представлений урока (спека docs/superpowers/specs/2026-09-28-lesson-views.md).
// Запуск из web/ (нативный type stripping Node ≥ 23, без tsx):
//   node scripts/gen-lesson-views.ts                     — пересобрать ВСЕ существующие артефакты (починка устаревания)
//   node scripts/gen-lesson-views.ts <pack> <module>     — создать/обновить артефакты всех юнитов модуля (ru+en)
//   … --force                                            — перезаписать и файлы с ручными пунктами
// Сеть и LLM не нужны: извлечение детерминировано. Exit 1 — если что-то не собралось.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type Extract = typeof import('../lib/lesson-views/extract')
// Импорт с расширением .ts нужен Node; tsc его не проверяет (строка), типы берём из type-only import выше.
const ex = (await import(new URL('../lib/lesson-views/extract.ts', import.meta.url).href)) as Extract

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..')
const PACKS = join(WEB, 'packs')
const LOCALES = ['ru', 'en'] as const

const args = process.argv.slice(2)
const force = args.includes('--force')
const [packArg, moduleArg] = args.filter(a => !a.startsWith('--'))

function artifactPath(pack: string, locale: string, module: string, unit: string): string {
  return join(PACKS, pack, 'views', locale, module, `${unit}.json`)
}

function generate(pack: string, locale: 'ru' | 'en', module: string, unit: string): 'written' | 'same' | 'skipped' {
  const contentDir = join(PACKS, pack, 'content', locale, module)
  const meta = JSON.parse(readFileSync(join(contentDir, '_meta.json'), 'utf8'))
  const u = (meta.units as { slug: string; title: string }[]).find(x => x.slug === unit)
  if (!u) throw new Error(`${pack}/${locale}/${module}: юнита ${unit} нет в _meta.json`)
  const mdx = readFileSync(join(contentDir, `${unit}.mdx`), 'utf8')
  const next = ex.buildArtifact({ module, unit, locale, title: u.title, mdx, checks: meta.checks })
  const out = artifactPath(pack, locale, module, unit)
  const json = JSON.stringify(next, null, 2) + '\n'
  if (existsSync(out)) {
    const prev = readFileSync(out, 'utf8')
    if (prev === json) return 'same'
    if (!force && ex.hasManualPoints(JSON.parse(prev))) {
      console.error(`SKIP ${out}: есть ручные пункты — сверь руками или --force`)
      return 'skipped'
    }
  }
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, json, 'utf8')
  return 'written'
}

const jobs: [string, 'ru' | 'en', string, string][] = []
if (packArg && moduleArg) {
  for (const locale of LOCALES) {
    const meta = JSON.parse(readFileSync(join(PACKS, packArg, 'content', locale, moduleArg, '_meta.json'), 'utf8'))
    for (const u of meta.units as { slug: string }[]) jobs.push([packArg, locale, moduleArg, u.slug])
  }
} else if (packArg) {
  console.error('usage: node scripts/gen-lesson-views.ts [<pack> <module>] [--force]')
  process.exit(2)
} else {
  for (const pack of readdirSync(PACKS)) {
    if (pack.startsWith('_')) continue
    for (const locale of LOCALES) {
      const root = join(PACKS, pack, 'views', locale)
      if (!existsSync(root)) continue
      for (const module of readdirSync(root)) {
        for (const f of readdirSync(join(root, module))) {
          if (f.endsWith('.json')) jobs.push([pack, locale, module, f.replace(/\.json$/, '')])
        }
      }
    }
  }
}

let failed = 0
const tally = { written: 0, same: 0, skipped: 0 }
for (const [pack, locale, module, unit] of jobs) {
  try {
    tally[generate(pack, locale, module, unit)]++
  } catch (e) {
    failed++
    console.error(`FAIL ${pack}/${locale}/${module}/${unit}: ${(e as Error).message}`)
  }
}
console.log(`gen-lesson-views: ${jobs.length} юнитов — записано ${tally.written}, без изменений ${tally.same}, пропущено ${tally.skipped}, ошибок ${failed}`)
if (failed || tally.skipped) process.exit(1)
