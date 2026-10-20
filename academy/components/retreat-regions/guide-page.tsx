import type { Locale } from '../../lib/dictionaries'
import type { RegionGuide } from '../../lib/retreat-regions/types'
import { PLACE_TYPES } from '../../lib/retreat-regions/vocab'
import { REGIONS_UI } from './ui'
import { BOOKLET_STYLE, GOLD } from '../retreat-booklet/styles'
import { VibeCheck } from './vibe-check'

export function GuidePage({ locale, guide, buildDate }: { locale: Locale; guide: RegionGuide; buildDate: string }) {
  const t = REGIONS_UI[locale]
  const home = locale === 'en' ? '/en/instrumenty/regiony/' : '/instrumenty/regiony/'
  return <main style={mainStyle}><style>{BOOKLET_STYLE}</style>
    <section className="bk-wrap" style={wrapStyle}>
      <p className="bk-noprint" style={eyebrowStyle}>{t.eyebrow}</p>
      <h1 className="bk-noprint" style={titleStyle}>{guide.name[locale]}</h1>
      <p style={{ color: 'var(--text-secondary)', margin: '0 0 2rem' }}>{PLACE_TYPES.find((p) => p.id === guide.placeType)?.label[locale]}</p>
      <VibeCheck guide={guide} locale={locale} buildDate={buildDate} />
      <p className="bk-noprint" style={{ marginTop: '3rem' }}><a href={home} style={{ color: GOLD, fontSize: 'var(--text-sm)' }}>{t.backToRegions}</a></p>
    </section>
  </main>
}

const mainStyle = { background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }
const wrapStyle = { maxWidth: '76rem', margin: '0 auto', padding: '6rem 2rem 5rem' }
const eyebrowStyle = { fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase' as const, letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }
const titleStyle = { fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', margin: '1rem 0 0.4rem', color: 'var(--text-primary)' }

