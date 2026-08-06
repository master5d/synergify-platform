import { getDictionary, type Locale } from '@/lib/dictionaries'
import { resolveCourses } from '@/lib/academy/registry'

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius)',
  background: 'var(--bg-secondary)',
  padding: '1.25rem',
  display: 'block',
  textDecoration: 'none',
}

const nameStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '0.35rem',
}

const taglineStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
}

const badgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-accent)',
  textTransform: 'lowercase',
  letterSpacing: '0.12em',
}

/** Card list of ALL academy courses from the registry: live → linked,
 *  coming-soon → unlinked + badge. Unwired in this slice — the academy
 *  landing (#1) consumes it. */
export function CourseCatalog({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const courses = resolveCourses(locale)
  return (
    <section>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        {t.academy.catalogTitle}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {courses.map((c) =>
          c.status === 'live' ? (
            <a
              key={c.slug}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              style={cardStyle}
            >
              <div style={nameStyle}>{c.name}</div>
              <div style={taglineStyle}>{c.tagline}</div>
            </a>
          ) : (
            <div key={c.slug} style={cardStyle}>
              <div style={nameStyle}>{c.name}</div>
              <div style={taglineStyle}>{c.tagline}</div>
              <span style={badgeStyle}>{t.academy.comingSoon}</span>
            </div>
          ),
        )}
      </div>
    </section>
  )
}
