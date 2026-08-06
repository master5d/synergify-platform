import type { Locale } from '@/lib/intake/types'
import type { EcosystemData } from '@/lib/course/ecosystem'

export function EcosystemDiagram({ data, locale = 'ru' }: { data: EcosystemData; locale?: Locale }) {
  const soon = locale === 'en' ? 'soon' : 'скоро'

  return (
    <section style={{
      padding: 'var(--section-gap) 2rem',
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
    }}>
      <style>{`
        .eco-sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
        }
        @media (max-width: 720px) {
          .eco-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Screen-reader semantic version of the diagram */}
      <div className="eco-sr-only">
        <h3>{data.heading}</h3>
        {data.pillars.map((p) => (
          <div key={p.key}>
            <h4>{p.title}</h4>
            <ul>
              {p.nodes.map((n, i) => (
                <li key={i}>{n.label}{n.status === 'planned' ? ` (${soon})` : ''}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--section-label-size)',
          color: 'var(--text-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '1rem',
        }}>
          {data.eyebrow}
        </div>
        <h2 style={{ marginTop: 0, marginBottom: '2.5rem', color: 'var(--text-primary)' }}>
          {data.heading}
        </h2>

        <div className="eco-grid" aria-hidden="true" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
        }}>
          {data.pillars.map((p) => (
            <div key={p.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-accent)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem',
              }}>
                {p.title}
              </div>
              {p.nodes.map((n, i) => {
                const planned = n.status === 'planned'
                return (
                  <div key={i} style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg-surface)',
                    padding: '0.85rem',
                    opacity: planned ? 0.55 : 1,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{n.label}</span>
                      {planned && (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius)',
                          padding: '0.1rem 0.4rem',
                          whiteSpace: 'nowrap',
                        }}>
                          {soon}
                        </span>
                      )}
                    </div>
                    {n.desc && (
                      <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {n.desc}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
