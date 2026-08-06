'use client'
import type { Locale, WorldSkin } from '@/lib/intake/types'
import { buildBridgeContent } from '@/lib/intake/onboarding-bridge-content'

export function OnboardingBridge({ skin, locale, onEnter }: { skin: WorldSkin; locale: Locale; onEnter: () => void }) {
  const c = buildBridgeContent(skin, locale)
  const btnPrimary: React.CSSProperties = {
    background: 'var(--text-accent)', color: 'var(--text-on-accent)',
    border: '1px solid var(--text-accent)', borderRadius: 8,
    padding: '12px 20px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
  }
  return (
    <main style={{ maxWidth: 620, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '.8rem' }}>{c.title}</h1>
      <p style={{ color: 'var(--text-primary)', marginBottom: '1.4rem', lineHeight: 1.55 }}>{c.decoder}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.4rem', display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
        {c.glossary.map((g) => (
          <li key={g.term} style={{ display: 'flex', gap: '.6rem', alignItems: 'baseline' }}>
            <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>{g.icon}</span>
            <span style={{ lineHeight: 1.5 }}>
              <strong>{g.term}</strong>
              <span style={{ color: 'var(--text-secondary)' }}> — {g.desc}</span>
            </span>
          </li>
        ))}
      </ul>
      <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: '1.4rem', lineHeight: 1.5 }}>{c.reassurance}</p>
      <button style={btnPrimary} onClick={onEnter}>{c.enterLabel}</button>
    </main>
  )
}
