'use client'

import { useState } from 'react'
import { buildSupportContent } from '@/lib/checkout/support-content'
import type { Locale } from '@/lib/dictionaries'

export function SupportForm({ locale }: { locale: Locale }) {
  const c = buildSupportContent(locale)
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  async function checkout(cents: number) {
    if (busy) return
    setError(false)
    setBusy(true)
    try {
      const res = await fetch('/api/checkout/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cents, locale }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.url) { window.location.assign(data.url); return }
      setError(true)
    } catch {
      setError(true)
    }
    setBusy(false)
  }

  function onCustom() {
    const cents = Math.round(parseFloat(custom) * 100)
    if (!Number.isFinite(cents) || cents < 100) { setError(true); return }
    checkout(cents)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '28rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {c.presets.map(p => (
          <button key={p.cents} onClick={() => checkout(p.cents)} disabled={busy}
            style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input value={custom} onChange={e => setCustom(e.target.value)} inputMode="decimal" placeholder={c.customPlaceholder} aria-label={c.customLabel}
          style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
        <button onClick={onCustom} disabled={busy}
          style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: 'none', background: 'var(--text-accent)', color: 'var(--text-on-accent)', cursor: 'pointer', fontWeight: 600 }}>
          {c.submitLabel}
        </button>
      </div>
      {error && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.errorMsg}</p>}
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{c.footnote}</p>
    </div>
  )
}
