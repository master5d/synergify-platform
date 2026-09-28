'use client'
import { useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import type { ZoneVM } from '@/lib/rpg/types'
import { profileToLearningPlan, profileWeekRoute } from '@/lib/intake/learning-plan'
import { WeekRouteView } from './week-route-view'
import { SheetSection, SHEET_PRE, SHEET_BTN } from './sheet-section'

// moduleTitles — слаг → название модуля (страница персонажа берёт из _meta.json): для «Карты недели».
export function LearningPlanCard({ profile, zones, locale, moduleTitles }: {
  profile: any; zones: ZoneVM[]; locale: Locale; moduleTitles?: Record<string, string>
}) {
  const [copied, setCopied] = useState(false)
  const plan = profileToLearningPlan(profile, zones, locale, moduleTitles)
  // Разложенная карта недели — кликабельно рядом с текстом плана (в <pre> ссылки не нажимаются).
  const weekRoute = profileWeekRoute(profile, locale)
  const t = locale === 'en'
    ? { title: 'Personal learning plan', copy: 'Copy plan', copied: 'Copied ✓' }
    : { title: 'Личный план обучения', copy: 'Скопировать план', copied: 'Скопировано ✓' }
  const btn = SHEET_BTN

  return (
    <SheetSection title={t.title} glyph="🗺">
      {weekRoute && (
        <WeekRouteView route={weekRoute} locale={locale} moduleTitles={moduleTitles} style={{ marginBottom: '1rem' }} />
      )}
      <pre style={SHEET_PRE}>{plan}</pre>
      <div style={{ display: 'flex', gap: 12, marginTop: '1rem', flexWrap: 'wrap' }}>
        <button style={btn} onClick={async () => { try { await navigator.clipboard.writeText(plan); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }}>{copied ? t.copied : t.copy}</button>
      </div>
    </SheetSection>
  )
}
