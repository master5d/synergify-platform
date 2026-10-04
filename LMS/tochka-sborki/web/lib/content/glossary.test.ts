import { beforeAll, describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { CONTENT_ROOT, PACK_DIR, PACK_SLUG } from '../pack'

// Глоссарий — файл pack'а (`packs/<pack>/glossary.ts`), и есть он не у каждого pack'а.
// Статический импорт через `@pack/glossary` ломал tsc при сборке другого pack'а
// (деплой 2026-10-04, living-practice), поэтому модуль грузится динамически по пути
// и только когда файл существует.
type GlossaryEntry = {
  term: string
  canon: { ru: string; en: string }
  banned: { ru: RegExp[]; en: RegExp[] }
  allow?: string[]
}

const GLOSSARY_FILE = join(PACK_DIR, 'glossary.ts')
const HAS_GLOSSARY = PACK_SLUG === 'tochka-sborki' && existsSync(GLOSSARY_FILE)

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name)
    if (entry.isDirectory()) return filesUnder(file)
    return entry.name.endsWith('.mdx') || entry.name === '_meta.json' ? [file] : []
  })
}

/** Keep prose only: code blocks, inline code, URLs and file/path tokens are not course prose. */
function proseLines(source: string): string[] {
  let fenced = false
  return source.split(/\r?\n/).map((line) => {
    if (/^\s*```/.test(line)) { fenced = !fenced; return '' }
    if (fenced) return ''
    return line
      .replace(/`[^`]*`/g, '')
      .replace(/https?:\/\/[^\s)]+/gi, '')
      .replace(/\]\([^)]*\)/g, ']')
      .replace(/\/(?:en\/)?lessons\/[^\s)]+/gi, '')
      .replace(/(?:[A-Za-z]:)?[\\/]?[\w./\\-]+\.(?:md|mdx|json|ts|tsx|sh|yaml|yml)\b/gi, '')
  })
}

function isAllowed(line: string, entry: { allow?: string[] }): boolean {
  return entry.allow?.some((snippet) => line.toLocaleLowerCase().includes(snippet.toLocaleLowerCase())) ?? false
}

describe.runIf(HAS_GLOSSARY)('course terminology glossary', () => {
  let GLOSSARY: GlossaryEntry[] = []

  beforeAll(async () => {
    const mod = (await import(/* @vite-ignore */ pathToFileURL(GLOSSARY_FILE).href)) as { GLOSSARY: GlossaryEntry[] }
    GLOSSARY = mod.GLOSSARY
    expect(GLOSSARY.length).toBeGreaterThan(0)
  })

  it('has no banned terminology in RU or EN prose', () => {
    const findings: string[] = []
    for (const file of filesUnder(CONTENT_ROOT)) {
      const locale: 'ru' | 'en' = file.includes(`${sep}ru${sep}`) ? 'ru' : 'en'
      const lines = proseLines(readFileSync(file, 'utf8'))
      lines.forEach((line, index) => {
        for (const entry of GLOSSARY) {
          if (isAllowed(line, entry)) continue
          for (const pattern of entry.banned[locale]) {
            pattern.lastIndex = 0
            if (pattern.test(line)) findings.push(`${relative(process.cwd(), file)}:${index + 1} ${entry.term}: ${line.trim()}`)
          }
        }
      })
    }
    expect(findings, findings.join('\n')).toEqual([])
  })

  it('detects a banned term when it is added to prose', () => {
    const entry = GLOSSARY.find((item: GlossaryEntry) => item.term === 'processing chain')!
    const line = 'Это новый пайплайн для обработки.'
    expect(entry.banned.ru.some((pattern: RegExp) => { pattern.lastIndex = 0; return pattern.test(line) })).toBe(true)
  })
})
