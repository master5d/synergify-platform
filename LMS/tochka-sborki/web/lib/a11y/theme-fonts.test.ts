import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..') // web/
const THEME = readFileSync(join(ROOT, 'themes', 'model-kit.css'), 'utf8')
const LAYOUT = readFileSync(join(ROOT, 'app', 'layout.tsx'), 'utf8')
const GLOBALS = readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8')

// Pulls the real `variable: "--font-…"` string out of the geist package itself, rather than
// hardcoding it here — a future geist bump renaming the variable should fail this test instead
// of silently reintroducing the desync.
function geistVariableName(entry: 'sans' | 'mono'): string {
  const file = join(ROOT, 'node_modules', 'geist', 'dist', `${entry}.js`)
  if (!existsSync(file)) throw new Error(`geist not installed — run npm ci (${file})`)
  const m = /variable:\s*["']([^"']+)["']/.exec(readFileSync(file, 'utf8'))
  if (!m) throw new Error(`geist/dist/${entry}.js: could not find a "variable" export`)
  return m[1]
}

// Дефект (смок-аудит 2026-09-27, «Шрифты темы не применяются»): --font-mono в теме ссылался
// на буквальную строку 'Geist Mono', а next/font регистрирует шрифт под сгенерированной
// переменной (--font-geist-mono) — ни один @font-face с именем 'Geist Mono' не существовал,
// и шрифт молча падал на fallback. --font-sans не был задан вовсе, поэтому обычный текст
// сайта использовал дефолтный стек Tailwind, хотя Geist Sans был подключён в layout.tsx.
describe('model-kit ↔ layout.tsx font variable sync', () => {
  it('layout.tsx registers GeistSans/GeistMono from the geist package via .variable', () => {
    expect(LAYOUT).toContain("from 'geist/font/sans'")
    expect(LAYOUT).toContain("from 'geist/font/mono'")
    expect(LAYOUT).toContain('GeistSans.variable')
    expect(LAYOUT).toContain('GeistMono.variable')
  })

  it('theme --font-sans references the variable the geist package actually registers', () => {
    const varName = geistVariableName('sans')
    expect(THEME).toMatch(new RegExp(`--font-sans:\\s*var\\(${varName}\\)`))
  })

  it('theme --font-mono references the variable the geist package actually registers', () => {
    const varName = geistVariableName('mono')
    expect(THEME).toMatch(new RegExp(`--font-mono:\\s*var\\(${varName}\\)`))
  })

  it('theme does not hardcode a literal font-family name next/font never registers', () => {
    // Было: --font-mono: 'Geist Mono', monospace; — строка, под которой нет @font-face.
    expect(THEME).not.toMatch(/--font-(sans|mono):\s*['"]Geist/)
  })

  it('globals.css applies --font-sans to <html> (Preflight cannot see theme vars at build time)', () => {
    expect(GLOBALS).toMatch(/html\s*\{[^}]*font-family:\s*var\(--font-sans\)/)
  })
})
