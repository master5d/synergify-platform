#!/usr/bin/env node
// Материализует активный course-pack по стабильному пути packs/_active.
//
// Зачем: подпути `@pack/...` резолвятся через tsconfig `paths`, а он статичен —
// ни turbopack.resolveAlias, ни webpack-алиас его для подпутей не перебивают.
// Из-за этого переключатель COURSE_PACK молча работал только для контента
// (он читается по файловой системе), а словари/конфиг/данные всегда приезжали
// от дефолтного pack'а. Один путь = один механизм для tsc, обоих бандлеров и vitest.
//
// Использование: node scripts/select-pack.mjs [slug]   (иначе COURSE_PACK, иначе дефолт)
import { existsSync, rmSync, symlinkSync, cpSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..')
const PACKS = join(WEB, 'packs')
const ACTIVE = join(PACKS, '_active')
const DEFAULT_PACK = 'tochka-sborki'

const slug = process.argv[2] || process.env.COURSE_PACK || DEFAULT_PACK
const src = join(PACKS, slug)

if (!existsSync(src)) {
  console.error(`select-pack: неизвестный pack "${slug}" — нет каталога ${src}`)
  process.exit(1)
}

if (existsSync(ACTIVE)) rmSync(ACTIVE, { recursive: true, force: true })

// Симлинк/junction мгновенен и не плодит копий; если ОС не даёт — честно копируем.
let mode = 'symlink'
try {
  symlinkSync(src, ACTIVE, process.platform === 'win32' ? 'junction' : 'dir')
} catch {
  mode = 'copy'
  cpSync(src, ACTIVE, { recursive: true })
}

if (!existsSync(join(ACTIVE, 'course.config.ts'))) {
  console.error('select-pack: активный pack собрался без course.config.ts')
  process.exit(1)
}

console.log(`select-pack: ${slug} → packs/_active (${mode}${statSync(ACTIVE).isDirectory() ? '' : ', не каталог!'})`)
