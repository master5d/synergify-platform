import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Сборка академии не ходит в сеть за шрифтами: next/font/google качал их на каждом `next build`
// и дважды за 2026-09-28 уронил deploy-academy («Can't resolve …/font/google/font»).
// Шрифты лежат в app/fonts (OFL, происхождение — app/fonts/README.md).
const APP = join(__dirname, '..', 'app')
const layout = readFileSync(join(APP, 'layout.tsx'), 'utf8')

describe('шрифты академии — локальные', () => {
  it('layout не тянет next/font/google', () => {
    expect(layout).not.toMatch(/next\/font\/google/)
    expect(layout).toMatch(/next\/font\/local/)
  })

  const srcs = [...layout.matchAll(/src:\s*'(\.\/fonts\/[^']+)'/g)].map((m) => m[1])

  it('три семейства, каждый файл на месте', () => {
    expect(srcs).toHaveLength(3)
    for (const s of srcs) expect(existsSync(join(APP, s)), s).toBe(true)
  })

  it('у каждого шрифта рядом его лицензия OFL', () => {
    for (const fam of ['comfortaa', 'onest', 'unbounded']) {
      const lic = join(APP, 'fonts', `OFL-${fam}.txt`)
      expect(existsSync(lic), lic).toBe(true)
      expect(readFileSync(lic, 'utf8')).toMatch(/SIL Open Font License, Version 1\.1/)
    }
  })

  it('CSS-переменные дизайна сохранены', () => {
    for (const v of ['--font-wordmark', '--font-display', '--font-body']) expect(layout).toContain(`'${v}'`)
  })
})
