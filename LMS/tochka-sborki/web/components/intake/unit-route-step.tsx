'use client'
import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import { fillOutcome, profileTaskRoute, profileTaskText, routeStepsForUnit } from '@/lib/intake/task-route'
import { taskPlanHref, unitStepLabel } from '@/lib/intake/task-route-content'
import { TASK_ROUTE_COPY } from '@/lib/course/task-routes'

// «Шаг N твоей задачи» на странице юнита (хвост волны 18, спека 2026-09-28-onboarding-fork-task-routes.md).
// Статический экспорт: русло ученика известно только на клиенте — из профиля анкеты /api/intake/me
// (так же его читают лист персонажа, дашборд и подземелье). Нет сессии / нет русла / юнит не из русла —
// ничего не рендерим: плашка не должна появляться у того, кто идёт по курсу по порядку.

type Profile = { answers?: unknown } | null

export function UnitRouteStep({ moduleSlug, unitSlug, locale, profile: given }: {
  moduleSlug: string
  unitSlug: string
  locale: Locale
  /** Для тестов рендера: готовый профиль без сети. undefined — загрузить. */
  profile?: Profile
}) {
  const [profile, setProfile] = useState<Profile>(given ?? null)

  useEffect(() => {
    if (given !== undefined) return
    let alive = true
    fetch('/api/intake/me', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(p => { if (alive) setProfile(p) })
      .catch(() => {})
    return () => { alive = false }
  }, [given])

  const route = profileTaskRoute(profile)
  const steps = routeStepsForUnit(route, moduleSlug, unitSlug)
  if (!route || steps.length === 0) return null
  const outcome = profileTaskText(profile)

  return (
    <aside
      aria-label={route.title[locale]}
      style={{
        margin: '0 0 1.25rem', padding: '0.75rem 1rem', border: '1px solid var(--border-color)',
        borderLeft: '3px solid var(--text-accent)', borderRadius: '0 var(--radius) var(--radius) 0',
        background: 'var(--bg-surface)',
      }}
    >
      {steps.map(({ index, step }) => (
        <div key={index} style={{ marginBottom: '0.4rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {unitStepLabel(index, locale)}: {step.title[locale]}
          </div>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
            {fillOutcome(step.action[locale], outcome, locale)}
          </p>
        </div>
      ))}
      <a href={taskPlanHref(locale)} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
        {route.title[locale]} · {TASK_ROUTE_COPY.unitPlanLink[locale]} →
      </a>
    </aside>
  )
}
