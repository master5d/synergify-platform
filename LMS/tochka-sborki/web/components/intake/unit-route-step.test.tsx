import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { UnitRouteStep } from './unit-route-step'
import { TASK_ROUTES, TASK_ROUTE_COPY } from '@/lib/course/task-routes'
import { encodeTaskRouteAnswer, routeStepsForUnit, unitModule } from '@/lib/intake/task-route'
import { unitStepLabel } from '@/lib/intake/task-route-content'

const hasRoutes = TASK_ROUTES.length > 0
const itR = it.runIf(hasRoutes)

function profileFor(key: string, mode = 'task') {
  return {
    answers: JSON.stringify({
      V_TASK_MODE: mode,
      V_OUTCOME: 'контент для mortgage-бизнеса',
      V_TASK_ROUTE: encodeTaskRouteAnswer({ key, source: 'llm', text: 'контент для mortgage-бизнеса' }),
    }),
  }
}
const split = (unit: string) => [unitModule(unit), unit.split('/')[1]] as const

describe('routeStepsForUnit', () => {
  it('нет русла — пусто', () => {
    expect(routeStepsForUnit(null, '04-prompt-engineering', 'u2-spec-formula')).toEqual([])
  })
  itR('каждый шаг каждого русла находится на своём юните с номером как в плане (1-based)', () => {
    for (const r of TASK_ROUTES) {
      r.steps.forEach((s, i) => {
        const [m, u] = split(s.unit)
        expect(routeStepsForUnit(r, m, u).some(x => x.index === i + 1 && x.step === s)).toBe(true)
      })
    }
  })
  itR('юнит проверки «стоит ли» (шаг 0) сам по себе шагом не считается', () => {
    for (const r of TASK_ROUTES) {
      const [m, u] = split(r.check.unit)
      const hits = routeStepsForUnit(r, m, u)
      expect(hits.every(h => h.index >= 1)).toBe(true)
    }
  })
})

describe('UnitRouteStep — плашка «Шаг N твоей задачи» на странице юнита', () => {
  itR('юнит — шаг русла ученика: номер, название, действие и ссылка на план', () => {
    const r = TASK_ROUTES[0]
    const step = r.steps[1]
    const [m, u] = split(step.unit)
    const html = renderToStaticMarkup(<UnitRouteStep moduleSlug={m} unitSlug={u} locale="ru" profile={profileFor(r.key)} />)
    const idx = routeStepsForUnit(r, m, u).map(x => x.index)
    expect(idx).toContain(2)
    for (const n of idx) expect(html).toContain(unitStepLabel(n, 'ru'))
    expect(html).toContain(step.title.ru)
    expect(html).toContain(step.action.ru)
    expect(html).toContain('href="/character/#learning-plan"')
    expect(html).toContain(TASK_ROUTE_COPY.unitPlanLink.ru)
  })

  itR('EN: своя локаль и ссылка на /en/', () => {
    const r = TASK_ROUTES[0]
    const [m, u] = split(r.steps[0].unit)
    const html = renderToStaticMarkup(<UnitRouteStep moduleSlug={m} unitSlug={u} locale="en" profile={profileFor(r.key)} />)
    expect(html).toContain(unitStepLabel(1, 'en'))
    expect(html).toContain(r.steps[0].action.en)
    expect(html).toContain('href="/en/character/#learning-plan"')
  })

  itR('юнит не из русла — плашки нет', () => {
    const r = TASK_ROUTES[0]
    const inRoute = new Set(r.steps.map(s => s.unit))
    const html = renderToStaticMarkup(<UnitRouteStep moduleSlug="00-nowhere" unitSlug="u1-none" locale="ru" profile={profileFor(r.key)} />)
    expect(inRoute.has('00-nowhere/u1-none')).toBe(false)
    expect(html).toBe('')
  })

  itR('режим «хочу научиться» или нет профиля — плашки нет, даже на юните русла', () => {
    const r = TASK_ROUTES[0]
    const [m, u] = split(r.steps[0].unit)
    expect(renderToStaticMarkup(<UnitRouteStep moduleSlug={m} unitSlug={u} locale="ru" profile={profileFor(r.key, 'learn')} />)).toBe('')
    expect(renderToStaticMarkup(<UnitRouteStep moduleSlug={m} unitSlug={u} locale="ru" profile={null} />)).toBe('')
  })

  it('без переданного профиля первый рендер (SSR статического экспорта) пуст — русло только на клиенте', () => {
    expect(renderToStaticMarkup(<UnitRouteStep moduleSlug="04-prompt-engineering" unitSlug="u2-spec-formula" locale="ru" />)).toBe('')
  })

  it('копия плашки есть в обеих локалях и несёт {n}', () => {
    expect(TASK_ROUTE_COPY.unitStepLabel.ru).toContain('{n}')
    expect(TASK_ROUTE_COPY.unitStepLabel.en).toContain('{n}')
    expect(unitStepLabel(3, 'ru')).toMatch(/3/)
  })
})
