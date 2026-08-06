import { describe, it, expect } from 'vitest'
import { readdirSync, statSync, readFileSync } from 'fs'
import { dirname, join, sep } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = join(HERE, '..', '..', 'content') // web/content

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') ? [p] : []
  })
}

function localeOf(path: string): 'ru' | 'en' {
  return path.includes(`${sep}en${sep}`) ? 'en' : 'ru'
}

function phaseBlocks(src: string, type: 'activation' | 'reflection'): string[] {
  const re = new RegExp(`<Phase type="${type}">([\\s\\S]*?)</Phase>`, 'g')
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) out.push(m[1])
  return out
}

const BANNED: Record<'ru' | 'en', RegExp> = {
  ru: /(запиш|опиш|напиш|напечата|\bвведи\b|перечисли)/i,
  en: /(\bwrite down\b|\btype\b|\bjot\b|\bwrite (it|them|your)\b|\benter your\b)/i,
}

const files = walk(CONTENT)

describe('reflection prompts contain no "type here" verbs', () => {
  it('discovers unit mdx files', () => {
    expect(files.length).toBeGreaterThan(30)
  })

  it.each(files)('%s', (file) => {
    const src = readFileSync(file, 'utf8')
    const locale = localeOf(file)
    const banned = BANNED[locale]
    for (const type of ['activation', 'reflection'] as const) {
      for (const block of phaseBlocks(src, type)) {
        expect(banned.test(block), `banned input verb in <Phase type="${type}"> of ${file}`).toBe(false)
      }
    }
  })
})
