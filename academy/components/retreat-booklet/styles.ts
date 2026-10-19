// Стили страницы буклета. Экран — токены темы академии (как у соседних инструментов). Предпросмотр и печать — «бумага»:
// светлый лист при любой теме, потому что буклет печатают и отправляют гостю. Размер листа (@page) задаёт компонент по
// выбору бумаги: внутри @page переменные CSS не работают.
import type { Accent, Paper } from '../../lib/retreat-booklet/form'

export const GOLD = 'var(--accent-ink)'
export const field: React.CSSProperties = {
  width: '100%', padding: '0.45rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontFamily: 'inherit',
}
export const label: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }
export const card: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }
export const button: React.CSSProperties = { ...field, width: 'auto', cursor: 'pointer' }
export const smallButton: React.CSSProperties = { ...button, padding: '0.2rem 0.5rem', fontSize: 'var(--text-xs)' }
export const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'var(--text-lg)', margin: '0 0 0.75rem', color: 'var(--text-primary)' }

/** Цвета акцента буклета — для бумаги, не для темы экрана. */
export const ACCENTS: Record<Accent, string> = { sand: '#b8925a', sage: '#7d9472', clay: '#b0674a', ink: '#34465c' }

export const pageRule = (paper: Paper) => `@page { size: ${paper === 'letter' ? 'Letter' : 'A4'}; margin: 16mm }`

export const BOOKLET_STYLE = `
.bk-layout { display: grid; grid-template-columns: minmax(20rem, 0.95fr) minmax(22rem, 1.05fr); gap: 1.5rem; align-items: start }
.bk-preview-col { position: sticky; top: 1rem; max-height: calc(100vh - 2rem); overflow: auto }
.bk-section { border-top: 1px solid var(--border-soft); padding: 1rem 0 0.4rem }
.bk-section-head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap }
.bk-section h3 { font-family: var(--font-display); font-weight: 400; font-size: var(--text-base); margin: 0 0 0.6rem; color: var(--text-primary) }
.bk-stack { display: grid; gap: 0.6rem }
.bk-row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap }
.bk-item { border: 1px solid var(--border-soft); border-radius: var(--radius); padding: 0.7rem; display: grid; gap: 0.5rem }
.bk-tag { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); letter-spacing: 0.06em }
.bk-hint { font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin: 0 }
.bk-thumb { width: 72px; height: 54px; object-fit: cover; border-radius: 4px; background: var(--bg-primary) }
.bk-print-errors { display: none }

.bk-paper { --bk-accent: ${ACCENTS.sand}; color: #2a2620; font-family: var(--font-body); line-height: 1.55; font-size: 14px;
  -webkit-print-color-adjust: exact; print-color-adjust: exact }
.bk-sheet { background: #fffdf8; padding: 2.2rem 2.4rem; margin: 0 0 1rem; box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12); border-radius: 2px }
.bk-sheet h2 { font-family: var(--font-display); font-weight: 400; font-size: 1.5rem; margin: 0 0 0.8rem; color: var(--bk-accent) }
.bk-sheet h3 { font-size: 1rem; margin: 1rem 0 0.4rem; color: #2a2620 }
.bk-sheet p, .bk-sheet li { max-width: 70ch }
.bk-sheet ul { padding-left: 1.2rem; margin: 0.3rem 0; list-style: disc }
.bk-sheet ol { padding-left: 1.4rem; margin: 0.3rem 0; list-style: decimal }
.bk-cover { min-height: 30rem; display: grid; align-content: end; padding: 0; overflow: hidden; position: relative;
  background: linear-gradient(160deg, var(--bk-accent), #fffdf8 75%) }
.bk-cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover }
.bk-cover-text { position: relative; background: rgba(255, 253, 248, 0.92); padding: 1.6rem 2.4rem }
.bk-cover-title { font-family: var(--font-display); font-weight: 300; font-size: 2.3rem; line-height: 1.15; margin: 0.2rem 0 0.4rem; color: #2a2620 }
.bk-cover-meta { color: var(--bk-accent); letter-spacing: 0.04em }
.bk-two { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem }
.bk-person { display: grid; grid-template-columns: 96px 1fr; gap: 1rem; align-items: start; break-inside: avoid; margin: 0 0 1rem }
.bk-person img, .bk-no-rights { width: 96px; height: 96px; object-fit: cover; border-radius: 50% }
.bk-no-rights { display: grid; place-items: center; background: #e9e4da; color: #6b6458; font-size: 10px; text-align: center; padding: 0.4rem }
.bk-photos { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; margin: 0.6rem 0 }
.bk-photos img, .bk-photos .bk-no-rights { width: 100%; height: 110px; border-radius: 3px }
.bk-table { width: 100%; border-collapse: collapse; font-size: 11px }
.bk-table th, .bk-table td { border: 1px solid #ddd5c6; padding: 3px 5px; text-align: left; vertical-align: top }
.bk-table th { background: #f3eee4 }
.bk-quote { border-left: 3px solid var(--bk-accent); padding: 0.2rem 0 0.2rem 0.9rem; margin: 0 0 0.8rem; break-inside: avoid }
.bk-dl dt { font-weight: 600; margin-top: 0.6rem }
.bk-dl dd { margin: 0.2rem 0 0 0 }
.bk-dates li { list-style: none; margin-left: -1.2rem }

@media (max-width: 900px) {
  .bk-layout { grid-template-columns: 1fr }
  .bk-preview-col { position: static; max-height: none }
  .bk-two { grid-template-columns: 1fr }
}

@media print {
  html, body, main { background: #fffdf8 !important }
  .bk-noprint { display: none !important }
  .bk-print-errors { display: block; break-after: page; border: 2px solid #b0674a; padding: 1rem 1.2rem; color: #2a2620 }
  .bk-layout { display: block }
  .bk-preview-col { position: static; max-height: none; overflow: visible }
  .bk-wrap { max-width: none !important; padding: 0 !important }
  .bk-sheet { box-shadow: none; margin: 0; padding: 0 0 1.2rem; break-inside: avoid-page }
  .bk-cover { break-after: page; min-height: 240mm }
  .bk-person, .bk-quote, .bk-table tr { break-inside: avoid }
}
`
