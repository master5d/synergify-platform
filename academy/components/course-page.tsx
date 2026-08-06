import type { Locale } from '../lib/registry'
import { resolveCourse } from '../lib/course/living-practice'

interface Props { locale: Locale }

const GOLD = 'var(--accent)'

export function CoursePage({ locale }: Props) {
  const t = resolveCourse(locale)
  const home = locale === 'en' ? '/en/' : '/'
  const base = locale === 'en' ? '/en/praktika/' : '/praktika/'

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .course-wrap { padding: 3.5rem 1.25rem 4rem !important; }
          .course-wrap h1 { font-size: clamp(2rem, 9vw, 3rem) !important; }
          .course-lesson { grid-template-columns: 1fr !important; gap: 0.35rem !important; }
        }
      `}</style>

      <section className="course-wrap" style={{ maxWidth: '46rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '0.03em', margin: '1rem 0 0.75rem', color: 'var(--text-primary)' }}>
          {t.heading}
        </h1>
        <p style={{ color: GOLD, fontSize: 'var(--text-sm)', letterSpacing: '0.04em', margin: '0 0 1.75rem' }}>
          {t.tagline}
        </p>

        {t.intro.map((p, i) => (
          <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', marginBottom: '1rem' }}>{p}</p>
        ))}

        <h2 style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.12em', fontSize: 'var(--text-xs)', margin: '3rem 0 0' }}>
          {t.lessonsLabel}
        </h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0' }}>
          {t.lessons.map((lesson, i) => (
            <li
              key={lesson.slug}
              className="course-lesson"
              style={{
                display: 'grid',
                gridTemplateColumns: '2.5rem 1fr',
                gap: '1rem',
                padding: '1.25rem 0',
                borderTop: i === 0 ? '1px solid var(--accent-line)' : '1px solid var(--border-soft)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', color: GOLD, fontSize: 'var(--text-sm)', paddingTop: '0.15rem' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 style={{ margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                  <a href={`${base}${lesson.slug}/`} style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 600, textDecoration: 'none' }}>
                    {lesson.title}
                  </a>
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-base)', margin: 0 }}>
                  {lesson.summary}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p style={{ marginTop: '3rem' }}>
          <a href={home} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textDecoration: 'none' }}>
            {t.indexBackLabel}
          </a>
        </p>
      </section>
    </main>
  )
}
