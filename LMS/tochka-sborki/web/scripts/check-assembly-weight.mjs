// Бюджет веса сквозной картины (спека 2026-10-12-assembly-map, §3): разметка <svg data-am-figure> на странице урока
// ≤ 300 КБ без сжатия (поднято с 200 решением владельца 2026-10-12). postbuild: превышение — код 1. На основном сайте юниты за дверью (AuthGuard/IntakeGuard рендерят
// содержимое только в браузере), картины в HTML нет — тогда громкое «не измерено в HTML», код 0: бюджет при любых дверях
// держит тест рендера картины (components/assembly/assembly-figure.test.tsx).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const BUDGET_BYTES = 300 * 1024

export function figureBytes(html) {
  let max = 0
  let from = 0
  for (;;) {
    const mark = html.indexOf('data-am-figure', from)
    if (mark < 0) return max
    const start = html.lastIndexOf('<svg', mark)
    const end = html.indexOf('</svg>', mark)
    if (start < 0 || end < 0) return max
    max = Math.max(max, Buffer.byteLength(html.slice(start, end + 6), 'utf8'))
    from = end + 6
  }
}

function pagesUnder(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...pagesUnder(p))
    else if (name === 'index.html') out.push(p)
  }
  return out
}

export function checkAssemblyWeight(outDir, budget = BUDGET_BYTES) {
  const pages = pagesUnder(outDir).filter((p) => /[\\/]lessons[\\/]/.test(p))
  let withFigure = 0
  let worst = { page: null, bytes: 0 }
  const over = []
  for (const page of pages) {
    const bytes = figureBytes(readFileSync(page, 'utf8'))
    if (!bytes) continue
    withFigure += 1
    if (bytes > worst.bytes) worst = { page, bytes }
    if (bytes > budget) over.push({ page, bytes })
  }
  return { pages: pages.length, withFigure, worst, over }
}

export function figureExpected(webRoot) {
  const cfg = join(webRoot, 'packs', '_active', 'course.config.ts')
  return existsSync(cfg) && /assemblyMap:\s*true/.test(readFileSync(cfg, 'utf8'))
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const outDir = process.argv[2] ?? 'out'
  const expected = figureExpected(process.cwd())
  const r = checkAssemblyWeight(outDir)
  if (expected && r.withFigure === 0) {
    console.error(`check-assembly-weight: НЕ ИЗМЕРЕНО в HTML — на ${r.pages} страницах уроков картины нет (юниты за дверью рисуются в браузере); бюджет держит тест рендера картины`)
  }
  if (r.over.length) {
    console.error(`check-assembly-weight: FAIL — ${r.over.length} страниц тяжелее ${BUDGET_BYTES / 1024} КБ`)
    for (const o of r.over.slice(0, 20)) console.error(`  ${o.page}: ${(o.bytes / 1024).toFixed(1)} КБ`)
    process.exit(1)
  }
  if (!expected && r.withFigure === 0) {
    console.log('check-assembly-weight: картина у курса выключена — проверять нечего')
  } else if (r.withFigure > 0) {
    console.log(`check-assembly-weight: ${r.withFigure} страниц с картиной, тяжелейшая ${(r.worst.bytes / 1024).toFixed(1)} КБ из ${BUDGET_BYTES / 1024}`)
  }
}
