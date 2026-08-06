import { describe, it, expect } from 'vitest'
import { readdirSync, statSync, readFileSync, existsSync } from 'fs'
import { dirname, join, sep, basename } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = join(HERE, '..', '..', 'content')
const PUBLIC = join(HERE, '..', '..', 'public')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') ? [p] : []
  })
}

function localeOf(path: string): 'ru' | 'en' {
  return path.includes(`${sep}en${sep}`) ? 'en' : 'ru'
}

/** Слаги модулей = каталоги NN-* внутри локали (тот же источник, что у getAllModules). */
function moduleSlugs(locale: 'ru' | 'en'): string[] {
  return readdirSync(join(CONTENT, locale), { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
    .map((e) => e.name)
}

function unitSlugs(locale: 'ru' | 'en', mod: string): string[] {
  return readdirSync(join(CONTENT, locale, mod))
    .filter((f) => /^u\d.*\.mdx$/.test(f))
    .map((f) => f.replace(/\.mdx$/, ''))
}

const files = walk(CONTENT)
const LESSON_LINK = /\]\((\/(?:en\/)?lessons\/[^)]+)\)/g

/**
 * Ссылки на уроки внутри прозы курса.
 *
 * Почему тест: модули один раз уже сдвинулись по номерам (когда перед
 * промпт-инжинирингом встал «Выбор стека»), и дорожная карта осталась со старой
 * нумерацией — пять ссылок вели в никуда. Сборка на это не жалуется: маршрут
 * динамический, битая ссылка становится 404 только у живого ученика.
 */
describe('ссылки на уроки ведут в существующие модули', () => {
  it.each(files)('%s', (file) => {
    const src = readFileSync(file, 'utf8')
    const locale = localeOf(file)
    const mods = moduleSlugs(locale)
    const bad: string[] = []

    for (const [, href] of src.matchAll(LESSON_LINK)) {
      const parts = href.replace(/^\/(en\/)?lessons\//, '').replace(/\/$/, '').split('/')
      const [mod, unit] = parts
      if (!mods.includes(mod)) {
        bad.push(`${href} → нет модуля «${mod}» (есть: ${mods.join(', ')})`)
        continue
      }
      if (unit && !unitSlugs(locale, mod).includes(unit)) {
        bad.push(`${href} → в модуле «${mod}» нет юнита «${unit}»`)
      }
    }
    expect(bad, `битые ссылки на уроки:\n${bad.join('\n')}`).toEqual([])
  })
})

/**
 * Локаль ссылки должна совпадать с локалью страницы: из английского текста
 * ссылка обязана вести в /en/. Иначе ученик проваливается в русскую версию
 * посреди английского курса — тихо, без единой ошибки в сборке.
 */
describe('внутренние ссылки не перебрасывают между локалями', () => {
  const enFiles = files.filter((f) => localeOf(f) === 'en')
  it.each(enFiles)('%s', (file) => {
    const src = readFileSync(file, 'utf8')
    const leaks = [...src.matchAll(LESSON_LINK)]
      .map(([, href]) => href)
      .filter((href) => !href.startsWith('/en/'))
    expect(leaks, `английская страница ссылается в русскую версию: ${leaks.join(', ')}`).toEqual([])
  })

  it('русские страницы не ссылаются в /en/', () => {
    const leaks: string[] = []
    for (const file of files.filter((f) => localeOf(f) === 'ru')) {
      const src = readFileSync(file, 'utf8')
      for (const [, href] of src.matchAll(LESSON_LINK)) {
        if (href.startsWith('/en/')) leaks.push(`${basename(file)}: ${href}`)
      }
    }
    expect(leaks).toEqual([])
  })
})

/**
 * Ссылки на файлы материалов (/materials/*.md, /install.sh) — это реальные файлы
 * в public/. Удалили файл, оставили ссылку — сборка снова промолчит.
 */
describe('ссылки на файлы материалов указывают на существующие файлы', () => {
  const FILE_LINK = /\]\((\/[a-z0-9\-/]+\.(?:md|sh|ps1|pdf))\)/g
  it.each(files)('%s', (file) => {
    const src = readFileSync(file, 'utf8')
    const missing = [...src.matchAll(FILE_LINK)]
      .map(([, href]) => href)
      .filter((href) => !existsSync(join(PUBLIC, href.replace(/^\//, ''))))
    expect(missing, `нет файла в public/: ${missing.join(', ')}`).toEqual([])
  })
})
