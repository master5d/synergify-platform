import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Шов двух резолверов (Ф4, найдено рендером 2026-08-08).
//
// `next build` идёт на webpack, `next dev` — на turbopack, у vitest свой алиас.
// Пока `@pack` был прописан ТОЛЬКО в turbopack-ветке, прод-сборка второго pack'а
// молча брала путь из tsconfig (дефолтный tochka-sborki): контент сходился
// (CONTENT_ROOT читает env в рантайме), а словари и конфиг приезжали от чужого
// курса. Зелёные тесты этого не видели. Гвард держит все три резолвера в строю.
const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')

describe('@pack резолвится одинаково всеми резолверами', () => {
  it('все три конфига смотрят в packs/_active — единый путь, а не три механизма', () => {
    expect(read('tsconfig.json'), 'tsconfig держит конкретный pack').toMatch(/packs\/_active/)
    expect(read('vitest.config.ts')).toMatch(/_active/)
    expect(read('next.config.ts')).toMatch(/_active/)
  })

  it('материализация активного pack’а зашита в prebuild и pretest', () => {
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> }
    expect(pkg.scripts.prebuild, 'без prebuild сборка возьмёт вчерашний pack').toContain('select-pack')
    expect(pkg.scripts.pretest).toContain('select-pack')
  })

  it('packs/_active соответствует COURSE_PACK (иначе тесты врут про другой курс)', () => {
    const slug = process.env.COURSE_PACK ?? 'tochka-sborki'
    const active = read(join('packs', '_active', 'course.config.ts'))
    const source = read(join('packs', slug, 'course.config.ts'))
    expect(active, `packs/_active не от "${slug}" — запусти npm run select-pack`).toBe(source)
  })
})

describe('ядро не знает имени конкретного курса', () => {
  for (const file of ['app/layout.tsx', 'app/manifest.ts']) {
    it(`${file}: идентичность приходит из COURSE, а не литералом`, () => {
      const src = read(file)
      expect(src, `${file} держит имя курса литералом`).not.toMatch(/Точка Сборки|Tochka Sborki/)
      expect(src).toMatch(/COURSE\./)
    })
  }
})
