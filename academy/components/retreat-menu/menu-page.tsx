import type { Locale } from '../../lib/dictionaries'
import { RetreatMenu } from './retreat-menu'
import { MN_UI } from './ui'

// Текст/ссылки на бумаге — бронза (золото на светлом = 1.7:1)
const GOLD = 'var(--accent-ink)'

/** Страница инструмента: воздух, mono-микролейбл, обратная ссылка — как у калькулятора и таймлайна. */
export function MenuPage({ locale }: { locale: Locale }) {
  const t = MN_UI[locale]
  const home = locale === 'en' ? '/en/' : '/'
  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .mn-wrap { padding: 3.5rem 1.25rem 4rem !important; }
          .mn-wrap h1 { font-size: clamp(1.8rem, 8vw, 2.6rem) !important; }
        }
      `}</style>
      <section className="mn-wrap" style={{ maxWidth: '58rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '-0.02em', margin: '1rem 0 0.75rem', color: 'var(--text-primary)' }}>
          {t.h1}
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', margin: '0 0 2rem' }}>
          {t.lead}
        </p>
        <RetreatMenu locale={locale} />
        <p style={{ marginTop: '3rem' }}>
          <a href={home} style={{ color: GOLD, fontSize: 'var(--text-sm)' }}>{t.backLabel}</a>
        </p>
      </section>
    </main>
  )
}
