import type { Locale } from '../../lib/dictionaries'
import { BOOKLET_STYLE, GOLD, card, field, h2, label } from '../retreat-booklet/styles'
import { UI } from './ui'
import { LadderGrid } from './ladder-grid'
import { MyMapBlock } from './my-map'

export function LadderPage({ locale }: { locale: Locale }) {
  const t = UI[locale]
  // Клетки каналов — три колонки, признаки и «Моя карта» — две; на ширине < 720 px всё в столбец
  const ladderStyle = ' .ladder-channels { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .7rem }'
    + ' .ladder-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 1rem 0 }'
    + ' @media (max-width: 720px) { .ladder-channels, .ladder-two { grid-template-columns: 1fr } }'
  return <main style={mainStyle}><style>{BOOKLET_STYLE}</style><style>{ladderStyle}</style>
    <div className="bk-wrap" style={wrapStyle}>
      <p className="bk-noprint" style={eyebrowStyle}>{t.eyebrow}</p>
      <h1 style={titleStyle}>{t.title}</h1><p style={leadStyle}>{t.lead}</p>
      <LadderGrid locale={locale} /><MyMapBlock locale={locale} />
    </div>
  </main>
}

const mainStyle = { background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }
const wrapStyle = { maxWidth: '80rem', margin: '0 auto', padding: '6rem 2rem 5rem' }
const eyebrowStyle = { fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase' as const, letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }
const titleStyle = { fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', margin: '1rem 0 0.75rem', color: 'var(--text-primary)' }
const leadStyle = { ...label, display: 'block', lineHeight: 1.7, fontSize: 'var(--text-base)', maxWidth: '58rem', margin: '0 0 2rem' }
