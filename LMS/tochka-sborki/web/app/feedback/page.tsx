import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { FeedbackForm } from '@/components/feedback-form'
import { getDictionary } from '@/lib/dictionaries'
import { getAllModules } from '@/lib/content'

const t = getDictionary('ru').feedback

export const metadata: Metadata = {
  title: t.pageTitle,
  description: t.pageDescription,
}

export default function FeedbackPage() {
  const modules = getAllModules('ru').map(m => m.title)
  return (
    <>
      <Nav />
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '1rem',
        }}>
          {t.pageLabel}
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 900,
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          lineHeight: 0.95,
          marginBottom: '1rem',
          whiteSpace: 'pre-line',
        }}>
          {t.pageHeading}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.75 }}>
          {t.pageSubtitle}
        </p>
        <FeedbackForm locale="ru" modules={modules} />
      </main>
    </>
  )
}
