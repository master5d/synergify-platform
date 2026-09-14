// Гвард constructive alignment по активному pack'у (крутится в матрице build-packs).
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { PACK_DIR, PACK_SLUG } from '../pack'
import { validateModuleAlignment, selfCheckMarks, type AlignmentMeta } from './alignment'
import { PENDING_ALIGNMENT, PENDING_SNAPSHOT } from './alignment-pending'

type Locale = 'ru' | 'en'
const content = (l: Locale) => join(PACK_DIR, 'content', l)

function moduleSlugs(): string[] {
  return readdirSync(content('ru'), { withFileTypes: true })
    .filter(e => e.isDirectory() && /^\d{2}-/.test(e.name) && existsSync(join(content('ru'), e.name, '_meta.json')))
    .map(e => e.name)
}

const meta = (l: Locale, slug: string) => JSON.parse(readFileSync(join(content(l), slug, '_meta.json'), 'utf8')) as AlignmentMeta

function marks(l: Locale, slug: string, m: AlignmentMeta) {
  const out: Record<string, string[]> = {}
  let malformed = 0
  for (const u of m.units) {
    const p = join(content(l), slug, `${u.slug}.mdx`)
    if (!existsSync(p)) continue
    const r = selfCheckMarks(readFileSync(p, 'utf8'))
    out[u.slug] = r.ids
    malformed += r.malformed
  }
  return { out, malformed }
}

const pending = PENDING_ALIGNMENT[PACK_SLUG] ?? []
const hasObjectives = (slug: string) => (meta('ru', slug).objectives ?? []).length > 0

describe(`constructive alignment (${PACK_SLUG})`, () => {
  it('pending list only shrinks: subset of the frozen snapshot', () => {
    const snap = new Set(PENDING_SNAPSHOT[PACK_SLUG] ?? [])
    for (const s of pending) expect(snap.has(s), `${s} нет в PENDING_SNAPSHOT — новый модуль в храповик не прячется`).toBe(true)
  })

  it('a pending module that already has objectives must be removed from the list', () => {
    for (const s of pending) expect(hasObjectives(s), `${s} уже имеет цели — вычеркни из PENDING_ALIGNMENT`).toBe(false)
  })

  it('every non-pending module is aligned (objectives ↔ checks ↔ marks, RU = EN)', () => {
    const errors: string[] = []
    for (const slug of moduleSlugs()) {
      if (pending.includes(slug)) continue
      const ru = meta('ru', slug), en = meta('en', slug)
      const mr = marks('ru', slug, ru), me = marks('en', slug, en)
      errors.push(...validateModuleAlignment({ slug, ru, en, marks: { ru: mr.out, en: me.out }, malformed: { ru: mr.malformed, en: me.malformed } }))
    }
    expect(errors).toEqual([])
  })

  it('SelfCheck marks live only in module lessons (not cheatsheet/exercises/roadmap)', () => {
    for (const l of ['ru', 'en'] as const) {
      for (const f of readdirSync(content(l)).filter(f => f.endsWith('.mdx'))) {
        expect(readFileSync(join(content(l), f), 'utf8'), `${l}/${f}`).not.toMatch(/<SelfCheck\b/)
      }
    }
  })
})
