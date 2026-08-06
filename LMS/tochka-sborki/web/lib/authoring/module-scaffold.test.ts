import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { scaffoldModule, writeModuleScaffold } from './module-scaffold'
import { validateStamp } from './module-stamp'
import type { ModuleOutline } from './module-outline'

const outline: ModuleOutline = {
  slug: '02-astrologia-vnutrennego-neba',
  author: { name: 'Наташа' },
  title: { ru: 'Астрология внутреннего неба', en: 'Astrology of the Inner Sky' },
  description: { ru: 'Символический язык', en: 'Symbolic language' },
  units: [
    { slug: 'u1-karta', title: { ru: 'Карта', en: 'The Chart' }, objective: { ru: 'Понять карту', en: 'Grasp the chart' } },
    { slug: 'u2-yazyk', title: { ru: 'Язык', en: 'The Language' }, objective: { ru: 'Освоить язык', en: 'Learn the language' } },
    { slug: 'u3-ritm', title: { ru: 'Ритм', en: 'The Rhythm' }, objective: { ru: 'Найти ритм', en: 'Find the rhythm' } },
  ],
}

describe('scaffoldModule (pure)', () => {
  const files = scaffoldModule(outline, '2026-08-06')

  it('emits _meta.json + unit stubs for both locales + a single RU _module.json', () => {
    const paths = files.map(f => f.path)
    for (const locale of ['ru', 'en']) {
      expect(paths).toContain(`content/${locale}/02-astrologia-vnutrennego-neba/_meta.json`)
      for (const u of ['u1-karta', 'u2-yazyk', 'u3-ritm']) {
        expect(paths).toContain(`content/${locale}/02-astrologia-vnutrennego-neba/${u}.mdx`)
      }
    }
    expect(paths.filter(p => p.endsWith('_module.json'))).toEqual(
      ['content/ru/02-astrologia-vnutrennego-neba/_module.json'])
    expect(files).toHaveLength(2 * 4 + 1)
  })

  it('_meta.json follows the reference shape: numeric module, level 0, ~10 min per unit', () => {
    const meta = JSON.parse(files.find(f => f.path === 'content/ru/02-astrologia-vnutrennego-neba/_meta.json')!.content)
    expect(meta.module).toBe(2)
    expect(meta.level).toBe(0)
    expect(meta.duration).toBe('~30 мин')
    expect(meta.title).toBe('Астрология внутреннего неба')
    expect(meta.units).toEqual([
      { slug: 'u1-karta', title: 'Карта' },
      { slug: 'u2-yazyk', title: 'Язык' },
      { slug: 'u3-ritm', title: 'Ритм' },
    ])
    const en = JSON.parse(files.find(f => f.path === 'content/en/02-astrologia-vnutrennego-neba/_meta.json')!.content)
    expect(en.duration).toBe('~30 min')
  })

  it('unit stubs carry frontmatter + objective + all four Phase TODOs', () => {
    const mdx = files.find(f => f.path === 'content/ru/02-astrologia-vnutrennego-neba/u2-yazyk.mdx')!.content
    expect(mdx).toMatch(/title: "Язык"/)
    expect(mdx).toMatch(/unit: 2/)
    expect(mdx).toMatch(/module: 2/)
    expect(mdx).toMatch(/duration: "~10 мин"/)
    expect(mdx).toMatch(/objective: Освоить язык/)
    for (const phase of ['activation', 'reflection', 'concept', 'practice']) {
      expect(mdx).toContain(`<Phase type="${phase}">`)
    }
    expect(mdx).toContain('TODO')
  })

  it('the emitted _module.json passes validateStamp', () => {
    const stamp = JSON.parse(files.find(f => f.path.endsWith('_module.json'))!.content)
    expect(validateStamp(stamp)).toEqual([])
    expect(stamp).toMatchObject({ slug: outline.slug, author: { name: 'Наташа' }, created: '2026-08-06', manifest_ack: true })
  })
})

describe('writeModuleScaffold (sacrificial temp dir, no-clobber)', () => {
  let root: string
  beforeAll(() => { root = mkdtempSync(join(tmpdir(), 'module-scaffold-')) })
  afterAll(() => { rmSync(root, { recursive: true, force: true }) })

  it('writes every file on a clean run', () => {
    const files = scaffoldModule(outline, '2026-08-06')
    const res = writeModuleScaffold(root, files)
    expect(res.conflicts).toEqual([])
    expect(res.written).toHaveLength(files.length)
    expect(existsSync(join(root, 'content/en/02-astrologia-vnutrennego-neba/u3-ritm.mdx'))).toBe(true)
    expect(readFileSync(join(root, 'content/ru/02-astrologia-vnutrennego-neba/_meta.json'), 'utf8')).toContain('"module": 2')
  })

  it('refuses the whole write when any target already exists (no partial writes)', () => {
    const files = scaffoldModule(outline, '2026-08-06')
    const res = writeModuleScaffold(root, files) // second run — everything exists
    expect(res.written).toEqual([])
    expect(res.conflicts.length).toBe(files.length)
  })

  it('one pre-existing file blocks the run and nothing else is written', () => {
    const other = mkdtempSync(join(tmpdir(), 'module-scaffold-partial-'))
    try {
      const files = scaffoldModule(outline, '2026-08-06')
      const blocker = join(other, files[3].path)
      mkdirSync(join(blocker, '..'), { recursive: true })
      writeFileSync(blocker, 'existing prose — must not be clobbered', 'utf8')
      const res = writeModuleScaffold(other, files)
      expect(res.written).toEqual([])
      expect(res.conflicts).toEqual([files[3].path])
      expect(readFileSync(blocker, 'utf8')).toContain('must not be clobbered')
      expect(existsSync(join(other, files[0].path))).toBe(false)
    } finally {
      rmSync(other, { recursive: true, force: true })
    }
  })
})
