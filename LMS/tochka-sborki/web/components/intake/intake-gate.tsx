'use client'
import type { Locale } from '@/lib/intake/types'
import { buildIntakeGateContent } from '@/lib/intake/intake-gate-content'

// Step 0 of the intake wizard: a plain-language clarity-gate shown before any RPG question.
// onEnter advances to the first question; the secondary link goes to the full landing.
export function IntakeGate({ locale, onEnter }: { locale: Locale; onEnter: () => void }) {
  const c = buildIntakeGateContent(locale)
  const btnPrimary: React.CSSProperties = {
    background: 'var(--text-accent)', color: 'var(--text-on-accent)',
    border: '1px solid var(--text-accent)', borderRadius: 8,
    padding: '12px 22px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
  }
  return (
    <main style={{ maxWidth: 620, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)',
        textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.9rem',
      }}>
        {c.eyebrow}
      </div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>{c.title}</h1>
      <p style={{ color: 'var(--text-primary)', marginBottom: '1.6rem', lineHeight: 1.6 }}>{c.lead}</p>

      <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.6rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.6rem 1rem',
          borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>{c.beforeLabel}</span>
          <span style={{ color: 'var(--text-accent)' }}>{c.afterLabel}</span>
        </div>
        {c.rows.map(row => (
          <div key={row.before} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.8rem 1rem',
            borderTop: '1px solid var(--border-color)',
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.45 }}>{row.before}</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.45, fontWeight: 600 }}>{row.after}</span>
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.2rem', lineHeight: 1.5 }}>{c.keep}</p>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.6rem', lineHeight: 1.55 }}>{c.frame}</p>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button style={btnPrimary} onClick={onEnter}>{c.enterLabel}</button>
        <a href={c.moreHref} style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-accent)',
          textDecoration: 'none', letterSpacing: '0.03em',
        }}>
          {c.moreLabel}
        </a>
      </div>
    </main>
  )
}
