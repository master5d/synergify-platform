import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { GLOSSARY } from '@pack/glossary'

const CONTENT = join(process.cwd(), 'packs', 'tochka-sborki', 'content')

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

describe('course terminology glossary', () => {
  it('has no banned terminology in RU or EN prose', () => {
    const findings: string[] = []
    for (const file of filesUnder(CONTENT)) {
      const locale = file.includes(`${sep}ru${sep}`) ? 'ru' : 'en'
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
    const entry = GLOSSARY.find((item) => item.term === 'processing chain')!
    const line = 'Это новый пайплайн для обработки.'
    expect(entry.banned.ru.some((pattern) => { pattern.lastIndex = 0; return pattern.test(line) })).toBe(true)
  })
})
