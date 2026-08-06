// web/components/cs/cycle-complete.tsx
'use client'

import type { Mode } from '@/lib/cs/types'
import type { Locale } from '@/lib/intake/types'
import { MODE } from '@/lib/cs/modes'
import { computeUnitCS } from '@/lib/cs/award'

const LABEL: Record<Locale, string> = { ru: 'УЗЕЛ ПРОЙДЕН', en: 'NODE CLEARED' }

export function CycleComplete({
  mode,
  locale,
  accent,
}: {
  mode: Mode
  locale: Locale
  accent: string
}) {
  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '0.8rem 1.1rem',
      borderRadius: 8,
      background: 'var(--bg-surface)',
      border: `1px solid ${accent}`,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8rem',
      color: accent,
    }}>
      {LABEL[locale]} · +{computeUnitCS(mode)} CS · {MODE[mode].label[locale]}
    </div>
  )
}
