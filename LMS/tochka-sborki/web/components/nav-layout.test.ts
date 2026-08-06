import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const NAV = readFileSync(join(HERE, 'nav.tsx'), 'utf8')

/**
 * Шапка уже дважды распирала страницу горизонтальным скроллом: сначала на
 * мобильном (правая группа 522px при экране 390), потом на широком экране —
 * у вошедшего пользователя в английской версии добавляются три пункта, слова
 * длиннее, а служебные переключатели справа занимают ~460px и не сжимаются.
 *
 * Оба раза чинилось брейкпоинтом, и оба раза следующая ширина оказывалась
 * непокрытой. Правило теперь структурное: переполняться разрешено ТОЛЬКО полосе
 * ссылок, и это свойство держится здесь.
 *
 * Тест смотрит на исходник, а не на отрендеренный DOM: браузера в сюите нет,
 * а живая проверка (Playwright, 1900/1440/1024/390) — отдельный ручной шаг,
 * который этот гвард не заменяет, но напоминает о нём при правке.
 */
describe('макет шапки не даёт странице горизонтальный скролл', () => {
  it('полоса ссылок прокручивается сама и умеет сжиматься', () => {
    const rule = /\.nav-secondary-links\s*\{[\s\S]*?\}/.exec(NAV)?.[0] ?? ''
    expect(rule, '.nav-secondary-links: нет базового правила').not.toBe('')
    expect(rule, 'полоса не сжимается — распирает шапку').toMatch(/min-width:\s*0/)
    expect(rule, 'полоса не прокручивается — лишнее уедет в страницу').toMatch(/overflow-x:\s*auto/)
    expect(rule, 'полоса не тянется — справа останется дыра').toMatch(/flex:\s*1 1 auto/)
  })

  it('правила лежат вне медиазапросов — иначе непокрытая ширина снова сломается', () => {
    // Всё, что до первого @media, применяется на любой ширине.
    const base = NAV.slice(0, NAV.indexOf('@media'))
    expect(base, 'базовое правило полосы уехало в брейкпоинт').toContain('.nav-secondary-links')
    expect(base).toMatch(/overflow-x:\s*auto/)
  })

  it('служебные переключатели не сжимаются в кашу', () => {
    expect(NAV).toMatch(/nav > div:last-of-type > \*:not\(\.nav-secondary-links\)\s*\{[\s\S]*?flex:\s*0 0 auto/)
  })

  it('бренд не сжимается и отделён от пунктов', () => {
    expect(NAV).toMatch(/nav > a:first-of-type\s*\{[\s\S]*?flex:\s*0 0 auto/)
    // Без зазора логотип слипался с первым пунктом: «Tochka SborkiMy lessons».
    expect(NAV).toMatch(/gap:\s*'1\.25rem'/)
  })

  it('у ссылок запрещён перенос — иначе полоса растёт в высоту', () => {
    expect(NAV).toMatch(/\.nav-secondary-links a\s*\{[\s\S]*?white-space:\s*nowrap/)
  })
})

/**
 * Находки со скриншота владельца (вид вошедшего, /support/, ~1900px).
 */
describe('шапка вошедшего пользователя', () => {
  const CSS = readFileSync(join(HERE, '..', 'app', 'globals.css'), 'utf8')

  it('ссылка «перейти к содержимому» не накрывает шапку', () => {
    // Была absolute поверх и закрывала логотип с первыми пунктами: человек,
    // идущий с клавиатуры, терял из виду ту самую навигацию, мимо которой
    // ссылка предлагает перепрыгнуть.
    const focus = /\.skip-link:focus\s*\{[\s\S]*?\}/.exec(CSS)?.[0] ?? ''
    expect(focus, 'нет правила для .skip-link:focus').not.toBe('')
    expect(focus, 'ссылка снова всплывает поверх шапки').toMatch(/position:\s*static/)
  })

  it('в шапке показывается часть адреса до @, полный — в подсказке', () => {
    // Полный адрес занимал 158px и выдавливал «Сертификат» за край полосы.
    expect(NAV).toMatch(/email\.split\('@'\)\[0\]/)
    expect(NAV).toMatch(/title=\{email\}/)
    expect(NAV).toMatch(/textOverflow:\s*'ellipsis'/)
  })

  it('край полосы затухает, когда пункты не помещаются', () => {
    // Обрезанное слово должно читаться как «есть продолжение», а не как
    // сломанная вёрстка.
    expect(NAV).toMatch(/mask-image:\s*linear-gradient/)
  })
})
