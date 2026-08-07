import type { Locale } from '../../lib/dictionaries'
import { resolveSpeedreadingCourse } from '../../lib/speedreading/course'
import { getSpeedreadingProse } from '../../lib/speedreading/lessons'
import { LessonProse } from './lesson-prose'

interface Props { locale: Locale; slug: string }

const GOLD = 'var(--accent)'

const UI = {
  ru: { eyebrow: 'тренажёры · урок', backLabel: '← к тренажёрам' },
  en: { eyebrow: 'trainers · lesson', backLabel: '← back to the trainers' },
}

export function SpeedreadingLessonPage({ locale, slug }: Props) {
  const t = UI[locale]
  const course = resolveSpeedreadingCourse(locale)
  const idx = course.lessons.findIndex((l) => l.slug === slug)
  const lesson = course.lessons[idx]
  const body = lesson ? getSpeedreadingProse(slug, locale) : null
  if (!lesson || !body) return null
  const base = locale === 'en' ? '/en/trenazhery/' : '/trenazhery/'
  const prev = course.lessons[idx - 1]
  const next = course.lessons[idx + 1]

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .sr-lesson-wrap { padding: 3.5rem 1.25rem 4rem !important; }
          .sr-lesson-wrap h1 { font-size: clamp(1.8rem, 8vw, 2.6rem) !important; }
        }
      `}</style>

      <section className="sr-lesson-wrap" style={{ maxWidth: '46rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 3rem)', letterSpacing: '0.03em', margin: '1rem 0 1rem', color: 'var(--text-primary)' }}>
          {lesson.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-base)', margin: '0 0 2.5rem', borderLeft: '2px solid var(--accent-line)', paddingLeft: '0.9rem' }}>
          {lesson.objective}
        </p>

        <LessonProse body={body} />

        <nav style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-soft)', fontSize: 'var(--text-sm)' }}>
          <span>
            {prev && (
              <a href={`${base}${prev.slug}/`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
                ← {prev.title}
              </a>
            )}
          </span>
          <span style={{ textAlign: 'right' }}>
            {next && (
              <a href={`${base}${next.slug}/`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
                {next.title} →
              </a>
            )}
          </span>
        </nav>

        <p style={{ marginTop: '1.5rem' }}>
          <a href={base} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textDecoration: 'none' }}>
            {t.backLabel}
          </a>
        </p>
      </section>
    </main>
  )
}
