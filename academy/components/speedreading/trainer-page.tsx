import type { ReactNode } from 'react'
import type { Locale } from '../../lib/dictionaries'

interface Props { locale: Locale; title: string; description: string; children: ReactNode }

// Текст/ссылки на бумаге — бронза (золото на светлом = 1.7:1)
const GOLD = 'var(--accent-ink)'

const UI = {
  ru: { eyebrow: 'тренажёры', backLabel: '← к тренажёрам' },
  en: { eyebrow: 'trainers', backLabel: '← back to the trainers' },
}

/** Общая обёртка страницы одного тренажёра: воздух, mono-микролейбл, обратная ссылка. */
export function TrainerPage({ locale, title, description, children }: Props) {
  const t = UI[locale]
  const base = locale === 'en' ? '/en/trenazhery/' : '/trenazhery/'

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .trainer-wrap { padding: 3.5rem 1.25rem 4rem !important; }
          .trainer-wrap h1 { font-size: clamp(1.8rem, 8vw, 2.6rem) !important; }
        }
      `}</style>

      <section className="trainer-wrap" style={{ maxWidth: '46rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2rem, 4.5vw, 3rem)', letterSpacing: '-0.02em', margin: '1rem 0 0.75rem', color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', margin: '0 0 2.5rem' }}>
          {description}
        </p>

        {children}

        <p style={{ marginTop: '3rem' }}>
          <a href={base} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textDecoration: 'none' }}>
            {t.backLabel}
          </a>
        </p>
      </section>
    </main>
  )
}
