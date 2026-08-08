import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { COURSE } from '@/lib/course'

// Слои движка включает КУРС, а не имя pack'а (Ф4). Курс без RPG-спайна не должен
// носить квест-лог, профиль героя и синергемы: на стенде это было первым, что
// бросалось в глаза у шестиурочного курса прозы.
const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')

describe('course features', () => {
  it('активный курс объявляет флаги слоёв', () => {
    expect(COURSE.features, 'course.config без features').toBeDefined()
    expect(typeof COURSE.features.rpg).toBe('boolean')
    expect(typeof COURSE.features.certificate).toBe('boolean')
  })

  it('каждый pack объявляет features (новый курс не наследует чужую игру молча)', () => {
    const packs = readdirSync(join(ROOT, 'packs'), { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
    expect(packs.length).toBeGreaterThan(1)
    for (const p of packs) {
      const cfg = read(join('packs', p.name, 'course.config.ts'))
      expect(cfg, `${p.name}: нет features`).toMatch(/features:\s*\{/)
      expect(cfg, `${p.name}: нет флага rpg`).toMatch(/rpg:\s*(true|false)/)
      expect(cfg, `${p.name}: нет флага certificate`).toMatch(/certificate:\s*(true|false)/)
    }
  })

  it('nav гейтит поверхности по флагам, а не по слагу курса', () => {
    const nav = read('components/nav.tsx')
    expect(nav).toMatch(/COURSE\.features\.rpg/)
    expect(nav).toMatch(/COURSE\.features\.certificate/)
    expect(nav, 'nav знает конкретный курс по имени').not.toMatch(/tochka-sborki|living-practice/)
  })
})
