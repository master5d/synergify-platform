import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CONTENT_ROOT } from '../pack'

const FIXTURE = join(import.meta.dirname, 'fixtures', 'claude-help-2.1.289.txt')
const CHEATSHEETS = [
  join(CONTENT_ROOT, 'ru', 'cheatsheet.mdx'),
  join(CONTENT_ROOT, 'en', 'cheatsheet.mdx'),
]

function bashBlocks(source: string): string[] {
  return [...source.matchAll(/```bash\s*\n([\s\S]*?)```/g)].map((match) => match[1])
}

function longFlags(source: string): string[] {
  return [...new Set([...source.matchAll(/(?<![\w-])--[a-z][\w-]*/g)].map((match) => match[0]))]
}

describe('cheatsheet CLI flags', () => {
  const help = readFileSync(FIXTURE, 'utf8')
  const fixtureVersion = FIXTURE.match(/claude-help-(\d+\.\d+\.\d+)\.txt$/)?.[1]

  it('labels both cheatsheets with the fixture Claude Code version', () => {
    expect(fixtureVersion).toBeTruthy()
    for (const file of CHEATSHEETS) {
      const source = readFileSync(file, 'utf8')
      expect(source).toMatch(new RegExp(`(?:Verified|Проверено) on Claude Code ${fixtureVersion}|Проверено на Claude Code ${fixtureVersion}`))
    }
  })

  it('only teaches long flags present in the saved claude --help output', () => {
    const taught = [...new Set(CHEATSHEETS.flatMap((file) => bashBlocks(readFileSync(file, 'utf8')).flatMap(longFlags)))]
    const missing = taught.filter((flag) => !help.includes(flag))
    expect(missing, `flags absent from ${FIXTURE}: ${missing.join(', ')}`).toEqual([])
  })
})
