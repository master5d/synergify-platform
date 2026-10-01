'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { EIDETICS_UI } from '../../lib/eidetics/ui'
import { readRecall, summarizeRecall, type RecallSummary } from '../../lib/eidetics/recall-store'
import { readPalace } from '../../lib/eidetics/palace-store'

/** Замер «до / после» по «Запомни ряд» + число прогонов по дворцу. Только localStorage. */
export function EideticsProgress({ locale }: { locale: Locale }) {
  const t = EIDETICS_UI[locale]
  const [sum, setSum] = useState<RecallSummary | null>(null)
  const [runs, setRuns] = useState(0)

  useEffect(() => { setSum(summarizeRecall(readRecall())); setRuns(readPalace().runs.length) }, [])

  if (!sum || (sum.count === 0 && runs === 0)) {
    return <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>{t.empty}</p>
  }
  const fmt = (p: { immediate: number; delayed: number | null }) =>
    `${t.now} ${p.immediate}% · ${t.later} ${p.delayed === null ? t.notYet : `${p.delayed}%`}`

  return (
    <div style={{ display: 'grid', gap: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
      {sum.before ? <div><b style={{ color: 'var(--text-primary)' }}>{t.before}</b>: {fmt(sum.before)}</div> : null}
      {sum.after ? <div><b style={{ color: 'var(--text-primary)' }}>{t.after}</b>: {fmt(sum.after)}</div> : null}
      {runs > 0 ? <div><b style={{ color: 'var(--text-primary)' }}>{t.palaceRuns}</b>: {runs}</div> : null}
    </div>
  )
}
