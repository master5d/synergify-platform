import type { Locale } from '../lib/registry'
import { getLesson } from '../lib/course/living-practice'
import { AdmissionGate } from './admission-gate'

interface Props { locale: Locale; slug: string }

const GOLD = 'var(--accent)'

export function LessonPage({ locale, slug }: Props) {
  const t = getLesson(slug, locale)
  if (!t) return null
  const base = locale === 'en' ? '/en/praktika/' : '/praktika/'

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .lesson-wrap { padding: 3.5rem 1.25rem 4rem !important; }
          .lesson-wrap h1 { font-size: clamp(1.8rem, 8vw, 2.6rem) !important; }
        }
      `}</style>

      <section className="lesson-wrap" style={{ maxWidth: '46rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 3rem)', letterSpacing: '0.03em', margin: '1rem 0 2rem', color: 'var(--text-primary)' }}>
          {t.title}
        </h1>

        <AdmissionGate locale={locale}>
          {t.prose.map((p, i) => (
            <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: 'var(--text-base)', marginBottom: '1.1rem' }}>{p}</p>
          ))}

          {t.next && (
            <p style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-soft)' }}>
              <a href={`${base}${t.next.slug}/`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
                {String(t.index + 1).padStart(2, '0')} · {t.next.title} →
              </a>
            </p>
          )}
        </AdmissionGate>

        <p style={{ marginTop: t.next ? '1.5rem' : '3rem' }}>
          <a href={base} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textDecoration: 'none' }}>
            {t.backLabel}
          </a>
        </p>
      </section>
    </main>
  )
}
