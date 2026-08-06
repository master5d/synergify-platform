import { describe, it, expect } from 'vitest'
import { buildModulePlanPrompt } from './module-plan-prompt'

const input = {
  courseName: 'Практика в живой связи',
  packSlug: 'living-practice',
  idea: 'модуль астрологии внутреннего неба',
  locale: 'ru' as const,
  manifestLabels: [
    'scarcity: искусственный дедлайн («только сегодня»)',
    'обещание практики: «исцелит/вылечит» (медицинское обещание)',
  ],
}

describe('buildModulePlanPrompt', () => {
  const ru = buildModulePlanPrompt(input)

  it('carries the idea, the course and the pack', () => {
    expect(ru).toContain('модуль астрологии внутреннего неба')
    expect(ru).toContain('Практика в живой связи')
    expect(ru).toContain('living-practice')
  })

  it('walks the fractal plan: references → ICP → spread → units → JSON', () => {
    expect(ru).toMatch(/5-7 референс-курсов/)
    expect(ru).toContain('ICP')
    expect(ru).toMatch(/для кого \/ что на входе \/ что на выходе/)
    expect(ru).toMatch(/3-6 юнитов/)
    expect(ru).toMatch(/рекурсивно провались/i)
    for (const part of ['концепты', 'hook', 'misconception', 'практики']) expect(ru).toContain(part)
  })

  it('prints the ModuleOutline JSON schema with slug shapes', () => {
    expect(ru).toContain('"slug": "NN-kebab-case"')
    expect(ru).toContain('"slug": "u1-kebab-case"')
    for (const field of ['"author"', '"title"', '"description"', '"objective"', '"units"']) {
      expect(ru).toContain(field)
    }
  })

  it('embeds every manifest label as a tone constraint', () => {
    for (const label of input.manifestLabels) expect(ru).toContain(`- ${label}`)
  })

  it('speaks the requested locale (ru default frame, en on demand)', () => {
    expect(ru).toContain('Помоги мне спланировать')
    const en = buildModulePlanPrompt({ ...input, locale: 'en' })
    expect(en).toContain('You are helping me plan')
    expect(en).toContain('- ' + input.manifestLabels[0])
    expect(en).toContain('"slug": "NN-kebab-case"')
  })
})
