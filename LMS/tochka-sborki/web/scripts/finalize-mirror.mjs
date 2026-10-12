#!/usr/bin/env node
// Постобработка экспорта зеркала (COURSE_MIRROR=1); без флага — no-op, основная сборка не меняется.
// 1) sitemap.xml: app/sitemap.ts в зеркале отдаёт пустой список, но Next всё равно пишет файл — удаляем.
// 2) Статичные документы из public/ (walkthroughs/*.html — iframe-встройки) не проходят через layout,
//    поэтому не несут noindex — проставляем здесь.
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

if (process.env.COURSE_MIRROR !== '1') process.exit(0)

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'out')
if (!existsSync(OUT)) { console.error('finalize-mirror: out/ не найден — сначала next build'); process.exit(1) }

const sitemap = join(OUT, 'sitemap.xml')
if (existsSync(sitemap)) rmSync(sitemap)

const NOINDEX = '<meta name="robots" content="noindex, nofollow"/>'
const dir = join(OUT, 'walkthroughs')
let patched = 0
if (existsSync(dir) && statSync(dir).isDirectory()) {
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.html')) continue
    const p = join(dir, name)
    const html = readFileSync(p, 'utf8')
    if (/<meta name="robots" content="noindex/.test(html)) continue
    writeFileSync(p, html.replace(/<head[^>]*>/i, (m) => `${m}\n${NOINDEX}`))
    patched++
  }
}
console.log(`finalize-mirror: sitemap.xml убран, noindex проставлен в ${patched} walkthrough-документах`)
