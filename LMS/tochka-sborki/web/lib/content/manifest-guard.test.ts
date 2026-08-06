// Гвард исполняемого манифеста курса (Ф2 S1): весь MDX-контент обеих локалей и
// все строки словаря активного pack'а обязаны давать 0 находок checkManifest.
// Плюс: у гостевых модулей (_module.json) штамп валиден по validateStamp;
// модули БЕЗ штампа легальны — авторские модули владельца.
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { CONTENT_ROOT, PACK_SLUG } from '../pack'
import { MANIFEST } from '../manifest'
import { checkManifest } from '../authoring/manifest'
import { dictionaries } from '../dictionaries'
import { validateStamp } from '../authoring/module-stamp'

function walkMdx(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walkMdx(p) : p.endsWith('.mdx') ? [p] : []
  })
}

/** Все строковые значения словаря (функции-строители пропускаются). */
function collectStrings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) for (const x of v) collectStrings(x, out)
  else if (v && typeof v === 'object') for (const x of Object.values(v)) collectStrings(x, out)
  return out
}

const mdxFiles = walkMdx(CONTENT_ROOT)

describe(`course manifest guard (${PACK_SLUG})`, () => {
  it('pack ships a non-empty MANIFEST', () => {
    expect(MANIFEST.length).toBeGreaterThan(0)
  })

  it.each(mdxFiles)('%s', (file) => {
    const findings = checkManifest(readFileSync(file, 'utf8'), MANIFEST)
    expect(findings, findings.map(f => `[${f.label}] "${f.match}"`).join('; ')).toEqual([])
  })

  for (const locale of ['ru', 'en'] as const) {
    it(`dictionary strings (${locale}) are manifest-clean`, () => {
      const text = collectStrings(dictionaries[locale]).join('\n')
      const findings = checkManifest(text, MANIFEST)
      expect(findings, findings.map(f => `[${f.label}] "${f.match}"`).join('; ')).toEqual([])
    })
  }

  it('negative control: seeded violation IS caught by the active manifest', () => {
    // Не запись в файлы — unit-кейс на checkManifest тем же набором правил.
    const dirty = 'Успей записаться — только сегодня, осталось мест! Guaranteed results.'
    expect(checkManifest(dirty, MANIFEST).length).toBeGreaterThan(0)
  })
})

describe(`guest-module stamps (${PACK_SLUG})`, () => {
  const moduleDirs = (['ru', 'en'] as const)
    .map(l => join(CONTENT_ROOT, l))
    .filter(existsSync)
    .flatMap(localeDir => readdirSync(localeDir)
      .map(name => join(localeDir, name))
      .filter(p => statSync(p).isDirectory()))

  it.each(moduleDirs)('%s: _module.json, if present, is a valid stamp', (dir) => {
    const stampPath = join(dir, '_module.json')
    if (!existsSync(stampPath)) return // авторский модуль владельца — штамп не обязателен
    const stamp = JSON.parse(readFileSync(stampPath, 'utf8'))
    expect(validateStamp(stamp)).toEqual([])
  })
})
