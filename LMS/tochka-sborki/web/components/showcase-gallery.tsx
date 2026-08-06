import { getShowcase } from '@/lib/course/showcase'
import { ShowcaseVideo } from '@/components/showcase-video'
import { ShowcaseFilter } from '@/components/showcase-filter'
import { AiDoublesBand } from '@/components/ai-doubles-band'
import type { Locale } from '@/lib/intake/types'

export function ShowcaseGallery({ locale }: { locale: Locale }) {
  const t = getShowcase(locale)

  return (
    <section className="home-section" style={{ padding: 'var(--section-gap) 2rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--section-label-size)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.6rem' }}>{t.label}</div>

        <ShowcaseVideo source={t.video.source} poster={t.video.poster} caption={t.video.caption} title={t.real.heading} captionTrack={t.video.captionTrack} transcript={t.video.transcript} locale={locale === 'en' ? 'en' : 'ru'} />

        <AiDoublesBand locale={locale} />

        <ShowcaseFilter data={t} locale={locale} />
      </div>
    </section>
  )
}
