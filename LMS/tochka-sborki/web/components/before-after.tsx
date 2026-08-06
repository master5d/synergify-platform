import { getDictionary, type Locale } from '@/lib/dictionaries'

interface Props { locale: Locale }

export function BeforeAfter({ locale }: Props) {
  const t = getDictionary(locale).beforeAfter

  return (
    <section className="home-section" style={{
      padding: 'var(--section-gap) 2rem',
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
            <div key={item.before} style={{ paddingTop: '1rem', borderTop: 'var(--accent-line)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}>
                {t.beforeLabel}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                {item.before}
              </p>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}>
                {t.afterLabel}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.7, fontWeight: 600 }}>
                {item.after}
              </p>
            </div>
          ))}
        </div>
        <p style={{
          marginTop: '3rem',
          fontSize: 'clamp(1.2rem, 2.6vw, 1.6rem)',
          fontWeight: 700,
          color: 'var(--text-accent)',
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
        }}>
          {t.roiLine}
        </p>
      </div>
    </section>
  )
}
