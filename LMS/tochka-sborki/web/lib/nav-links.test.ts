import { describe, expect, it } from 'vitest'
import { secondaryNavLinks, sanitizeInternalPath, withRedirectParam, type NavLink } from './nav-links'

const NAV = {
  brand: 'Курс', syllabus: 'Программа', roadmap: 'Roadmap', cheatsheet: 'Шпаргалка',
  feedback: 'Фидбек', certificate: 'Сертификат', questLog: '⬡ Квест-лог', profile: 'Профиль',
  synergems: 'Синергемы', support: 'Поддержать', store: 'Магазин', login: '→ Войти', logout: 'Выйти',
  osTitle: 'Сменить OS', osCurrent: () => '', theme: { title: '', light: '', dark: '', system: '' },
  rpgMode: { title: '', rpg: '', plain: '' },
} as const

describe('secondaryNavLinks', () => {
  it('без rpg и без входа — только базовые пункты, никакого квест-лога', () => {
    const links = secondaryNavLinks({
      locale: 'ru', email: null, features: { rpg: false, certificate: false }, nav: NAV as any, questLogLabel: NAV.questLog,
    })
    expect(links.map((l) => l.key)).toEqual(['syllabus', 'roadmap', 'cheatsheet', 'feedback', 'support'])
  })

  it('rpg=true без входа — квест-лог/профиль/синергемы всё равно не показываются (гейт по email)', () => {
    const links = secondaryNavLinks({
      locale: 'ru', email: null, features: { rpg: true, certificate: false }, nav: NAV as any, questLogLabel: NAV.questLog,
    })
    expect(links.map((l) => l.key)).not.toContain('questLog')
  })

  it('rpg=true и вход есть — квест-лог/профиль/синергемы впереди программы', () => {
    const links = secondaryNavLinks({
      locale: 'ru', email: 'a@b.c', features: { rpg: true, certificate: false }, nav: NAV as any, questLogLabel: NAV.questLog,
    })
    expect(links.map((l) => l.key)).toEqual(['questLog', 'profile', 'synergems', 'syllabus', 'roadmap', 'cheatsheet', 'feedback', 'support'])
  })

  it('certificate=true добавляет пункт с декоративным ◆', () => {
    const links = secondaryNavLinks({
      locale: 'ru', email: null, features: { rpg: false, certificate: true }, nav: NAV as any, questLogLabel: NAV.questLog,
    })
    const cert = links.find((l): l is NavLink => l.key === 'certificate')
    expect(cert?.deco).toBe('◆')
  })

  it('мобильное меню не может показать больше пунктов, чем десктоп для тех же флагов', () => {
    const flags = [{ rpg: false, certificate: false }, { rpg: true, certificate: true }, { rpg: false, certificate: true }]
    for (const features of flags) {
      const a = secondaryNavLinks({ locale: 'ru', email: 'x@y.z', features, nav: NAV as any, questLogLabel: NAV.questLog })
      const b = secondaryNavLinks({ locale: 'ru', email: 'x@y.z', features, nav: NAV as any, questLogLabel: NAV.questLog })
      expect(a.map((l) => l.key)).toEqual(b.map((l) => l.key))
    }
  })

  it('en-локаль префиксует ссылки /en', () => {
    const links = secondaryNavLinks({
      locale: 'en', email: null, features: { rpg: false, certificate: false }, nav: NAV as any, questLogLabel: NAV.questLog,
    })
    expect(links.every((l) => l.href.startsWith('/en/'))).toBe(true)
  })
})

describe('sanitizeInternalPath', () => {
  it.each([
    '/lessons/01-introduction/',
    '/praktika/lessons/01-introduction/',
    '/en/roadmap/',
    '/x?y=1&z=2',
  ])('внутренний путь %s проходит', (p) => {
    expect(sanitizeInternalPath(p)).toBe(p)
  })

  it.each([
    null,
    undefined,
    '',
    '//evil.com',
    '///evil.com',
    'https://evil.com',
    'http://evil.com/x',
    'javascript:alert(1)',
    '/\\evil.com',
    '/\\\\evil.com',
    'evil.com/x',
    '/x\ty',
  ])('внешний/битый путь %s отбрасывается', (p) => {
    expect(sanitizeInternalPath(p as string | null)).toBeNull()
  })
})

describe('withRedirectParam', () => {
  it('добавляет валидный redirect', () => {
    expect(withRedirectParam('/login/', '/lessons/01/')).toBe('/login/?redirect=%2Flessons%2F01%2F')
  })

  it('не трогает href при внешнем redirect (open-redirect)', () => {
    expect(withRedirectParam('/login/', 'https://evil.com')).toBe('/login/')
  })

  it('не трогает href без redirect', () => {
    expect(withRedirectParam('/login/', null)).toBe('/login/')
  })

  it('дописывает через & если у href уже есть query', () => {
    expect(withRedirectParam('/login/?utm_source=x', '/roadmap/')).toBe('/login/?utm_source=x&redirect=%2Froadmap%2F')
  })
})
