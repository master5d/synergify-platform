import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Сборка курса не ходит в сеть за шрифтами: next/font/google качает их на каждом `next build`
// (у академии это дважды уронило deploy-academy 2026-09-28). Unbounded лежит в app/fonts
// (OFL, происхождение — app/fonts/README.md); Geist приходит из npm-пакета geist.
const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, '..', '..', 'app')
const LAYOUT = readFileSync(join(APP, 'layout.tsx'), 'utf8')

describe('шрифты курса — без сети на сборке', () => {
  it('layout не тянет next/font/google', () => {
    expect(LAYOUT).not.toMatch(/from\s+['"]next\/font\/google['"]/)
    expect(LAYOUT).toMatch(/from\s+['"]next\/font\/local['"]/)
  })

  it('каждый локальный файл на месте, лицензия OFL рядом', () => {
    const srcs = [...LAYOUT.matchAll(/src:\s*'(\.\/fonts\/[^']+)'/g)].map((m) => m[1])
    expect(srcs.length).toBeGreaterThan(0)
    for (const s of srcs) expect(existsSync(join(APP, s)), s).toBe(true)
    expect(readFileSync(join(APP, 'fonts', 'OFL-unbounded.txt'), 'utf8')).toMatch(/SIL Open Font License, Version 1\.1/)
  })

  it('дисплейный шрифт остаётся на --font-display', () => {
    expect(LAYOUT).toContain("variable: '--font-display'")
  })
})
