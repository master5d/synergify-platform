import { describe, expect, it } from 'vitest'
import { getAcademy, getCourses, localizedCourseUrl } from './registry'

describe('registry bridge', () => {
  it('reads academy info from LMS/registry.json', () => {
    const a = getAcademy()
    expect(a.name).toBe('Synergema Authentica Starseed Holon Academy')
    expect(a.url).toBe('https://academy.synergify.com')
  })

  it('localizes courses and keeps registry order', () => {
    const ru = getCourses('ru')
    expect(ru[0].slug).toBe('tochka-sborki')
    expect(ru[0].url).toBe('https://ai.synergify.com')
    expect(ru[0].name).toBe('Точка Сборки')
  })

  it('курс в подпути академии ведёт EN-главную на свой /en/, внешний курс — как есть', () => {
    const A = 'https://academy.synergify.com'
    expect(localizedCourseUrl(`${A}/retrit`, 'en', A)).toBe(`${A}/retrit/en/`)
    expect(localizedCourseUrl(`${A}/retrit/`, 'en', A)).toBe(`${A}/retrit/en/`)
    expect(localizedCourseUrl(`${A}/retrit`, 'ru', A)).toBe(`${A}/retrit`)
    expect(localizedCourseUrl('https://ai.synergify.com', 'en', A)).toBe('https://ai.synergify.com')
    expect(localizedCourseUrl(`${A}/retrit`, 'en', null)).toBe(`${A}/retrit`)
    const en = getCourses('en').find((c) => c.slug === 'retreat')
    expect(en?.url).toBe(`${A}/retrit/en/`)
    expect(getCourses('en').find((c) => c.slug === 'one-to-one')?.url).toBe(`${A}/odin-na-odin/en/`)
    expect(getCourses('ru').find((c) => c.slug === 'one-to-one')?.url).toBe(`${A}/odin-na-odin`)
  })
})
