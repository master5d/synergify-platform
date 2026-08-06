'use client'
import { useState, useEffect } from 'react'
import { detectOs, readStoredOs, storeOs, type Os } from '@/lib/os-pref'

const LABELS: Record<Os, { glyph: string; name: string }> = {
  mac: { glyph: '🍎', name: 'macOS' },
  windows: { glyph: '🪟', name: 'Windows' },
}

export function OsToggle({ label = 'Команды для:' }: { label?: string }) {
  const [os, setOs] = useState<Os | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Show the saved choice, or auto-detect the visitor's OS so the cheatsheet
    // defaults to the right platform without a manual pick.
    setOs(readStoredOs() ?? detectOs())
    setReady(true)
  }, [])

  function pick(next: Os) {
    storeOs(next)
    setOs(next)
    window.location.reload()
  }

  if (!ready) return null

  return (
    <div
      role="radiogroup"
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        margin: '1rem 0 2rem',
        padding: '0.75rem 1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        flexWrap: 'wrap',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        {label}
      </span>
      {(Object.keys(LABELS) as Os[]).map(key => {
        const active = os === key
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => pick(key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: active ? 'var(--text-accent)' : 'transparent',
              color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              border: '1px solid ' + (active ? 'var(--text-accent)' : 'var(--border-color)'),
              borderRadius: '3px',
              fontWeight: active ? 700 : 500,
            }}
          >
            <span aria-hidden="true">{LABELS[key].glyph}</span>
            {LABELS[key].name}
          </button>
        )
      })}
    </div>
  )
}
