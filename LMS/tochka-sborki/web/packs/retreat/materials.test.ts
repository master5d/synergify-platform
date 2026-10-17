// CSV-шаблоны открываются двойным щелчком в Excel: без BOM он читает UTF-8 как ANSI, и кириллица идёт кракозябрами.
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(__dirname, '..', '..', 'public', 'retreat-materials')
const CSV = readdirSync(DIR).filter((f) => f.endsWith('.csv'))

describe('retreat materials — CSV с BOM', () => {
  it('шаблоны найдены', () => {
    expect(CSV.length).toBeGreaterThan(0)
  })
  it.each(CSV)('%s начинается с UTF-8 BOM', (name) => {
    const b = readFileSync(join(DIR, name))
    expect([...b.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
  })
})
