import { buildAnatomy, type Segment } from '@/lib/content/annotated-example'

export function AnnotatedExample({ segments, caption, mono = true }: {
  segments: Segment[]
  caption?: string
  mono?: boolean
}) {
  const tokens = buildAnatomy(segments)

  const badge = (color: { bg: string; text: string }): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '1.25rem', height: '1.25rem', borderRadius: '999px',
    background: color.bg, color: color.text,
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 700,
  })

  return (
    <figure style={{ margin: '1.5rem 0' }}>
      <style>{`
        @media (max-width: 720px) {
          .anatomy-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {caption && (
        <figcaption style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: 'var(--text-secondary)', marginBottom: '0.75rem',
        }}>{caption}</figcaption>
      )}

      {/* Example line — numbered accent-tinted tokens */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)', padding: '1rem',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        fontSize: mono ? '0.875rem' : '1rem', lineHeight: 1.9,
        marginBottom: '1.25rem', wordBreak: 'break-word',
      }}>
        {tokens.map((t, i) => (
          <span key={t.n}>
            {i > 0 && ' '}
            <span style={{
              background: t.color.bg,
              borderBottom: `2px solid ${t.color.border}`,
              borderRadius: '4px', padding: '0.1em 0.3em',
              color: 'var(--text-primary)',
            }}>
              {t.text}
              <sup aria-hidden="true" style={{
                marginLeft: '0.25em', color: t.color.text,
                fontFamily: 'var(--font-mono)', fontSize: '0.7em', fontWeight: 700,
              }}>{t.n}</sup>
            </span>
          </span>
        ))}
      </div>

      {/* Callout grid — one card per token, same number + accent */}
      <div className="anatomy-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem',
      }}>
        {tokens.map(t => (
          <div key={t.n} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderLeft: `3px solid ${t.color.border}`, borderRadius: 'var(--radius)',
            padding: '0.75rem 0.9rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span aria-hidden="true" style={badge(t.color)}>{t.n}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700,
                color: t.color.text, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{t.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{t.note}</p>
          </div>
        ))}
      </div>
    </figure>
  )
}
