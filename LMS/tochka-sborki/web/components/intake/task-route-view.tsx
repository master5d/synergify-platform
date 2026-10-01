import type { CSSProperties } from 'react'
import type { Locale } from '@/lib/intake/types'
import { unitModule, type TaskRoute } from '@/lib/intake/task-route'
import { buildTaskRouteContent, routeResultText, routeUnitHref } from '@/lib/intake/task-route-content'

// Русло задачи: шаг 0 (проверка «стоит ли автоматизировать»), шаги по модулям курса, ложная дорога,
// рабочий результат. Один вид на два места — шаг анкеты (<TaskRouteCard>) и «Личный план обучения».
// Без 'use client' и без состояния: чистый рендер статических данных pack'а.

export function TaskRouteView({ route, locale, outcome, moduleTitles, newTab = false, style }: {
  route: TaskRoute
  locale: Locale
  outcome?: string | null
  /** слаг модуля → название; нет — слаг. */
  moduleTitles?: Record<string, string>
  /** В анкете — новая вкладка: уход со страницы посреди шага потерял бы введённое. */
  newTab?: boolean
  style?: CSSProperties
}) {
  const c = buildTaskRouteContent(locale)
  const link = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  const moduleName = (unit: string) => moduleTitles?.[unitModule(unit)] ?? unitModule(unit)
  const label: CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem',
  }
  return (
    <section style={style}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.3rem' }}>{route.title[locale]}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '0.9rem' }}>{route.summary[locale]}</p>

      <div style={label}>{c.stepsHeading}</div>
      <ol start={0} style={{ margin: '0 0 1rem', paddingLeft: '1.4rem' }}>
        <li style={{ marginBottom: '0.5rem', fontSize: '0.92rem', lineHeight: 1.5 }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.checkTitle}</span>
          <br />
          <span style={{ color: 'var(--text-secondary)' }}>{c.checkBody} </span>
          <a href={routeUnitHref(route.check.unit, locale)} {...link} style={{ color: 'var(--text-accent)' }}>
            {moduleName(route.check.unit)}
          </a>
        </li>
        {route.steps.map(s => (
          <li key={s.unit + s.title.en} style={{ marginBottom: '0.5rem', fontSize: '0.92rem', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.title[locale]}</span>
            {' · '}
            <a href={routeUnitHref(s.unit, locale)} {...link} style={{ color: 'var(--text-accent)' }}>{moduleName(s.unit)}</a>
            <br />
            <span style={{ color: 'var(--text-secondary)' }}>{s.action[locale]}</span>
          </li>
        ))}
      </ol>

      <div style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '0.8rem', marginBottom: '1rem' }}>
        <div style={label}>{c.falseRoadLabel}</div>
        <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.25rem' }}>{route.falseRoad.title[locale]}</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>{route.falseRoad.why[locale]}</p>
      </div>

      <div style={label}>{c.resultLabel}</div>
      <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>{routeResultText(route, outcome, locale)}</p>
    </section>
  )
}
