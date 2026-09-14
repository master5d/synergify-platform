#!/usr/bin/env node
// Убирает из out/ файлы public/, которые принадлежат ДРУГОМУ course-pack'у (intake LMS#16).
// Next копирует весь public/ в экспорт любого pack'а: без этого шага сборка «Тишины» везла
// установщики, субтитры, видео витрины и материалы Точки Сборки. Владение объявлено в
// scripts/public-shared.json (движок) и packs/<pack>/public-owned.json (курс); гвард
// lib/public-ownership.test.ts требует у каждого файла ровно одного владельца.
// Файлы остаются в web/public/ — меняется только экспорт; dev-сервер видит всё, как раньше.
import { readFileSync, readdirSync, statSync, existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..')
const slug = process.argv[2] || process.env.COURSE_PACK || 'tochka-sborki' // тот же выбор, что в select-pack.mjs
const OUT = join(WEB, 'out')
const PUBLIC = join(WEB, 'public')

const readList = (p) => JSON.parse(readFileSync(p, 'utf8')).files
const matches = (rel, list) => list.some((e) => (e.endsWith('/') ? rel.startsWith(e) : rel === e))

function listFiles(dir, base = '') {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const rel = base ? `${base}/${name}` : name
    if (statSync(p).isDirectory()) out.push(...listFiles(p, rel))
    else out.push(rel)
  }
  return out
}

const ownedPath = join(WEB, 'packs', slug, 'public-owned.json')
if (!existsSync(ownedPath)) {
  console.error(`prune-public: у pack'а "${slug}" нет public-owned.json — объяви его публичные файлы`)
  process.exit(1)
}
if (!existsSync(OUT)) {
  console.error('prune-public: out/ не найден — сначала next build')
  process.exit(1)
}

const shared = readList(join(WEB, 'scripts', 'public-shared.json'))
const owned = readList(ownedPath)
const files = listFiles(PUBLIC)

let removed = 0
for (const rel of files) {
  if (matches(rel, shared) || matches(rel, owned)) continue
  const target = join(OUT, rel)
  if (existsSync(target)) {
    rmSync(target, { force: true })
    removed++
  }
}

// Опустевшие каталоги чужих ассетов (captions/, showcase/ …) — тоже убрать.
for (const top of new Set(files.filter((r) => r.includes('/')).map((r) => r.split('/')[0]))) {
  const d = join(OUT, top)
  if (existsSync(d) && statSync(d).isDirectory() && readdirSync(d).length === 0) rmSync(d, { recursive: true, force: true })
}

console.log(`prune-public: ${slug} — убрано чужих файлов из out/: ${removed}`)
