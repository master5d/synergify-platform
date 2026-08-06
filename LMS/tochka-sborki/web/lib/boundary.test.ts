// Boundary-гвард движок ↔ course-pack (Ф1 S1, ужесточён в S4 — эпоха @pack-alias).
// Держит будущее расщепление дешёвым: сцепки ловятся здесь, а не при разрезе.
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { PACK_DIR } from './pack'

const ROOT = process.cwd()

/** Стабы-переходники (наследие S1-S2): старый путь → @pack. Только re-export. */
const STUBS = [
  'lib/course.ts',
  'lib/dictionaries.ts',
  'lib/materials.ts',
  'lib/rpg/skins-meta.ts',
  ...['ai-doubles', 'certificate', 'dungeon-flavor', 'ecosystem', 'intake-questions',
      'niche-map', 'notebook-pack', 'office-hours', 'showcase', 'skins', 'try-chains']
    .map((n) => `lib/course/${n}.ts`),
]

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
    for (const f of ['course.config.ts', 'dictionaries.ts', 'materials.ts', 'skins-meta.ts',
                     'README.md', 'content', 'skins', 'course']) {
      expect(existsSync(join(PACK_DIR, f)), f).toBe(true)
    }
  })

  it('no literal packs/ imports anywhere — only the @pack alias', () => {
    const files = [...['lib', 'components', 'app'].flatMap((d) => walk(join(ROOT, d))), ...walk(PACK_DIR)]
    const offenders: string[] = []
    for (const f of files) {
      const src = readFileSync(f, 'utf8')
      if (/from\s+['"][^'"]*packs\//.test(src) || /import\(\s*[`'"][^`'"]*packs\//.test(src)) {
        offenders.push(rel(f))
      }
    }
    expect(offenders, `литеральный путь в packs/ вместо @pack: ${offenders.join(', ')}`).toEqual([])
  })

  it('pack does not import engine UI (components/, app/) and does not self-alias @pack', () => {
    const offenders: string[] = []
    for (const f of walk(PACK_DIR)) {
      const src = readFileSync(f, 'utf8')
      if (/from\s+['"][^'"]*(components|app)\//.test(src)) offenders.push(`${rel(f)} → UI`)
      if (/from\s+['"]@pack\//.test(src)) offenders.push(`${rel(f)} → @pack self`)
    }
    expect(offenders, offenders.join(', ')).toEqual([])
  })

  it('stubs are thin @pack re-exports (no logic creep)', () => {
    for (const stub of STUBS) {
      const lines = readFileSync(join(ROOT, stub), 'utf8')
        .split('\n')
        .filter((l) => l.trim() && !l.trim().startsWith('//'))
      expect(lines, `${stub} должен остаться тонким re-export`).toHaveLength(1)
      expect(lines[0], stub).toMatch(/^export \* from '@pack\//)
    }
  })
})
