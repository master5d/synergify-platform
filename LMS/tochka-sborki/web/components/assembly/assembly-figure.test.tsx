import { beforeAll, describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: () => {} }) }))

import { AssemblyFigure } from './assembly-figure'
import { COURSE } from '@/lib/course'
import { ASSEMBLY_MAP } from '@/lib/course/assembly-map'
import { MACHINE } from '@/lib/course/assembly-machine'
import { BUDGET_BYTES } from '../../scripts/check-assembly-weight.mjs'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PACK_DIR } from '@/lib/pack'

// Геометрия растра — файл pack'а, есть не у каждого: грузится по пути (как глоссарий), чтобы tsc другого pack'а не падал.
type Poly = readonly (readonly [number, number])[]
type MachineData = { PARTS: Partial<Record<string, Poly>>; PART_MARKERS: Record<string, unknown>; SHELLS: Record<string, Poly> }
const DATA_FILE = join(PACK_DIR, 'course', 'assembly-machine.data.ts')
const HAS_DATA = existsSync(DATA_FILE)

describe.runIf(COURSE.features.assemblyMap)('AssemblyFigure', () => {
  const unit = { module: '06-audio-pipeline', unit: 'u5-schedule' }

  it('сгенерированная иллюстрация подписана честно на языке страницы (условие исключения владельца 2026-10-12)', () => {
    expect(MACHINE?.credit?.ru, 'у машины курса нет подписи происхождения').toBeTruthy()
    expect(renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} />)).toContain(`class="am-credit">${MACHINE!.credit!.ru}<`)
    expect(renderToStaticMarkup(<AssemblyFigure locale="en" current={unit} />)).toContain(`class="am-credit">${MACHINE!.credit!.en}<`)
  })

  it('разметка полной картины укладывается в бюджет 300 КБ (меряется здесь: на сайте юниты за дверью рисуются в браузере)', () => {
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

// Владелец 2026-10-14: «Разрез двигателя» подсвечивал заднее колесо — у детали, которой нет на картинке, была выдуманная зона.
describe.runIf(COURSE.features.assemblyMap && HAS_DATA)('AssemblyFigure: зоны только у нарисованного', () => {
  const unit = { module: '06-audio-pipeline', unit: 'u5-schedule' }
  let PARTS: MachineData['PARTS']
  let PART_MARKERS: MachineData['PART_MARKERS']
  let SHELLS: MachineData['SHELLS']
  beforeAll(async () => {
    ;({ PARTS, PART_MARKERS, SHELLS } = (await import(pathToFileURL(DATA_FILE).href)) as MachineData)
  })

  it('зону и метку получают только детали, нарисованные на картинке', () => {
    const partIds = new Set(ASSEMBLY_MAP.parts.map((p) => p.id))
    for (const id of Object.keys(PARTS)) expect(partIds.has(id), `зона у несуществующей детали ${id}`).toBe(true)
    expect(Object.keys(PART_MARKERS).sort()).toEqual(Object.keys(PARTS).sort())
    const html = renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} />)
    expect(html.match(/data-am-marker="part"/g)).toHaveLength(Object.keys(PARTS).length)
    expect(Object.keys(PARTS).length).toBeLessThan(ASSEMBLY_MAP.parts.length)
  })

  it('прожектор: нарисованная деталь — на ней, ненарисованная — на корпусе её узла', () => {
    const path = (poly: Poly) => `M ${poly.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`
    const at = (u: string) => renderToStaticMarkup(<AssemblyFigure locale="ru" current={{ module: '10-model-training', unit: u }} />)
    expect(PARTS['dyno.engine-cutaway']).toBeDefined()
    expect(at('u1-inside-the-model')).toContain(`d="${path(PARTS['dyno.engine-cutaway']!)}"`)
    expect(PARTS['dyno.additive-barrel']).toBeUndefined()
    expect(at('u2-data-is-the-work')).toContain(`d="${path(SHELLS.dyno)}"`)
  })
})

describe.runIf(!COURSE.features.assemblyMap)('AssemblyFigure у курса без картины', () => {
  it('ничего не рисует', () => {
    expect(renderToStaticMarkup(<AssemblyFigure locale="ru" current={null} />)).toBe('')
  })
})
