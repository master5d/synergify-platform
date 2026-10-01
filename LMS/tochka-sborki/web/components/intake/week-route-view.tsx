import type { CSSProperties } from 'react'
import type { Locale } from '@/lib/intake/types'
import { WEEK_BUCKETS, type WeekRoute } from '@/lib/intake/week-map'
import { buildWeekMapContent, weekRouteModuleHref } from '@/lib/intake/week-map-content'

// Личный маршрут «Карты недели»: корзина → дело → модуль со ссылкой. Один вид на два места —
// шаг анкеты (<WeekMapCard>) и «Личный план обучения» на странице персонажа (<LearningPlanCard>).
// Без 'use client' и без своего состояния: чистый рендер готового WeekRoute.

export function WeekRouteView({ route, locale, moduleTitles, newTab = false, style }: {
  route: WeekRoute
  locale: Locale
  /** слаг модуля → название; нет — показываем слаг. */
  moduleTitles?: Record<string, string>
  /** В анкете — новая вкладка: уход со страницы посреди шага потерял бы введённое. */
  newTab?: boolean
  style?: CSSProperties
}) {
  const c = buildWeekMapContent(locale)
  return (
    <section style={style}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>{c.routeHeading}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.9rem' }}>{c.routeLead}</p>
      {WEEK_BUCKETS.filter(b => route.counts[b] > 0).map(b => (
        <div key={b} style={{ marginBottom: '1rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem',
          }}>
            {c.buckets[b].label} · {route.counts[b]}
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {route.items.filter(it => it.bucket === b).map(it => (
              <li key={it.text} style={{ marginBottom: '0.45rem', fontSize: '0.92rem', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{it.text}</span>
                <br />
                <span style={{ color: 'var(--text-secondary)' }}>{c.buckets[b].moduleLead} </span>
                <a
                  href={weekRouteModuleHref(it.moduleSlug, locale)}
                  {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{ color: 'var(--text-accent)' }}
                >
                  {moduleTitles?.[it.moduleSlug] ?? it.moduleSlug}
                </a>
              </li>
            ))}
          </ol>
        </div>
      ))}
      {route.unsortedCount > 0 && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>{c.unsortedInPlan(route.unsortedCount)}</p>
      )}
    </section>
  )
}
