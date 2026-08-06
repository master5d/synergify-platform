'use client'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import type { ThemePref } from '@/lib/theme-pref'

const SEGMENTS: { key: ThemePref; glyph: string }[] = [
  { key: 'light', glyph: '☀️' },
  { key: 'dark', glyph: '🌙' },
  { key: 'system', glyph: '🖥️' },
]

export function ThemeToggle({ locale }: { locale: Locale }) {
  const { pref, setPref } = useTheme()
  const t = getDictionary(locale)
  const [mounted, setMounted] = useState(false)

  // Render only after mount: pref is corrected from storage in an effect, so the
  // active segment would otherwise mismatch the server-rendered default.
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  // Arrow-key nav omitted intentionally — matches the OS-toggle pill convention in this nav.
  return (
    <div
      role="radiogroup"
      aria-label={t.nav.theme.title}
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
            aria-label={t.nav.theme[seg.key]}
            title={t.nav.theme[seg.key]}
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
            <span aria-hidden="true">{seg.glyph}</span>
          </button>
        )
      })}
    </div>
  )
}
