'use client'
import { useEffect, useState } from 'react'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { effectiveRpgMode, storeRpgMode, type RpgMode } from '@/lib/rpg-mode'

const SEGMENTS: { key: RpgMode; glyph: string }[] = [
  { key: 'rpg', glyph: '🎲' },
  { key: 'plain', glyph: '📄' },
]

// Nav pill mirroring the OS toggle: pick RPG-flavored vs plain-language chrome. Reload on change so
// every client chrome component re-reads the stored mode (same convention as the OS toggle).
export function RpgModeToggle({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).nav.rpgMode
  const [mode, setMode] = useState<RpgMode>('rpg')
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMode(effectiveRpgMode()); setMounted(true) }, [])
  if (!mounted) return null

  function pick(next: RpgMode) {
    if (next === mode) return
    storeRpgMode(next)
    setMode(next)
    window.location.reload()
  }

  return (
    <div
      role="radiogroup"
      aria-label={t.title}
      style={{
        display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
      }}
    >
      {SEGMENTS.map(seg => {
        const active = mode === seg.key
        return (
          <button
            key={seg.key}
            role="radio"
            aria-checked={active}
            aria-label={t[seg.key]}
            title={t[seg.key]}
            onClick={() => pick(seg.key)}
            style={{
              border: 'none', cursor: 'pointer', padding: '3px 8px',
              background: active ? 'var(--text-accent)' : 'transparent',
              color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              fontWeight: active ? 700 : 400, fontFamily: 'inherit', fontSize: 'inherit',
            }}
          >
            {seg.glyph}
          </button>
        )
      })}
    </div>
  )
}
