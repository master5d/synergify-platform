import type { Locale } from '../../lib/dictionaries'
import { resolveEideticsCourse } from '../../lib/eidetics/course'
import { getEideticsProse } from '../../lib/eidetics/lessons'
import { EIDETICS_UI } from '../../lib/eidetics/ui'
import { LessonProse } from '../speedreading/lesson-prose'

interface Props { locale: Locale; slug: string }

// Текст/ссылки на бумаге — бронза (золото на светлом = 1.7:1)
const GOLD = 'var(--accent-ink)'

/** Страница урока «Эйдетики» — по образцу SpeedreadingLessonPage; назад — к странице модуля. */
export function EideticsLessonPage({ locale, slug }: Props) {
  const t = EIDETICS_UI[locale]
  const course = resolveEideticsCourse(locale)
  const idx = course.lessons.findIndex((l) => l.slug === slug)
  const lesson = course.lessons[idx]
  const body = lesson ? getEideticsProse(slug, locale) : null
  if (!lesson || !body) return null
  const base = locale === 'en' ? '/en/trenazhery/eidetika/' : '/trenazhery/eidetika/'
  const prev = course.lessons[idx - 1]
  const next = course.lessons[idx + 1]

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .eid-lesson-wrap { padding: 3.5rem 1.25rem 4rem !important; }
          .eid-lesson-wrap h1 { font-size: clamp(1.8rem, 8vw, 2.6rem) !important; }
        }
      `}</style>

      <section className="eid-lesson-wrap" style={{ maxWidth: '46rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.lessonEyebrow} · {String(idx + 1).padStart(2, '0')}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2rem, 4.5vw, 3rem)', letterSpacing: '-0.02em', margin: '1rem 0 1rem', color: 'var(--text-primary)' }}>
          {lesson.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-base)', margin: '0 0 2.5rem', borderLeft: '2px solid var(--accent-line)', paddingLeft: '0.9rem' }}>
          {lesson.objective}
        </p>

        <LessonProse body={body} />

        <nav style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-soft)', fontSize: 'var(--text-sm)' }}>
          <span>
            {prev && getEideticsProse(prev.slug, locale) && (
              <a href={`${base}${prev.slug}/`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
                ← {prev.title}
              </a>
            )}
          </span>
          <span style={{ textAlign: 'right' }}>
            {next && getEideticsProse(next.slug, locale) && (
              <a href={`${base}${next.slug}/`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
                {next.title} →
              </a>
            )}
          </span>
        </nav>

        <p style={{ marginTop: '1.5rem' }}>
          <a href={base} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textDecoration: 'none' }}>
            ← {course.title}
          </a>
        </p>
      </section>
    </main>
  )
}
