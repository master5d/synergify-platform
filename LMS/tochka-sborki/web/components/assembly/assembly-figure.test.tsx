import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: () => {} }) }))

import { AssemblyFigure } from './assembly-figure'
import { COURSE } from '@/lib/course'
import { ASSEMBLY_MAP } from '@/lib/course/assembly-map'
import { BUDGET_BYTES } from '../../scripts/check-assembly-weight.mjs'

describe.runIf(COURSE.features.assemblyMap)('AssemblyFigure', () => {
  const unit = { module: '06-audio-pipeline', unit: 'u5-schedule' }

  it('разметка полной картины укладывается в бюджет 200 КБ (меряется здесь: на сайте юниты за дверью рисуются в браузере)', () => {
    const html = renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} interactive />)
    expect(Buffer.byteLength(html, 'utf8')).toBeLessThanOrEqual(BUDGET_BYTES)
  })

  it('рисует все узлы и детали; без прогресса всё контуром, текущая деталь подсвечена', () => {
    const html = renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} />)
    expect(html).toContain('data-am-figure')
    for (const n of ASSEMBLY_MAP.nodes) expect(html).toContain(`data-am-node="${n.id}"`)
    expect(html.match(/data-am-part="/g)).toHaveLength(ASSEMBLY_MAP.parts.length)
    expect(html.match(/data-am-shell="/g), 'корпус узла — ровно один <g data-am-shell> на узел').toHaveLength(ASSEMBLY_MAP.nodes.length)
    expect(html).not.toContain('data-am-state="built"')
    expect(html).toMatch(/data-am-part="wipers\.timer"[^>]*data-am-current="true"/)
  })

  it('без interactive — role="img", узлы не фокусируются; с interactive — role="group" и узлы-ссылки', () => {
    const still = renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} />)
    expect(still).toContain('role="img"')
    expect(still).not.toContain('tabindex="0"')
    const live = renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} interactive />)
    expect(live).toContain('role="group"')
    expect(live.match(/role="link"/g)).toHaveLength(ASSEMBLY_MAP.nodes.length)
  })

  it('заголовок, описание и скрытый список на языке страницы', () => {
    const ru = renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} />)
    expect(ru).toContain('Машина, которую ты собираешь')
    expect(ru).toContain('Сейчас — Датчик дождя и дворники: pipeline → Таймер автозапуска.')
    expect(ru).toContain('class="am-sr"')
    const en = renderToStaticMarkup(<AssemblyFigure locale="en" current={unit} />)
    expect(en).toContain('The machine you are building')
    expect(en).toContain('Now — Rain sensor and wipers: pipeline → Auto-start timer.')
  })

  it('юнит-фаза подсвечивает корпус узла', () => {
    const html = renderToStaticMarkup(<AssemblyFigure locale="ru" current={{ module: '06-audio-pipeline', unit: 'u1-activation' }} />)
    expect(html).toMatch(/data-am-node="wipers"[^>]*data-am-current="true"/)
  })
})

describe.runIf(!COURSE.features.assemblyMap)('AssemblyFigure у курса без картины', () => {
  it('ничего не рисует', () => {
    expect(renderToStaticMarkup(<AssemblyFigure locale="ru" current={null} />)).toBe('')
  })
})
