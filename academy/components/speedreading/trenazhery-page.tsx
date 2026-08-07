import type { Locale } from '../../lib/dictionaries'
import { resolveSpeedreadingCourse } from '../../lib/speedreading/course'
import { writtenSpeedreadingSlugs } from '../../lib/speedreading/lessons'
import { TrenazheryHub } from './trenazhery-hub'

interface Props { locale: Locale }

// Текст/ссылки на бумаге — бронза (золото на светлом = 1.7:1)
const GOLD = 'var(--accent-ink)'

const UI = {
  ru: {
    eyebrow: 'тренажёры',
    lessonsLabel: 'уроки',
    badge: 'готовится',
    introAll: 'Шесть уроков и три тренажёра — всё уже работает.',
    introPart: 'Тренажёры ниже уже работают. Уроки ещё пишутся — вот структура, которую они примут.',
    backLabel: '← к академии',
  },
  en: {
    eyebrow: 'trainers',
    lessonsLabel: 'lessons',
    badge: 'in preparation',
    introAll: 'Six lessons and three trainers — all of it works now.',
    introPart: 'The trainers below work right now. The lessons are still being written — here is the shape they will take.',
    backLabel: '← back to the academy',
  },
}

export function TrenazheryPage({ locale }: Props) {
  const t = UI[locale]
  const c = resolveSpeedreadingCourse(locale)
  const written = new Set(writtenSpeedreadingSlugs())
  const home = locale === 'en' ? '/en/' : '/'
  const base = locale === 'en' ? '/en/trenazhery/' : '/trenazhery/'
  const allWritten = c.lessons.every((l) => written.has(l.slug))

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .trenazhery-wrap { padding: 3.5rem 1.25rem 4rem !important; }
          .trenazhery-wrap h1 { font-size: clamp(2rem, 9vw, 3rem) !important; }
          .trenazhery-lesson { grid-template-columns: 1fr !important; gap: 0.35rem !important; }
        }
      `}</style>

      <section className="trenazhery-wrap" style={{ maxWidth: '46rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '-0.02em', margin: '1rem 0 0.75rem', color: 'var(--text-primary)' }}>
          {c.title}
        </h1>
        <p style={{ color: GOLD, fontSize: 'var(--text-sm)', letterSpacing: '0.04em', margin: '0 0 1.75rem' }}>
          {c.tagline}
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', margin: 0 }}>
          {allWritten ? t.introAll : t.introPart}
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.12em', fontSize: 'var(--text-xs)', margin: '3rem 0 0' }}>
          {t.lessonsLabel}
        </h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0' }}>
          {c.lessons.map((lesson, i) => (
            <li
              key={lesson.slug}
              className="trenazhery-lesson"
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
                  {written.has(lesson.slug) ? (
                    <a href={`${base}${lesson.slug}/`} style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 600, textDecoration: 'none' }}>
                      {lesson.title}
                    </a>
                  ) : (
                    <>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', fontWeight: 600 }}>{lesson.title}</span>
                      <span style={{ marginLeft: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'lowercase', letterSpacing: '0.08em', color: GOLD }}>
                        {t.badge}
                      </span>
                    </>
                  )}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-base)', margin: 0 }}>
                  {lesson.objective}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <TrenazheryHub locale={locale} />

        <p style={{ marginTop: '3.5rem' }}>
          <a href={home} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textDecoration: 'none' }}>
            {t.backLabel}
          </a>
        </p>
      </section>
    </main>
  )
}
