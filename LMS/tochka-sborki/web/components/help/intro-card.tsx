// web/components/help/intro-card.tsx
'use client'

import { useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import { INTRO_CARDS } from '@/lib/help/help-content'
import { useHelpSeen } from '@/lib/help/use-help-seen'

const HELP_LABEL: Record<Locale, string> = { ru: 'Подсказка', en: 'Help' }
const CLOSE_LABEL: Record<Locale, string> = { ru: 'Скрыть', en: 'Dismiss' }

export function IntroCard({ page, locale, accent }: { page: string; locale: Locale; accent: string }) {
  const entry = INTRO_CARDS[page]
  const { seen, dismiss, ready } = useHelpSeen(page)
  const [manual, setManual] = useState<boolean | null>(null)

  if (!entry || !ready) return null

  const open = manual ?? !seen

  return (
    <div style={{ marginBottom: open ? '1rem' : '0.25rem' }}>
      {!open && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            aria-label={HELP_LABEL[locale]}
            onClick={() => setManual(true)}
            style={{ width: '1.4rem', height: '1.4rem', borderRadius: '50%', border: `1px solid ${accent}`, background: 'transparent', color: accent, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
          >
            <span aria-hidden="true">?</span>
          </button>
        </div>
      )}
      {open && (
        <section style={{ border: `1px solid ${accent}`, borderRadius: 12, padding: '1rem 1.1rem', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.75rem' }}>
            <strong style={{ fontFamily: 'var(--font-mono)', color: accent }}>{entry.title[locale]}</strong>
            <button
              type="button"
              aria-label={CLOSE_LABEL[locale]}
              onClick={() => { setManual(false); if (!seen) dismiss() }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.4rem', lineHeight: 1.45 }}>
            {entry.body[locale]}
          </p>
        </section>
      )}
    </div>
  )
}
