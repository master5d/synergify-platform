import { getDictionary, type Locale } from '@/lib/dictionaries'

interface Props { locale: Locale }

export function ChatVsSystem({ locale }: Props) {
  const t = getDictionary(locale).chatVsSystem

  return (
    <section className="home-section" style={{
      padding: 'var(--section-gap) 2rem',
      borderTop: '1px solid var(--border-color)',
    }}>
      <style>{`
        .cvs-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }
        .cvs-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 1.25rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .cvs-cell-label { display: none; }
        @media (max-width: 720px) {
          .cvs-header { display: none; }
          .cvs-row { grid-template-columns: 1fr; gap: 0.75rem; padding: 1.5rem 0; }
          .cvs-cell-label {
            display: block;
            font-family: var(--font-mono);
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.35rem;
          }
        }
      `}</style>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--section-label-size)',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '1rem',
        }}>
          {t.label}
        </div>
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 3rem)',
          fontWeight: 900,
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          lineHeight: 1,
          marginBottom: '1.5rem',
          whiteSpace: 'pre-line',
        }}>
          {t.heading}
        </h2>
        <p style={{
          fontStyle: 'italic',
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          lineHeight: 1.7,
          marginBottom: '3rem',
        }}>
          {t.hook}
        </p>
        <div className="cvs-header">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {t.chatColLabel}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {t.systemColLabel}
          </div>
        </div>
        {t.rows.map(row => (
          <div key={row.chat} className="cvs-row">
            <div>
              <span className="cvs-cell-label" style={{ color: 'var(--text-secondary)' }}>{t.chatColLabel}</span>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>{row.chat}</p>
            </div>
            <div>
              <span className="cvs-cell-label" style={{ color: 'var(--text-accent)' }}>{t.systemColLabel}</span>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem', fontWeight: 600 }}>{row.system}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
