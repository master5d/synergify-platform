'use client'
import { useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import type { ZoneVM } from '@/lib/rpg/types'
import { profileToLearningPlan } from '@/lib/intake/learning-plan'

export function LearningPlanCard({ profile, zones, locale }: { profile: any; zones: ZoneVM[]; locale: Locale }) {
  const [copied, setCopied] = useState(false)
  const plan = profileToLearningPlan(profile, zones, locale)
  const t = locale === 'en'
    ? { title: 'Personal learning plan', copy: 'Copy plan', copied: 'Copied ✓' }
    : { title: 'Личный план обучения', copy: 'Скопировать план', copied: 'Скопировано ✓' }
  const btn: React.CSSProperties = { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 16px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }

  return (
    <section style={{ maxWidth: 640, margin: '2rem auto 1rem', padding: '0 1.5rem' }}>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '.6rem' }}>{t.title}</h2>
      <pre style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '1rem', overflowX: 'auto', fontSize: '.8rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{plan}</pre>
      <div style={{ display: 'flex', gap: 12, marginTop: '1rem', flexWrap: 'wrap' }}>
        <button style={btn} onClick={async () => { try { await navigator.clipboard.writeText(plan); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }}>{copied ? t.copied : t.copy}</button>
      </div>
    </section>
  )
}
