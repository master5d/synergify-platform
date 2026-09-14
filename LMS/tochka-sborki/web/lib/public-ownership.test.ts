// Гвард владения web/public/ (intake LMS#16): у каждого файла ровно один владелец — движок
// (scripts/public-shared.json) или один course-pack (packs/<pack>/public-owned.json).
// Без владельца файл молча уезжал бы в сборку любого курса (как установщики и видео витрины
// Точки Сборки в сборку «Тишины»); с двумя владельцами scripts/prune-public.mjs вёл бы себя
// в зависимости от порядка. Читается по файловой системе — никаких импортов из packs/.
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const PUBLIC = join(ROOT, 'public')
const PACKS = join(ROOT, 'packs')

function listFiles(dir: string, base = ''): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const rel = base ? `${base}/${name}` : name
    if (statSync(p).isDirectory()) out.push(...listFiles(p, rel))
    else out.push(rel)
  }
  return out
}

const matches = (rel: string, list: string[]) => list.some((e) => (e.endsWith('/') ? rel.startsWith(e) : rel === e))
const readList = (p: string): string[] => JSON.parse(readFileSync(p, 'utf8')).files

// Реальные pack'и: каталоги без служебного префикса «_» (packs/_active — симлинк на активный).
const PACK_NAMES = readdirSync(PACKS).filter((n) => !n.startsWith('_') && statSync(join(PACKS, n)).isDirectory())

describe('public/ ownership', () => {
  it('every pack declares its public files', () => {
    for (const p of PACK_NAMES) expect(existsSync(join(PACKS, p, 'public-owned.json')), p).toBe(true)
  })

  it('every file in public/ has exactly one owner: the engine or one pack', () => {
    const shared = readList(join(ROOT, 'scripts', 'public-shared.json'))
    const owned = Object.fromEntries(PACK_NAMES.map((p) => [p, readList(join(PACKS, p, 'public-owned.json'))]))
    const problems: string[] = []
    for (const f of listFiles(PUBLIC)) {
      const owners = [...(matches(f, shared) ? ['engine'] : []), ...PACK_NAMES.filter((p) => matches(f, owned[p]))]
      if (owners.length !== 1) problems.push(`${f}: ${owners.join(' + ') || 'нет владельца'}`)
    }
    expect(problems, problems.join('\n')).toEqual([])
  })

  it('every declared entry points at something that exists', () => {
    const files = listFiles(PUBLIC)
    const stale: string[] = []
    const lists: [string, string[]][] = [
      ['engine', readList(join(ROOT, 'scripts', 'public-shared.json'))],
      ...PACK_NAMES.map((p): [string, string[]] => [p, readList(join(PACKS, p, 'public-owned.json'))]),
    ]
    for (const [who, list] of lists) {
      for (const e of list) if (!files.some((f) => matches(f, [e]))) stale.push(`${who}: ${e}`)
    }
    expect(stale, stale.join('\n')).toEqual([])
  })
})
