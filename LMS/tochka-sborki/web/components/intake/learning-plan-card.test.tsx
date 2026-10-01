import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LearningPlanCard } from './learning-plan-card'
import { buildWeekMapContent } from '@/lib/intake/week-map-content'

const ru = buildWeekMapContent('ru')
const mod = ru.moduleByKind
const titles = Object.fromEntries(Object.values(mod).map(s => [s, `Название ${s}`]))
const profileWith = (week?: string[]) =>
  ({ answers: JSON.stringify(week ? { V_WEEK_MAP: week } : {}), char_level: 1, world_skin: 'wanderer' })

describe('LearningPlanCard + «Карта недели»', () => {
  it('есть карта: кликабельный маршрут в той же вкладке, «оставляю себе» со своей подписью', () => {
    const html = renderToStaticMarkup(
      <LearningPlanCard profile={profileWith(['ai_does|отчёт', 'ai_helps|посты', 'keep|разговор с мамой'])}
        zones={[]} locale="ru" moduleTitles={titles} />,
    )
    expect(html).toContain(`<h2`)
    expect(html).toContain(ru.routeHeading)
    expect(html).toContain(`href="/lessons/${mod.data}/"`)
    expect(html).toContain(`Название ${mod.data}</a>`)
    expect(html).toContain(ru.buckets.keep.moduleLead)
    expect(html).not.toContain('target="_blank"')
  })

  it('нет карты или меньше трёх дел — блока нет', () => {
    for (const week of [undefined, ['ai_does|отчёт', 'keep|посты']]) {
      const html = renderToStaticMarkup(<LearningPlanCard profile={profileWith(week)} zones={[]} locale="ru" moduleTitles={titles} />)
      expect(html).not.toContain(ru.routeHeading)
    }
  })

  it('частично разложена: только разложенные дела и счётчик остальных', () => {
    const html = renderToStaticMarkup(
      <LearningPlanCard profile={profileWith(['ai_does|отчёт', '-|посты', '-|созвоны'])} zones={[]} locale="ru" moduleTitles={titles} />,
    )
    expect(html).toContain(ru.routeHeading)
    expect(html).toContain(ru.unsortedInPlan(2))
    expect(html.match(/<li /g)).toHaveLength(1)
  })

  it('EN: /en links', () => {
    const html = renderToStaticMarkup(
      <LearningPlanCard profile={profileWith(['ai_does|report', 'ai_helps|blog posts', 'keep|family call'])} zones={[]} locale="en" />,
    )
    expect(html).toContain(buildWeekMapContent('en').routeHeading)
    expect(html).toContain(`href="/en/lessons/${mod.data}/"`)
  })
})
