// Boundary-гвард движок ↔ course-pack (Ф1 S1).
// Держит будущее расщепление дешёвым: сцепки ловятся здесь, а не при разрезе.
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const PACK = join(ROOT, 'packs', 'tochka-sborki')

/** Единственные легитимные входы движка в pack до @pack-alias (S4). */
const STUB_WHITELIST = new Set([
  'lib/course.ts',
  'lib/dictionaries.ts',
  'lib/materials.ts',
])

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === 'out') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

const rel = (p: string) => relative(ROOT, p).replaceAll('\\', '/')

describe('engine ↔ pack boundary', () => {
  it('pack contract files exist', () => {
    for (const f of ['course.config.ts', 'dictionaries.ts', 'materials.ts', 'README.md']) {
      expect(existsSync(join(PACK, f)), f).toBe(true)
    }
  })

  it('engine imports packs/ only through whitelisted stubs', () => {
    const engineFiles = ['lib', 'components', 'app'].flatMap((d) => walk(join(ROOT, d)))
    const offenders: string[] = []
    for (const f of engineFiles) {
      const r = rel(f)
      if (STUB_WHITELIST.has(r)) continue
      const src = readFileSync(f, 'utf8')
      if (/from\s+['"][^'"]*packs\//.test(src) || /import\(\s*[`'"][^`'"]*packs\//.test(src)) {
        offenders.push(r)
      }
    }
    expect(offenders, `packs/ импортится мимо стабов: ${offenders.join(', ')}`).toEqual([])
  })

  it('pack does not import engine components/ or app/', () => {
    const offenders: string[] = []
    for (const f of walk(PACK)) {
      const src = readFileSync(f, 'utf8')
      if (/from\s+['"][^'"]*(components|app)\//.test(src)) offenders.push(rel(f))
    }
    expect(offenders, `pack тянет UI движка: ${offenders.join(', ')}`).toEqual([])
  })

  it('stubs are thin re-exports (no logic creep)', () => {
    for (const stub of STUB_WHITELIST) {
      const lines = readFileSync(join(ROOT, stub), 'utf8')
        .split('\n')
        .filter((l) => l.trim() && !l.trim().startsWith('//'))
      expect(lines, `${stub} должен остаться тонким re-export`).toHaveLength(1)
      expect(lines[0]).toMatch(/^export \* from/)
    }
  })
})
