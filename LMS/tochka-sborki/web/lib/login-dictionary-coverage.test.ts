import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Гвард полноты словарей для этой волны: движок (login-form.tsx, auth-guard.tsx) не знает
// имени курса, а каждый pack обязан объявить те же ключи login/authGuard (тексты — только
// в словаре pack'а). tsc это уже ловит через Record<Locale, Dictionary> при сборке — здесь
// быстрая текстовая проверка без полной сборки. Читает файл как текст, а не импортом
// (boundary.test.ts запрещает литеральные импорты из packs/, кроме @pack), и вырезает
// именно блок `login: { … }` / `authGuard: { … }` по балансу скобок — простой substring-счёт
// ловил бы и чужие поля с тем же именем в других разделах словаря (feedback.emailLabel,
// intake.checking).
const ROOT = process.cwd()

const NEW_LOGIN_KEYS = [
  'emailLabel', 'telegramLabel', 'telegramHint', 'resend', 'changeEmail',
  'invalidEmail', 'sendFailed', 'rateLimited', 'redirectHint',
]

/** Вырезает n-е (по порядку встречи) блок `<name>: { … }` по балансу скобок:
 *  тип → ru → en идут в файле именно в этом порядке. */
function nthBlock(src: string, name: string, n: number): string {
  let from = 0
  let block = ''
  for (let i = 0; i < n; i++) {
    const markerIdx = src.indexOf(`${name}: {`, from)
    if (markerIdx === -1) throw new Error(`${name}: { — вхождение №${i + 1} не найдено`)
    const braceStart = src.indexOf('{', markerIdx)
    let depth = 0
    let j = braceStart
    for (; j < src.length; j++) {
      if (src[j] === '{') depth++
      else if (src[j] === '}') { depth--; if (depth === 0) break }
    }
    block = src.slice(braceStart, j + 1)
    from = j + 1
  }
  return block
}

describe('login/authGuard dictionary keys exist in every course pack', () => {
  const packs = readdirSync(join(ROOT, 'packs'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_'))

  it('found more than one pack (otherwise this guard checks nothing)', () => {
    expect(packs.length).toBeGreaterThan(1)
  })

  for (const p of packs) {
    const src = readFileSync(join(ROOT, 'packs', p.name, 'dictionaries.ts'), 'utf8')
    const loginBlocks = { type: nthBlock(src, 'login', 1), ru: nthBlock(src, 'login', 2), en: nthBlock(src, 'login', 3) }
    const authGuardBlocks = { type: nthBlock(src, 'authGuard', 1), ru: nthBlock(src, 'authGuard', 2), en: nthBlock(src, 'authGuard', 3) }

    it(`${p.name}: every new login key is in the type, ru AND en login block`, () => {
      for (const key of NEW_LOGIN_KEYS) {
        for (const [variant, block] of Object.entries(loginBlocks)) {
          expect(block, `${p.name} login.${variant}: отсутствует "${key}"`).toContain(`${key}:`)
        }
      }
    })

    it(`${p.name}: authGuard.checking is in the type, ru AND en authGuard block`, () => {
      for (const [variant, block] of Object.entries(authGuardBlocks)) {
        expect(block, `${p.name} authGuard.${variant}: отсутствует "checking"`).toContain('checking:')
      }
    })
  }
})
