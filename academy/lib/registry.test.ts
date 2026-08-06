import { describe, expect, it } from 'vitest'
import { getAcademy, getCourses } from './registry'

describe('registry bridge', () => {
  it('reads academy info from LMS/registry.json', () => {
    const a = getAcademy()
    expect(a.name).toBe('S.A.S.H.A')
    expect(a.url).toBe('https://academy.synergify.com')
  })

  it('localizes courses and keeps registry order', () => {
    const ru = getCourses('ru')
    expect(ru[0].slug).toBe('tochka-sborki')
    expect(ru[0].url).toBe('https://ai.synergify.com')
    expect(ru[0].name).toBe('Точка Сборки')
  })
})
