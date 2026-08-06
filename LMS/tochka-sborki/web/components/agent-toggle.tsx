'use client'
import { useState, useEffect } from 'react'
import type { Stack } from './agent-block'

const STACKS: { key: Stack; glyph: string; name: string; short: string }[] = [
  { key: 'claude',     glyph: '🤖', name: 'Claude Code',   short: 'CC' },
  { key: 'sovereign',  glyph: '🛡️', name: 'Sovereign',     short: 'SOVERN' },
  { key: 'cloud-oss',  glyph: '☁️', name: 'Cloud-OSS',     short: 'OSS' },
  { key: 'behind-gfw', glyph: '🌏', name: 'Behind GFW',    short: 'GFW' },
]

interface Props {
  label?: string
  compact?: boolean
}

export function AgentToggle({ label = 'Стек:', compact = false }: Props) {
  const [stack, setStack] = useState<Stack | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try { stored = localStorage.getItem('stack') } catch { /* ignore */ }
    if (stored && STACKS.some(s => s.key === stored)) setStack(stored as Stack)
    setReady(true)
  }, [])

  function pick(next: Stack) {
    try { localStorage.setItem('stack', next) } catch { /* ignore */ }
    setStack(next)
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
        gap: '0.6rem',
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
      {STACKS.map(s => {
        const active = stack === s.key
        return (
          <button
            key={s.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => pick(s.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: compact ? '0.75rem' : '0.85rem',
              cursor: 'pointer',
              background: active ? 'var(--text-accent)' : 'transparent',
              color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              border: '1px solid ' + (active ? 'var(--text-accent)' : 'var(--border-color)'),
              borderRadius: '3px',
              fontWeight: active ? 700 : 500,
              whiteSpace: 'nowrap',
            }}
          >
            <span aria-hidden="true">{s.glyph}</span>
            {compact ? s.short : s.name}
          </button>
        )
      })}
      {stack === null && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
          opacity: 0.7,
        }}>
          (показаны все варианты)
        </span>
      )}
    </div>
  )
}
