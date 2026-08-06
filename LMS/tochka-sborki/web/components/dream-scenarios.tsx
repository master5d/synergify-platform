import { getDictionary, type Locale } from '@/lib/dictionaries'

interface Props { locale: Locale }

export function DreamScenarios({ locale }: Props) {
  const t = getDictionary(locale).dreams

  return (
    <section className="home-section" style={{
      padding: 'var(--section-gap) 2rem',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
    }}>
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
          marginBottom: '3rem',
          lineHeight: 1,
        }}>
          {t.heading}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
        }}>
          {t.items.map(item => (
            <div key={item.niche} style={{ paddingTop: '1rem', borderTop: 'var(--accent-line)' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                letterSpacing: '0.03em',
              }}>
                {item.niche}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.build}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
