import Link from 'next/link'
import { Nav } from '@/components/nav'
import { CareForm } from '@/components/care/care-form'
import { COURSE } from '@/lib/course'
import { careCopy, careSiteFor } from '@/lib/care'
import type { Locale } from '@/lib/dictionaries'

/** Служба заботы курса: коротко «чем поможем и за сколько ответим», форма, смежные окна. */
export function CarePage({ locale }: { locale: Locale }) {
  const t = careCopy(locale)
  const prefix = locale === 'en' ? '/en' : ''
  return (
    <>
      <Nav locale={locale} />
      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', margin: 0 }}>{t.eyebrow}</p>
        <h1 style={{ marginTop: '0.5rem' }}>{t.title}</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t.lead}</p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '1.25rem', margin: '0 0 2.5rem' }}>
          {t.promises.map(p => <li key={p}>{p}</li>)}
        </ul>

        <CareForm locale={locale} site={careSiteFor(COURSE.domain)} />

        <section aria-labelledby="care-related" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h2 id="care-related" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'lowercase', letterSpacing: '0.12em', margin: '0 0 1rem' }}>
            {t.relatedLabel}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.9, color: 'var(--text-secondary)' }}>
            <li><Link href={`${prefix}/feedback/`}>{t.feedbackLink}</Link> — {t.feedbackNote}</li>
            <li><Link href={`${prefix}/ama/`}>{t.amaLink}</Link> — {t.amaNote}</li>
          </ul>
        </section>
      </main>
    </>
  )
}
