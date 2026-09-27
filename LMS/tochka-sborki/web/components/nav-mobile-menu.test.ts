import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const MENU = readFileSync(join(HERE, 'nav-mobile-menu.tsx'), 'utf8')
const NAV = readFileSync(join(HERE, 'nav.tsx'), 'utf8')

/**
 * BACKLOG «Мобильная навигация без меню»: на ≤720px `.nav-secondary-links` пропадает
 * без замены. Бургер должен быть доступен так же, как уже проверенная панель настроек —
 * этот файл держит тот же контракт (aria-expanded/aria-controls, Escape, клик мимо,
 * список пунктов из lib/nav-links.ts), а не переизобретает его.
 */
describe('бургер вторичной навигации доступен с клавиатуры и озвучивается', () => {
  it('кнопка объявляет состояние и связь с панелью', () => {
    expect(MENU).toMatch(/aria-expanded=\{open\}/)
    expect(MENU).toMatch(/aria-controls=\{panelId\}/)
    expect(MENU).toMatch(/aria-haspopup="dialog"/)
  })

  it('панель — диалог с именем', () => {
    expect(MENU).toMatch(/role="dialog"/)
    expect(MENU).toMatch(/aria-label=\{label\}/)
  })

  it('Escape закрывает и возвращает фокус на кнопку', () => {
    expect(MENU).toMatch(/e\.key === 'Escape'/)
    expect(MENU).toMatch(/buttonRef\.current\?\.focus\(\)/)
  })

  it('клик мимо закрывает панель, подписчики снимаются', () => {
    expect(MENU).toMatch(/mousedown/)
    expect(MENU).toMatch(/wrapRef\.current\?\.contains/)
    expect(MENU).toMatch(/removeEventListener\('mousedown'/)
    expect(MENU).toMatch(/removeEventListener\('keydown'/)
  })

  it('пункты приходят готовым списком — бургер не решает, что показывать', () => {
    expect(MENU).toMatch(/links\.map/)
    expect(MENU, 'бургер не должен знать флаги курса напрямую').not.toMatch(/COURSE\.features/)
  })
})

describe('бургер виден только на узком экране, десктоп не меняется', () => {
  it('скрыт по умолчанию, показан внутри брейкпоинта ≤720px', () => {
    const base = NAV.slice(0, NAV.indexOf('@media'))
    expect(base, 'бургер виден на десктопе по умолчанию').toMatch(/\.nav-mobile-menu\s*\{\s*display:\s*none/)
    const mobileBlock = /@media \(max-width: 720px\)[\s\S]*?(?=@media|$)/.exec(NAV)?.[0] ?? ''
    expect(mobileBlock, 'бургер не показывается в мобильном брейкпоинте').toMatch(/\.nav-mobile-menu\s*\{\s*display:\s*flex/)
  })

  it('nav подключает NavMobileMenu и кормит его тем же списком, что десктопную полосу', () => {
    expect(NAV).toMatch(/<NavMobileMenu/)
    expect(NAV).toMatch(/secondaryNavLinks\(/)
  })
})
