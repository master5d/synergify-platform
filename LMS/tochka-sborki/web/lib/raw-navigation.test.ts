// Гвард сырой навигации на корень (intake LMS#16). basePath курса в подпути (/praktika) переписывает
// только next/link, router и импортированные ассеты. `window.location.*('/…')`, `location.href = '/…'`
// и `<a href="/…">` уходят на корень домена школы: так все 18 уроков «Тишины» вели на несуществующий
// /login/ (404). Внутренняя навигация — через next/link / router или помощники pagePath / assetPath
// из lib/base-path. Внешние ссылки (`//`, `https://`) и `/api/*` (API всегда в корне) — не про это.
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === 'out') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p)
  }
  return out
}

// Литерал пути от корня, но не протокол-относительный (`//`) и не API.
const ROOT_LITERAL = String.raw`[\x60'"]/(?!/|api/)`
const PATTERNS = [
  new RegExp(String.raw`location\.(?:replace|assign)\(\s*` + ROOT_LITERAL),
  new RegExp(String.raw`location\.href\s*=\s*` + ROOT_LITERAL),
  new RegExp(String.raw`<a\s[^>]*href=\{?\s*` + ROOT_LITERAL),
]

describe('no raw root navigation (basePath-unsafe)', () => {
  it('components/, app/, lib/ navigate via next/link, router or pagePath', () => {
    const offenders: string[] = []
    for (const f of ['components', 'app', 'lib'].flatMap((d) => walk(join(ROOT, d)))) {
      const lines = readFileSync(f, 'utf8').split('\n')
      lines.forEach((line, i) => {
        if (PATTERNS.some((re) => re.test(line))) offenders.push(`${relative(ROOT, f).replaceAll('\\', '/')}:${i + 1}`)
      })
    }
    expect(offenders, `сырая навигация на корень (нужен pagePath / next/link):\n${offenders.join('\n')}`).toEqual([])
  })
})
