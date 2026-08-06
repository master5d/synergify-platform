import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const MENU = readFileSync(join(HERE, 'settings-menu.tsx'), 'utf8')
const NAV = readFileSync(join(HERE, 'nav.tsx'), 'utf8')

/**
 * Переключатели отображения свёрнуты в одну кнопку. Свернуть — не значит
 * выбросить: тема, режим подачи, экономия трафика и выбор системы должны
 * остаться доступными, просто в один клик глубже.
 *
 * Риск именно такой: при следующей уборке шапки легко «упростить» панель,
 * потеряв один из переключателей, — и заметит это только тот, кто им
 * пользовался (например, человек на медленном канале, живущий в Lite).
 */
describe('панель настроек сохраняет все переключатели', () => {
  it.each([
    ['тема', 'ThemeToggle'],
    ['режим подачи', 'RpgModeToggle'],
    ['экономия трафика', 'LiteToggle'],
  ])('%s на месте', (_name, component) => {
    expect(MENU, `${component} пропал из панели`).toContain(`<${component} locale={locale} />`)
  })

  it('выбор системы (mac/windows) на месте', () => {
    expect(MENU).toContain('🍎')
    expect(MENU).toContain('🪟')
    expect(MENU).toMatch(/onClick=\{onToggleOs\}/)
  })

  it('в самой шапке переключателей больше нет — иначе сворачивание бессмысленно', () => {
    for (const c of ['ThemeToggle', 'RpgModeToggle', 'LiteToggle']) {
      expect(NAV, `${c} снова развёрнут в шапке`).not.toContain(`<${c} `)
    }
    expect(NAV, 'меню настроек не подключено').toContain('<SettingsMenu')
  })

  it('язык и вход остались снаружи: это навигация, а не настройки', () => {
    expect(NAV).toMatch(/otherLocale === 'en' \? 'EN' : 'RU'/)
    expect(NAV).toMatch(/t\.nav\.login|t\.nav\.logout/)
  })
})

describe('панель доступна с клавиатуры и озвучивается', () => {
  it('кнопка объявляет состояние и связь с панелью', () => {
    expect(MENU).toMatch(/aria-expanded=\{open\}/)
    expect(MENU).toMatch(/aria-controls=\{panelId\}/)
    expect(MENU).toMatch(/aria-haspopup="dialog"/)
  })

  it('панель — диалог с именем', () => {
    expect(MENU).toMatch(/role="dialog"/)
    expect(MENU).toMatch(/aria-label=\{t\.heading\}/)
  })

  it('Escape закрывает и возвращает фокус на кнопку', () => {
    expect(MENU).toMatch(/e\.key === 'Escape'/)
    expect(MENU).toMatch(/buttonRef\.current\?\.focus\(\)/)
  })

  it('клик мимо закрывает панель', () => {
    expect(MENU).toMatch(/mousedown/)
    expect(MENU).toMatch(/wrapRef\.current\?\.contains/)
  })

  it('подписчики событий снимаются при закрытии', () => {
    // Иначе каждое открытие вешает новый слушатель на document.
    expect(MENU).toMatch(/removeEventListener\('mousedown'/)
    expect(MENU).toMatch(/removeEventListener\('keydown'/)
  })
})

describe('обе локали', () => {
  it('у всех подписей есть русская и английская версия', () => {
    const ru = /ru:\s*\{([\s\S]*?)\},\s*en:/.exec(MENU)?.[1] ?? ''
    const en = /en:\s*\{([\s\S]*?)\},\s*\}/.exec(MENU)?.[1] ?? ''
    expect(ru).not.toBe('')
    expect(en).not.toBe('')
    const keys = (block: string) => [...block.matchAll(/(\w+):\s*'/g)].map((m) => m[1]).sort()
    expect(keys(en), 'наборы ключей RU и EN разошлись').toEqual(keys(ru))
    expect(/[а-яё]/i.test(ru), 'русский блок без кириллицы').toBe(true)
    expect(/[а-яё]/i.test(en), 'в английский блок затесалась кириллица').toBe(false)
  })
})

describe('панель помещается на узком экране', () => {
  it('на мобильном прижата к краям окна, а не к кнопке', () => {
    // Привязанная к кнопке, она уезжала за левый край (замер: left = -24px).
    expect(MENU).toMatch(/@media \(max-width: 720px\)[\s\S]*?\.settings-panel/)
    expect(MENU).toMatch(/position: fixed !important/)
  })

  it('отступ сверху считается по фактической высоте шапки', () => {
    // Шапка на мобильном переносится в несколько рядов: 44px или 123px.
    expect(MENU).toMatch(/closest\('nav'\)/)
    expect(MENU).toMatch(/--settings-panel-top/)
  })
})
