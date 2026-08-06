import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = join(HERE, '..', '..', 'content') // web/content

// Registry of content "wins" worth protecting from regression. Add an entry when a phrase
// or framing is confirmed to work (student feedback) and must survive future content edits.
// Each entry pins a substring that MUST stay present in a given lesson file + locale.
interface Protected {
  file: string            // relative to web/content, e.g. 'ru/00-kickstart/u1-map.mdx'
  mustContain: string     // substring that must remain
  why: string             // why this is protected (feedback origin)
}

const PROTECTED: Protected[] = [
  // fb_e557d202d89b — the cooking metaphor in Unit 1 lowers the entry barrier and promises
  // clarity; a student flagged it as the moment that "tunes you in". Keep it in both locales.
  { file: 'ru/00-kickstart/u1-map.mdx', mustContain: 'рецепт блюда', why: 'fb_e557d202d89b cooking metaphor (RU)' },
  { file: 'en/00-kickstart/u1-map.mdx', mustContain: 'recipe for a dish', why: 'fb_e557d202d89b cooking metaphor (EN)' },
]

describe('protected content (regression guard for confirmed wins)', () => {
  for (const p of PROTECTED) {
    it(`keeps "${p.mustContain}" in ${p.file} — ${p.why}`, () => {
      const path = join(CONTENT, p.file)
      expect(existsSync(path), `${p.file} should exist`).toBe(true)
      const src = readFileSync(path, 'utf8')
      expect(src).toContain(p.mustContain)
    })
  }
})
