// web/components/cs/mode-selector.tsx
'use client'

import type { Mode } from '@/lib/cs/types'
import type { Locale } from '@/lib/intake/types'
import { MODE } from '@/lib/cs/modes'
import { computeUnitCS } from '@/lib/cs/award'
import { HelpTip } from '@/components/help/help-tip'

const ORDER: Mode[] = ['commander', 'copilot', 'archmage']

const HEADING: Record<Locale, string> = {
  ru: 'Выбери режим прохождения',
  en: 'Choose your mode',
}

const REC: Record<Locale, string> = { ru: 'рекомендуем', en: 'recommended' }

export function ModeSelector({
  locale,
  accent,
  selected,
  onSelect,
  helpId,
  suggested,
}: {
  locale: Locale
  accent: string
  selected?: Mode
  onSelect: (mode: Mode) => void
  helpId?: string
  suggested?: Mode
}) {
  return (
    <div style={{ margin: '0 0 2rem' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
        marginBottom: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {HEADING[locale]} {helpId && <HelpTip id={helpId} locale={locale} />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
        {ORDER.map(m => {
          const cfg = MODE[m]
          const active = selected === m
          return (
            <button
              key={m}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(m)}
              style={{
                textAlign: 'left',
                padding: '0.9rem 1.1rem',
                background: active ? 'var(--bg-surface)' : 'transparent',
                border: `1px solid ${active ? accent : 'var(--border-color)'}`,
                borderRadius: 10,
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: active ? accent : 'var(--text-primary)' }}>
                  {cfg.label[locale]}
                  {suggested === m && !active && (
                    <span style={{ marginLeft: '0.5rem', fontSize: 'var(--text-xs)', fontWeight: 400, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      ◆ {REC[locale]}
                    </span>
                  )}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  +{computeUnitCS(m)} <span aria-hidden="true">💎</span>
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                {cfg.desc[locale]}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
