import { describe, it, expect } from 'vitest'
import { readdirSync, statSync, readFileSync } from 'fs'
import { dirname, join, sep } from 'path'
import { fileURLToPath } from 'url'
import { CONTENT_ROOT, PACK_SLUG } from '../pack'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = CONTENT_ROOT

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.mdx') ? [path] : []
  })
}

function phase(src: string, type: 'activation' | 'reflection'): string[] {
  const re = new RegExp(`<Phase type="${type}">([\\s\\S]*?)</Phase>`, 'g')
  return [...src.matchAll(re)].map((match) => match[1])
}

const files = walk(CONTENT)

const ALLOWLIST: Record<string, string> = {
  '08-agent-engineering/u2-jagged-intelligence.mdx': 'legacy bisociation prose exceeds 1200 characters; module 08 is explicitly out of scope for this phase audit',
  '08-agent-engineering/u4-production-infra.mdx': 'legacy reflection carries a six-step production checklist; module 08 is explicitly out of scope for this phase audit',
  '08-agent-engineering/u5-practice.mdx': 'legacy practice reflection contains its blueprint table; module 08 is explicitly out of scope for this phase audit',
}

describe('activation/reflection keep one image and no concept payload', () => {
  it('discovers unit mdx files', () => {
    expect(files.length).toBeGreaterThan(PACK_SLUG === 'tochka-sborki' ? 30 : 0)
  })

  it.each(files)('%s', (file) => {
    const relative = file.split(`${sep}content${sep}`)[1].replaceAll(sep, '/')
    if (ALLOWLIST[relative.replace(/^ru\//, '').replace(/^en\//, '')]) return
    const src = readFileSync(file, 'utf8')
    for (const type of ['activation', 'reflection'] as const) {
      for (const block of phase(src, type)) {
        expect(block).not.toMatch(/\|---/)
        expect((block.match(/^\s*\d+[.)]\s/gm) ?? []).length, `${file}: ${type} has a long numbered list`).toBeLessThanOrEqual(3)
        expect(block).not.toMatch(/```/)
        expect(block.length, `${file}: ${type} is too long`).toBeLessThanOrEqual(1200)
      }
    }
  })
})
