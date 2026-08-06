// web/components/help/help-tip.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import type { Locale } from '@/lib/intake/types'
import { HELP_TIPS } from '@/lib/help/help-content'

export function HelpTip({ id, locale, align = 'left' }: { id: string; locale: Locale; align?: 'left' | 'right' }) {
  const entry = HELP_TIPS[id]
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (!entry) return null

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={entry.title[locale]}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        style={{
          width: '1.1rem', height: '1.1rem', lineHeight: '1.1rem', padding: 0,
          borderRadius: '50%', border: '1px solid var(--border-color)', background: 'transparent',
          color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer', fontFamily: 'var(--font-mono)',
        }}
      >
        <span aria-hidden="true">ⓘ</span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={entry.title[locale]}
          style={{
            position: 'absolute', top: '1.5rem', [align === 'right' ? 'right' : 'left']: 0, zIndex: 30,
            width: 'min(260px, 72vw)', background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 8, padding: '0.7rem 0.85rem', boxShadow: '0 6px 24px rgba(0,0,0,0.35)', textAlign: 'left',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-accent)', marginBottom: '0.3rem' }}>
            {entry.title[locale]}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {entry.body[locale]}
          </div>
        </div>
      )}
    </span>
  )
}
