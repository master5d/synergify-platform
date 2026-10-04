import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { compile } from '@mdx-js/mdx'
import { CONTENT_ROOT, PACK_SLUG } from '../pack'

// Гвард сборки: каждый .mdx pack'а обязан компилироваться как MDX. Контент-гварды ходят по
// тексту и не парсят MDX, поэтому `<OsBlock>` внутри незакрытого ```-блока прошёл все 3587 тестов
// и уронил `next build` на деплое (2026-10-04, 03/u3 RU+EN). Здесь — тот же компилятор, что у
// next-mdx-remote, без рендера компонентов.
//
// Второй инвариант: `<OsBlock os="…">` знает только `mac` и `windows` (lib/os-pref.ts) — блок с
// другим значением молча не показывается никому (`macos linux` в 02/u1 и 03/u3 — та же дата).

function mdxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name)
    if (entry.isDirectory()) return mdxFiles(file)
    return entry.name.endsWith('.mdx') ? [file] : []
  })
}

const files = mdxFiles(CONTENT_ROOT)

describe(`mdx compiles (${PACK_SLUG})`, () => {
  it('finds units to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const file of files) {
    const name = relative(CONTENT_ROOT, file).split('\\').join('/')
    it(`${name}: compiles as MDX`, async () => {
      const source = readFileSync(file, 'utf8').replace(/^---[\s\S]*?---\r?\n/, '')
      await expect(compile(source, { jsx: true })).resolves.toBeTruthy()
    })
    it(`${name}: <OsBlock os> uses only mac|windows`, () => {
      const source = readFileSync(file, 'utf8')
      const bad = [...source.matchAll(/<OsBlock\s+os="([^"]*)"/g)].map((m) => m[1]).filter((v) => v !== 'mac' && v !== 'windows')
      expect(bad, `недопустимые os="…": ${bad.join(', ')}`).toEqual([])
    })
  }
})
