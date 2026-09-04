'use client'
import { useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import type { ZoneVM } from '@/lib/rpg/types'
import { profileToLearningPlan } from '@/lib/intake/learning-plan'
import { SheetSection, SHEET_PRE, SHEET_BTN } from './sheet-section'

export function LearningPlanCard({ profile, zones, locale }: { profile: any; zones: ZoneVM[]; locale: Locale }) {
  const [copied, setCopied] = useState(false)
  const plan = profileToLearningPlan(profile, zones, locale)
  const t = locale === 'en'
    ? { title: 'Personal learning plan', copy: 'Copy plan', copied: 'Copied ✓' }
    : { title: 'Личный план обучения', copy: 'Скопировать план', copied: 'Скопировано ✓' }
  const btn = SHEET_BTN

  return (
    <SheetSection title={t.title} glyph="🗺">
      <pre style={SHEET_PRE}>{plan}</pre>
      <div style={{ display: 'flex', gap: 12, marginTop: '1rem', flexWrap: 'wrap' }}>
        <button style={btn} onClick={async () => { try { await navigator.clipboard.writeText(plan); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }}>{copied ? t.copied : t.copy}</button>
      </div>
    </SheetSection>
  )
}
