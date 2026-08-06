import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import sitemap from '../app/sitemap'
import { COURSE } from './course'

const HERE = dirname(fileURLToPath(import.meta.url))      // web/lib
const CONTENT = join(HERE, '..', 'content', 'ru')
const APP = join(HERE, '..', 'app')

const entries = sitemap()
const paths = entries.map((e) => e.url.replace(COURSE.domain, ''))

/**
 * Соседний тест (`sitemap.test.ts`) проверяет ФОРМУ записи: hreflang, слеши,
 * пары локалей. Здесь — состав: что в карте сайта лежит ровно то, что есть
 * на сайте. Обе ошибки молчаливые: непопавшая страница просто не индексируется,
 * а лишняя ведёт поисковик в 404.
 */
describe('карта сайта покрывает весь курс', () => {
  const modules = readdirSync(CONTENT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
    .map((e) => e.name)

  it('находит модули курса', () => {
    expect(modules.length).toBeGreaterThan(5)
  })

  it.each(modules)('%s: модуль и все его юниты в карте', (mod) => {
    expect(paths, `модуль ${mod} не индексируется`).toContain(`/lessons/${mod}/`)

    const meta = JSON.parse(readFileSync(join(CONTENT, mod, '_meta.json'), 'utf8'))
    const missing = meta.units
      .map((u: { slug: string }) => `/lessons/${mod}/${u.slug}/`)
      .filter((p: string) => !paths.includes(p))
    expect(missing, `юниты не попали в карту сайта: ${missing.join(', ')}`).toEqual([])
  })
})

describe('карта сайта не ведёт в никуда и не выдаёт закрытое', () => {
  it('каждый путь уроков соответствует существующему файлу', () => {
    const dangling = paths
      .filter((p) => p.startsWith('/lessons/'))
      .filter((p) => {
        const [, , mod, unit] = p.replace(/\/$/, '').split('/')
        if (!unit) return !existsSync(join(CONTENT, mod))
        return !existsSync(join(CONTENT, mod, `${unit}.mdx`))
      })
    expect(dangling, `в карте есть несуществующие уроки: ${dangling.join(', ')}`).toEqual([])
  })

  it('каждый статический путь соответствует существующему маршруту', () => {
    const dangling = paths
      .filter((p) => !p.startsWith('/lessons/') && p !== '/')
      .filter((p) => !hasRoute(p))
    expect(dangling, `в карте есть пути без маршрута: ${dangling.join(', ')}`).toEqual([])
  })

  /**
   * Закрытые и noindex-маршруты в карту не попадают. Это не гигиена, а защита:
   * один лишний путь в STATIC_PATHS — и приватная страница уезжает в поисковый
   * индекс, откуда её уже не отозвать.
   */
  it('приватные и gated-маршруты отсутствуют', () => {
    const forbidden = ['/dashboard', '/character', '/login', '/quest-intake', '/admin', '/dungeon', '/offline']
    const leaked = paths.filter((p) => forbidden.some((f) => p.startsWith(f)))
    expect(leaked, `закрытые страницы попали в карту сайта: ${leaked.join(', ')}`).toEqual([])
  })

  it('путей нет дубликатов', () => {
    expect(paths.length).toBe(new Set(paths).size)
  })
})

/**
 * Есть ли под путём страница: своя `page.tsx` либо динамический сегмент
 * у родителя (`/speech/prep` живёт в `app/speech/[slug]/page.tsx`).
 */
function hasRoute(path: string): boolean {
  const dir = join(APP, path.replace(/^\//, '').replace(/\/$/, ''))
  if (existsSync(join(dir, 'page.tsx'))) return true
  const parent = dirname(dir)
  if (!existsSync(parent)) return false
  return readdirSync(parent, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith('['))
    .some((e) => existsSync(join(parent, e.name, 'page.tsx')))
}
