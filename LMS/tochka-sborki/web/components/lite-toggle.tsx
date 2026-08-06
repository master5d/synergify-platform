'use client'
import { useEffect, useState } from 'react'
import { useLite } from '@/components/lite-provider'
import type { Locale } from '@/lib/dictionaries'
import type { LitePref } from '@/lib/lite-pref'

const SEGMENTS: { key: LitePref; label: string }[] = [
  { key: 'on', label: 'Lite' },
  { key: 'auto', label: 'Auto' },
  { key: 'off', label: 'Full' },
]

const ARIA: Record<Locale, { group: string } & Record<LitePref, string>> = {
  ru: { group: 'Режим экономии трафика', on: 'Лёгкий режим', auto: 'Авто (по скорости сети)', off: 'Полный режим' },
  en: { group: 'Data-saver mode', on: 'Lite mode', auto: 'Auto (by connection)', off: 'Full mode' },
}

export function LiteToggle({ locale }: { locale: Locale }) {
  const { pref, setPref } = useLite()
  const a = ARIA[locale] ?? ARIA.ru
  const [mounted, setMounted] = useState(false)

  // Render only after mount: pref is corrected from storage in an effect.
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div
      role="radiogroup"
      aria-label={a.group}
      style={{
        display: 'flex',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
      }}
    >
      {SEGMENTS.map(seg => {
        const active = pref === seg.key
        return (
          <button
            key={seg.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={a[seg.key]}
            title={a[seg.key]}
            onClick={() => setPref(seg.key)}
            style={{
              padding: '3px 8px',
              cursor: 'pointer',
              border: 'none',
              background: active ? 'var(--text-accent)' : 'transparent',
              color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              fontWeight: active ? 700 : 400,
            }}
          >
            {seg.label}
          </button>
        )
      })}
    </div>
  )
}
