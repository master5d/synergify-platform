#!/usr/bin/env node
// Проверка готовой сборки зеркала (spec «Проверка» п. 2). Использование: node scripts/check-mirror.mjs out /ts-gitbook
// Exit 0 — чисто, 1 — нарушения (печатаются), 2 — неверный вызов.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// Повтор lib/mirror.ts MIRROR_SERVER_ROUTES (.mjs не импортирует TS) — синхрон держит lib/check-mirror.test.ts.
export const SERVER_ROUTES = ['login', 'auth', 'dashboard', 'character', 'dungeon', 'quest-intake',
  'certificate', 'feedback', 'support', 'care', 'alumni', 'admin']

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? htmlFiles(p) : name.endsWith('.html') ? [p] : []
  })
}

export function checkMirror(outDir, basePath) {
  const issues = []
  if (existsSync(join(outDir, 'sitemap.xml'))) issues.push('sitemap.xml: в зеркале публиковаться не должен')
  for (const file of htmlFiles(outDir)) {
    const rel = relative(outDir, file).split(sep).join('/')
    const html = readFileSync(file, 'utf8')
    if (!/<meta name="robots" content="noindex/.test(html)) issues.push(`${rel}: нет noindex`)
    if (/telegram\.org/.test(html)) issues.push(`${rel}: telegram.org (в РФ режут, вешает загрузку)`)
    // 404 и iframe-встройки из public/ (walkthroughs/) — не страницы курса: плашки там нет, noindex проверяется выше.
    const noBanner = rel === '404.html' || rel.startsWith('_not-found') || rel.startsWith('walkthroughs/')
    if (!noBanner && !html.includes('data-mirror-banner')) issues.push(`${rel}: нет плашки зеркала`)
    const first = rel.replace(/^en\//, '').split('/')[0]
    if (SERVER_ROUTES.includes(first) && !html.includes('data-mirror-stub')) {
      issues.push(`${rel}: серверная страница без заглушки`)
    }
    for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
      const url = m[1]
      if (url.startsWith('//')) continue
      if (!url.startsWith(`${basePath}/`) && url !== basePath) issues.push(`${rel}: ссылка без префикса: ${url}`)
    }
  }
  return issues
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [outDir, basePath] = process.argv.slice(2)
  if (!outDir || !basePath) { console.error('usage: check-mirror.mjs <outDir> <basePath>'); process.exit(2) }
  const issues = checkMirror(outDir, basePath)
  if (issues.length) {
    console.error(`check-mirror: ${issues.length} нарушений`)
    for (const i of issues.slice(0, 200)) console.error('  ' + i)
    process.exit(1)
  }
  console.log('check-mirror: чисто')
}
