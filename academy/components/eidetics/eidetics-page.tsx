import type { ReactNode } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { resolveEideticsCourse } from '../../lib/eidetics/course'
import { getEideticsProse } from '../../lib/eidetics/lessons'
import { EIDETICS_UI } from '../../lib/eidetics/ui'
import { EideticsProgress } from './eidetics-progress'

// Текст/ссылки на бумаге — бронза (золото на светлом = 1.7:1)
const GOLD = 'var(--accent-ink)'

const monoLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.12em',
  fontSize: 'var(--text-xs)', margin: '3rem 0 1rem',
}

function Shell({ className, children }: { className: string; children: ReactNode }) {
  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .${className} { padding: 3.5rem 1.25rem 4rem !important; }
          .${className} h1 { font-size: clamp(1.8rem, 8vw, 2.6rem) !important; }
          .${className} .eid-lesson { grid-template-columns: 1fr !important; gap: 0.35rem !important; }
        }
      `}</style>
      <section className={className} style={{ maxWidth: '46rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        {children}
      </section>
    </main>
  )
}

/** Страница модуля «Эйдетика»: уроки (пока «готовится»), честная рамка, тренажёры, замер. */
export function EideticsPage({ locale }: { locale: Locale }) {
  const t = EIDETICS_UI[locale]
  const c = resolveEideticsCourse(locale)
  const prefix = locale === 'en' ? '/en' : ''

  return (
    <Shell className="eid-wrap">
      <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
        {t.eyebrow}
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '-0.02em', margin: '1rem 0 0.75rem', color: 'var(--text-primary)' }}>
        {c.title}
      </h1>
      <p style={{ color: GOLD, fontSize: 'var(--text-sm)', letterSpacing: '0.04em', margin: '0 0 1.75rem' }}>{c.tagline}</p>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', margin: 0 }}>{t.intro}</p>

      <h2 style={monoLabel}>{t.honestLabel}</h2>
      <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-sm)', display: 'grid', gap: '.5rem' }}>
        {t.honest.map((h, i) => <li key={i}>{h}</li>)}
      </ul>

      <h2 style={monoLabel}>{t.lessonsLabel}</h2>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {c.lessons.map((lesson, i) => (
          <li key={lesson.slug} className="eid-lesson" style={{
            display: 'grid', gridTemplateColumns: '2.5rem 1fr', gap: '1rem', padding: '1.25rem 0',
            borderTop: i === 0 ? '1px solid var(--accent-line)' : '1px solid var(--border-soft)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: GOLD, fontSize: 'var(--text-sm)', paddingTop: '0.15rem' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 style={{ margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                {/* Ссылка — только у урока с прозой: ненаписанный slug страницы не имеет (lessons.test.ts). */}
                {getEideticsProse(lesson.slug, locale) ? (
                  <a href={`${prefix}/trenazhery/eidetika/${lesson.slug}/`} style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 600, textDecoration: 'none' }}>
                    {lesson.title}
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', fontWeight: 600 }}>{lesson.title}</span>
                )}
                <span style={{ marginLeft: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'lowercase', letterSpacing: '0.08em', color: GOLD }}>
                  {/* Черновик до вычитки владельцем: бейдж снимается вместе с переводом модуля в 'live'. */}
                  {getEideticsProse(lesson.slug, locale) ? (c.status === 'live' ? null : t.draftBadge) : t.badge}
                </span>
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-base)', margin: 0 }}>{lesson.objective}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 style={monoLabel}>{t.trainersLabel}</h2>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {t.trainers.map(tr => (
          <a key={tr.slug} href={`${prefix}/trenazhery/eidetika/${tr.slug}/`}
            style={{ border: '1px solid var(--accent-line)', borderRadius: 'var(--radius)', padding: '1.25rem 1.5rem', background: 'var(--bg-surface)', display: 'block', textDecoration: 'none' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tr.name}</span>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem', lineHeight: 1.5 }}>{tr.desc}</span>
          </a>
        ))}
      </div>

      <h2 style={monoLabel}>{t.progressLabel}</h2>
      <EideticsProgress locale={locale} />
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: '1rem 0 0' }}>{t.local}</p>

      <p style={{ marginTop: '3.5rem' }}>
        <a href={`${prefix}/trenazhery/`} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textDecoration: 'none' }}>
          {t.backLabel}
        </a>
      </p>
    </Shell>
  )
}

/** Обёртка страницы одного тренажёра модуля: назад — к странице эйдетики. */
export function EideticsTrainerPage({ locale, title, description, children }: {
  locale: Locale; title: string; description: string; children: ReactNode
}) {
  const t = EIDETICS_UI[locale]
  const prefix = locale === 'en' ? '/en' : ''
  return (
    <Shell className="eid-trainer-wrap">
      <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
        {t.eyebrow}
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2rem, 4.5vw, 3rem)', letterSpacing: '-0.02em', margin: '1rem 0 0.75rem', color: 'var(--text-primary)' }}>
        {title}
      </h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', margin: '0 0 2.5rem' }}>{description}</p>
      {children}
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: '1.5rem 0 0' }}>{t.local}</p>
      <p style={{ marginTop: '3rem' }}>
        <a href={`${prefix}/trenazhery/eidetika/`} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textDecoration: 'none' }}>
          ← {resolveEideticsCourse(locale).title}
        </a>
      </p>
    </Shell>
  )
}
