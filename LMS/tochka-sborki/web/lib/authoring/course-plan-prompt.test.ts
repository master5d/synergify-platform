import { describe, it, expect } from 'vitest'
import { buildCoursePlanPrompt } from './course-plan-prompt'
import { CORE_MANIFEST } from './manifest'

const input = {
  idea: 'курс осознанной практики для пар',
  locale: 'ru' as const,
  domain: 'https://example.love',
  manifestLabels: CORE_MANIFEST.map(r => r.label),
}

describe('buildCoursePlanPrompt', () => {
  const ru = buildCoursePlanPrompt(input)

  it('carries the idea and the domain', () => {
    expect(ru).toContain('курс осознанной практики для пар')
    expect(ru).toContain('https://example.love')
  })

  it('omits the domain line when domain is not given', () => {
    const noDomain = buildCoursePlanPrompt({ ...input, domain: undefined })
    expect(noDomain).not.toContain('Домен/сайт курса')
  })

  it('walks the fractal plan: references → ICP → spread → modules → units → JSON', () => {
    expect(ru).toMatch(/5-7 референс-курсов\/школ/)
    expect(ru).toContain('ICP')
    expect(ru).toMatch(/для кого \/ что на входе \/ что на выходе/)
    expect(ru).toMatch(/3-8 модулей/)
    expect(ru).toMatch(/2-6 юнитов/)
    expect(ru).toMatch(/рекурсивно провались/i)
    for (const part of ['концепты', 'hook', 'misconception', 'практики']) expect(ru).toContain(part)
  })

  it('prints the CourseOutline JSON schema with slug shapes and level', () => {
    expect(ru).toContain('"slug": "NN-kebab-case"')
    expect(ru).toContain('"slug": "u1-kebab-case"')
    for (const field of ['"name"', '"modules"', '"title"', '"description"', '"level"', '"units"', '"objective"']) {
      expect(ru).toContain(field)
    }
    expect(ru).toContain('CourseOutline JSON')
  })

  it('embeds every CORE_MANIFEST label as a tone constraint plus a de-hustle reminder', () => {
    for (const label of input.manifestLabels) expect(ru).toContain(`- ${label}`)
    expect(ru).toMatch(/Де-hustle/)
  })

  it('speaks the requested locale (ru default frame, en on demand)', () => {
    expect(ru).toContain('Помоги мне спланировать НОВЫЙ КУРС')
    const en = buildCoursePlanPrompt({ ...input, locale: 'en' })
    expect(en).toContain('You are helping me plan a WHOLE NEW COURSE')
    expect(en).toContain('Course domain/site: https://example.love')
    expect(en).toContain('- ' + input.manifestLabels[0])
    expect(en).toContain('"slug": "NN-kebab-case"')
  })
})
