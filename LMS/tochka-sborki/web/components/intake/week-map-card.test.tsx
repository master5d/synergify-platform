import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { WeekMapCard } from './week-map-card'
import { WEEK_MAP_MAX_TASKS } from '@/lib/intake/week-map'
import { buildWeekMapContent } from '@/lib/intake/week-map-content'

const noop = () => {}
const ru = buildWeekMapContent('ru')
const kindModule = ru.moduleByKind

describe('WeekMapCard render', () => {
  it('empty: input, optional-step hint, no route', () => {
    const html = renderToStaticMarkup(<WeekMapCard locale="ru" value={undefined} onChange={noop} />)
    expect(html).toContain(ru.eyebrow)
    expect(html).toContain('id="week-map-task"')
    expect(html).toContain(ru.empty)
    expect(html).not.toContain(ru.routeHeading)
  })

  it('unsorted task: three bucket buttons, nothing pressed, route not shown yet', () => {
    const html = renderToStaticMarkup(
      <WeekMapCard locale="ru" value={['-|посты', 'ai_does|отчёт', 'keep|созвоны']} onChange={noop} />,
    )
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(2)
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(7)
    expect(html).toContain(ru.unsortedHint)
    expect(html).not.toContain(ru.routeHeading)
  })

  it('ready: shows the personal route with module titles and locale-prefixed links; keep has its own lead', () => {
    // Названия по слагам — без допущений о раскладке pack'а (у living-practice все типы ведут в один модуль).
    const titles = Object.fromEntries(Object.values(kindModule).map(s => [s, `Название ${s}`]))
    const html = renderToStaticMarkup(
      <WeekMapCard locale="ru" value={['ai_does|отчёт', 'ai_helps|посты', 'keep|разговор с мамой']} onChange={noop} moduleTitles={titles} />,
    )
    expect(html).toContain(ru.routeHeading)
    expect(html).toContain(`href="/lessons/${kindModule.data}/"`)
    expect(html).toContain(`Название ${kindModule.data}</a>`)
    expect(html).toContain(ru.buckets.keep.moduleLead)
    expect(html).toContain('target="_blank"')
  })

  it('EN: English copy and /en prefix; falls back to the slug without titles', () => {
    const en = buildWeekMapContent('en')
    const html = renderToStaticMarkup(
      <WeekMapCard locale="en" value={['ai_does|report', 'ai_helps|blog posts', 'keep|family call']} onChange={noop} />,
    )
    expect(html).toContain(en.routeHeading)
    expect(html).toContain(`href="/en/lessons/${en.moduleByKind.data}/"`)
    expect(html).toContain(`>${en.moduleByKind.data}</a>`)
  })

  it(`at ${WEEK_MAP_MAX_TASKS} tasks the input is disabled and the limit is explained`, () => {
    const value = Array.from({ length: WEEK_MAP_MAX_TASKS }, (_, i) => `keep|дело ${'абвгдежз'[i]}`)
    const html = renderToStaticMarkup(<WeekMapCard locale="ru" value={value} onChange={noop} />)
    expect(html).toMatch(/<input[^>]*disabled/)
    expect(html).toContain(ru.limitReached)
  })
})
