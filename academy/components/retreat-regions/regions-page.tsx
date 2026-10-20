import type { Locale } from '../../lib/dictionaries'
import { REGIONS_PATH, REGION_LESSON_URL, GUIDES, SOON } from '../../lib/retreat-regions/regions'
import { PLACE_TYPES } from '../../lib/retreat-regions/vocab'
import { localePath } from '../../lib/retreat-timeline/form'
import { BOOKLET_STYLE, GOLD, card } from '../retreat-booklet/styles'
import { REGIONS_UI } from './ui'

export function RegionsPage({ locale }: { locale: Locale }) {
  const t = REGIONS_UI[locale]
  const home = locale === 'en' ? '/en/' : '/'
  return <main style={mainStyle}><style>{BOOKLET_STYLE}</style>
    <section className="bk-wrap" style={wrapStyle}>
      <p className="bk-noprint" style={eyebrowStyle}>{t.eyebrow}</p>
      <h1 className="bk-noprint" style={titleStyle}>{t.h1}</h1>
      <p className="bk-noprint" style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', margin: '0 0 2rem', maxWidth: '46rem' }}>{t.lead}</p>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {PLACE_TYPES.map((place) => {
          const guides = GUIDES.filter((guide) => guide.placeType === place.id)
          const soon = SOON.filter((region) => region.placeType === place.id)
          return <section key={place.id} style={card}>
            <h2 style={placeTitleStyle}>{place.label[locale]}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{place.about[locale]}</p>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              {guides.map((guide) => <a key={guide.slug} href={localePath(`${REGIONS_PATH}${guide.slug}/`, locale)} style={linkStyle}>{guide.name[locale]}</a>)}
              {soon.map((region) => <span key={region.slug}>{region.name[locale]} — {t.soon}</span>)}
            </div>
          </section>
        })}
      </div>
      <p style={{ marginTop: '2rem' }}><a href={REGION_LESSON_URL[locale]} style={{ color: GOLD }}>{t.lesson} →</a></p>
      <p className="bk-noprint" style={{ marginTop: '3rem' }}><a href={home} style={{ color: GOLD, fontSize: 'var(--text-sm)' }}>{t.back}</a></p>
    </section>
  </main>
}

const mainStyle = { background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }
const wrapStyle = { maxWidth: '76rem', margin: '0 auto', padding: '6rem 2rem 5rem' }
const eyebrowStyle = { fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase' as const, letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }
const titleStyle = { fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', margin: '1rem 0 0.75rem', color: 'var(--text-primary)' }
const placeTitleStyle = { ...card, border: 0, padding: 0, fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }
const linkStyle = { color: GOLD, overflowWrap: 'anywhere' as const }
