import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: () => {} }) }))

import { UnitAssembly } from './unit-assembly'
import { COURSE } from '@/lib/course'

describe.runIf(COURSE.features.assemblyMap)('UnitAssembly', () => {
  it('первый юнит модуля — полная интерактивная картина с подписью', () => {
    const html = renderToStaticMarkup(<UnitAssembly moduleSlug="06-audio-pipeline" unitSlug="u1-activation" unitIndex={0} locale="ru" />)
    expect(html).toContain('am-unit--full')
    expect(html).toContain('role="group"')
    expect(html).toContain('Ты собираешь: Датчик дождя и дворники: pipeline')
    expect(html).not.toContain('<dialog')
  })

  it('остальные юниты — миниатюра-кнопка с подписью; полная картина не смонтирована до открытия', () => {
    const html = renderToStaticMarkup(<UnitAssembly moduleSlug="06-audio-pipeline" unitSlug="u5-schedule" unitIndex={4} locale="en" />)
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain("You&#x27;re building: Rain sensor and wipers: pipeline → Auto-start timer")
    expect(html).toContain('<dialog')
    expect(html.match(/data-am-figure/g)).toHaveLength(1)
    expect(html).toContain('role="img"')
  })
})

describe.runIf(!COURSE.features.assemblyMap)('UnitAssembly у курса без картины', () => {
  it('ничего не рисует', () => {
    expect(renderToStaticMarkup(<UnitAssembly moduleSlug="m" unitSlug="u" unitIndex={0} locale="ru" />)).toBe('')
  })
})

describe('страница юнита', () => {
  it('ставит UnitAssembly за флагом курса, а не за именем pack\'а', () => {
    const src = readFileSync(join(process.cwd(), 'components/pages/unit-page.tsx'), 'utf8')
    expect(src).toMatch(/COURSE\.features\.assemblyMap && <UnitAssembly/)
  })
})
