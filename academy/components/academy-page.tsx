import { getDictionary, type Locale } from '../lib/dictionaries'
import { getCourses } from '../lib/registry'
import { courseCard } from '../lib/course/living-practice'

interface Props { locale: Locale }

const GOLD = 'var(--accent)'

export function AcademyPage({ locale }: Props) {
  const t = getDictionary(locale).academy
  const courses = getCourses(locale)

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .academy-hero { padding: 4rem 1.25rem 3rem !important; }
          .academy-hero h1 { font-size: clamp(2.2rem, 11vw, 4.5rem) !important; }
        }
      `}</style>

      <section className="academy-hero" style={{ padding: '7rem 2rem 5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '0.05em', margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>
          {t.wordmark}
        </h1>
        <p style={{ color: GOLD, fontSize: 'var(--text-sm)', letterSpacing: '0.08em', margin: '0 0 2.5rem' }}>
          {t.fullName}
        </p>
        <div style={{ maxWidth: '38rem', margin: '0 auto', textAlign: 'left' }}>
          {t.positioning.map((p, i) => (
            <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)' }}>{p}</p>
          ))}
          <div style={{ border: '1px solid var(--accent)', borderRadius: 'var(--radius)', marginTop: '1.6rem', padding: '1rem', background: 'var(--accent-wash)' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.85rem' }}>{t.gate}</p>
            <a href="https://ai.synergify.com" style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'lowercase' }}>
              {t.gateCta}
            </a>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '52rem', margin: '0 auto', padding: '0 2rem 2.5rem', textAlign: 'center' }}>
        <a
          href={locale === 'en' ? '/en/pravila/' : '/pravila/'}
          style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', textDecoration: 'none', borderBottom: `1px solid rgba(217,169,92,0.4)`, paddingBottom: '0.2rem' }}
        >
          {t.charterLabel}
        </a>
      </section>

      <section style={{ maxWidth: '52rem', margin: '0 auto', padding: '0 2rem 6rem' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.12em', fontSize: 'var(--text-xs)', marginBottom: '1.25rem' }}>
          {t.coursesLabel}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {(() => {
            const first = courseCard(locale)
            return (
              <a
                href={first.href}
                aria-label={first.name}
                style={{ border: '1px solid var(--accent-line)', borderRadius: 'var(--radius)', padding: '1.5rem', textDecoration: 'none', background: 'var(--bg-surface)', display: 'block' }}
              >
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>{first.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{first.tagline}</div>
              </a>
            )
          })()}
          {courses.map((c) =>
            c.status === 'live' ? (
              <a
                key={c.slug}
                href={c.url}
                aria-label={c.name}
                target="_blank"
                rel="noopener noreferrer"
                style={{ border: '1px solid var(--accent-line)', borderRadius: 'var(--radius)', padding: '1.5rem', textDecoration: 'none', background: 'var(--bg-surface)', display: 'block' }}
              >
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>{c.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{c.tagline}</div>
              </a>
            ) : (
              <div
                key={c.slug}
                style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '1.5rem', background: 'var(--bg-surface-muted)' }}
              >
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.4rem' }}>{c.name}</div>
                <div style={{ color: 'var(--text-faint)', fontSize: 'var(--text-sm)', lineHeight: 1.5, marginBottom: '0.6rem' }}>{c.tagline}</div>
                <span style={{ fontFamily: 'var(--font-mono)', color: GOLD, fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'lowercase' }}>{t.comingSoon}</span>
              </div>
            ),
          )}
        </div>
      </section>
    </main>
  )
}
