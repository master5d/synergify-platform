import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = join(HERE, '..', '..', 'content')
const LOCALES = ['ru', 'en'] as const

interface UnitMeta { slug: string; title: string }
interface ModuleMeta { module: number; title: string; units: UnitMeta[] }

function modules(locale: string): string[] {
  return readdirSync(join(CONTENT, locale), { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
    .map((e) => e.name)
    .sort()
}

function meta(locale: string, mod: string): ModuleMeta {
  return JSON.parse(readFileSync(join(CONTENT, locale, mod, '_meta.json'), 'utf8'))
}

function unitFiles(locale: string, mod: string): string[] {
  return readdirSync(join(CONTENT, locale, mod))
    .filter((f) => /^u\d.*\.mdx$/.test(f))
    .map((f) => f.replace(/\.mdx$/, ''))
    .sort()
}

function frontmatter(locale: string, mod: string, unit: string): string {
  const src = readFileSync(join(CONTENT, locale, mod, `${unit}.mdx`), 'utf8')
  return src.split('---')[1] ?? ''
}

/**
 * Страницы уроков генерируются из `_meta.json` (`generateStaticParams` читает
 * `getAllModules`), а контент-гварды ходят по файлам на диске. Между этими двумя
 * списками нет ничего, что их сверяет, и расхождение читается как «всё хорошо»:
 *
 *   - написал .mdx, забыл вписать в _meta → страницы НЕ БУДЕТ. Сборка зелёная,
 *     юнита нет ни в навигации, ни в sitemap. Проверено экспериментом: сняли
 *     запись из _meta — все 895 тестов остались зелёными;
 *   - вписал в _meta, файла нет → падает уже сборка (это громко, но пусть
 *     ломается здесь, за 300 мс, а не в CI после пуша).
 */
describe('каждый юнит объявлен ровно один раз', () => {
  for (const locale of LOCALES) {
    for (const mod of modules(locale)) {
      it(`${locale}/${mod}: _meta и файлы совпадают`, () => {
        const declared = meta(locale, mod).units.map((u) => u.slug).sort()
        const onDisk = unitFiles(locale, mod)
        const notDeclared = onDisk.filter((s) => !declared.includes(s))
        const noFile = declared.filter((s) => !onDisk.includes(s))
        expect(notDeclared, `файл есть, в _meta не объявлен → страницы не будет: ${notDeclared.join(', ')}`).toEqual([])
        expect(noFile, `в _meta объявлен, файла нет → сборка упадёт: ${noFile.join(', ')}`).toEqual([])
      })
    }
  }
})

/**
 * Двуязычность держится только дисциплиной автора. Хуже того, гварды контента
 * параметризованы по НАЙДЕННЫМ файлам: пропал английский юнит — вместе с ним
 * пропали и его проверки, а сюит остался зелёным (было 895 тестов, стало 893 —
 * и ни одного красного). Этот тест смотрит на пару, а не на файл.
 */
describe('локали содержат одинаковый набор материала', () => {
  it('набор модулей совпадает', () => {
    expect(modules('en')).toEqual(modules('ru'))
  })

  for (const mod of modules('ru')) {
    it(`${mod}: набор юнитов совпадает`, () => {
      expect(unitFiles('en', mod), `RU и EN разошлись в модуле ${mod}`).toEqual(unitFiles('ru', mod))
    })
  }

  it('одиночные страницы (roadmap, cheatsheet, exercises) есть в обеих локалях', () => {
    const loose = (locale: string) =>
      readdirSync(join(CONTENT, locale)).filter((f) => f.endsWith('.mdx')).sort()
    expect(loose('en')).toEqual(loose('ru'))
  })
})

/**
 * Фронтматтер юнита дублирует то, что уже сказано его местом в дереве: номер
 * модуля и порядковый номер юнита. Дубль, который никто не сверяет, однажды
 * разъезжается — а ученику он виден как неверная нумерация в шапке урока.
 */
describe('фронтматтер согласован с местом юнита в курсе', () => {
  for (const locale of LOCALES) {
    for (const mod of modules(locale)) {
      const m = meta(locale, mod)
      it(`${locale}/${mod}: module и unit совпадают с деревом`, () => {
        const expectedModule = Number(mod.slice(0, 2))
        expect(m.module, `_meta.module не совпадает с именем каталога`).toBe(expectedModule)

        const wrong: string[] = []
        m.units.forEach((u, i) => {
          const fm = frontmatter(locale, mod, u.slug)
          const unitNo = Number(/^unit:\s*(\d+)/m.exec(fm)?.[1])
          const modNo = Number(/^module:\s*(\d+)/m.exec(fm)?.[1])
          const title = /^title:\s*"(.*)"/m.exec(fm)?.[1]
          if (unitNo !== i + 1) wrong.push(`${u.slug}: unit=${unitNo}, а стоит ${i + 1}-м`)
          if (modNo !== expectedModule) wrong.push(`${u.slug}: module=${modNo}, а лежит в ${mod}`)
          if (title !== u.title) wrong.push(`${u.slug}: заголовок «${title}» ≠ «${u.title}» из _meta`)
        })
        expect(wrong, wrong.join('; ')).toEqual([])
      })
    }
  }
})
