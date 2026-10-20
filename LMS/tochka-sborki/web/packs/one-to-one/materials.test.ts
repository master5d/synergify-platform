// CSV-шаблоны открываются двойным щелчком в Excel: без BOM он читает UTF-8 как ANSI, и кириллица идёт кракозябрами.
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(__dirname, '..', '..', 'public', 'one-to-one-materials')
const CSV = readdirSync(DIR).filter((f) => f.endsWith('.csv'))

describe('one-to-one materials — CSV с BOM', () => {
  it('шаблоны найдены', () => {
    expect(CSV.length).toBeGreaterThan(0)
  })
  it.each(CSV)('%s начинается с UTF-8 BOM', (name) => {
    const b = readFileSync(join(DIR, name))
    expect([...b.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
  })
})

describe('one-to-one materials — пять шаблонов на язык, CSV без формул', () => {
  it('в каждой группе шаблонов ровно пять файлов, и все они лежат в public/', async () => {
    const { COURSE_MATERIALS } = await import('./materials')
    const groups = COURSE_MATERIALS.filter((g) => g.items.every((i) => i.kind === 'template'))
    expect(groups).toHaveLength(2)
    for (const g of groups) {
      expect(g.items).toHaveLength(5)
      for (const i of g.items) readFileSync(join(__dirname, '..', '..', 'public', i.href))
    }
  })
  it.each(CSV)('%s: ни одна ячейка не начинается с =', (name) => {
    const text = readFileSync(join(DIR, name), 'utf8')
    expect(text.split(/\r?\n/).flatMap((l) => l.split(',')).filter((c) => c.trim().startsWith('='))).toEqual([])
  })
})
