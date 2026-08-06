export function WillWontBlock({ heading, willLabel, wontLabel, will, wont, punchline }: {
  heading?: string
  willLabel: string
  wontLabel: string
  will: string[]
  wont: string[]
  punchline?: string
}) {
  const colLabel: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase',
    letterSpacing: '0.12em', marginBottom: '0.75rem',
  }
  const list: React.CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }
  const item: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1.1rem 1fr', gap: '0.5rem', alignItems: 'baseline', fontSize: '0.92rem', lineHeight: 1.5 }

  return (
    <figure style={{
      margin: '1.5rem 0', padding: '1.25rem',
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)',
    }}>
      <style>{`
        @media (max-width: 720px) { .willwont-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; } }
      `}</style>

      {heading && (
        <figcaption style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.1rem' }}>{heading}</figcaption>
      )}

      <div className="willwont-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* WILL */}
        <div>
          <div style={{ ...colLabel, color: 'var(--text-accent)' }}>{willLabel}</div>
          <ul style={list}>
            {will.map((s, i) => (
              <li key={i} style={item}>
                <span aria-hidden="true" style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>✓</span>
                <span style={{ color: 'var(--text-primary)' }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* WON'T */}
        <div>
          <div style={{ ...colLabel, color: 'var(--text-secondary)' }}>{wontLabel}</div>
          <ul style={list}>
            {wont.map((s, i) => (
              <li key={i} style={item}>
                <span aria-hidden="true" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>✗</span>
                <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {punchline && (
        <p style={{ marginTop: '1.25rem', marginBottom: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-accent)', lineHeight: 1.45 }}>{punchline}</p>
      )}
    </figure>
  )
}
