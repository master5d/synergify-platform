'use client'

import type { LandingExtras } from '../../lib/retreat-booklet/form'
import { button, card, field, label, smallButton } from '../retreat-booklet/styles'
import { landingUi } from './ui'
import type { Locale } from '../../lib/dictionaries'

export function landingFileName(title: string): string {
  const slug = title.normalize('NFKD').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
  return slug ? `${slug}.html` : 'retreat-landing.html'
}

export function ExtrasForm({ locale, value, onChange }: { locale: Locale; value: LandingExtras; onChange: (value: LandingExtras) => void }) {
  const t = landingUi(locale)
  const set = <K extends keyof LandingExtras>(key: K, next: LandingExtras[K]) => onChange({ ...value, [key]: next })
  return <div style={{ display: 'grid', gap: '1rem' }}>
    <div style={card}>
      <label style={label}>{t.subtitle}<textarea style={field} maxLength={200} value={value.subtitle} onChange={(e) => set('subtitle', e.target.value)} /></label>
      <label style={{ ...label, marginTop: '0.8rem' }}>{t.ctaLabel}<input style={field} maxLength={40} value={value.cta.label}
        onChange={(e) => set('cta', { ...value.cta, label: e.target.value })} /></label>
      <label style={{ ...label, marginTop: '0.8rem' }}>{t.ctaUrl}<input style={field} type="url" maxLength={500} value={value.cta.url}
        onChange={(e) => set('cta', { ...value.cta, url: e.target.value })} /></label>
      <p className="bk-hint" style={{ marginTop: '0.3rem' }}>{t.ctaHint}</p>
    </div>
    <div style={card}>
      <p style={{ ...label, margin: 0 }}>{t.numbers}</p>
      {value.numbers.map((number, index) => <div className="bk-row" style={{ marginTop: '0.5rem', alignItems: 'end' }} key={index}>
        <label style={{ ...label, flex: 1 }}>{t.value}<input style={field} maxLength={20} value={number.value} onChange={(e) => {
          const numbers = [...value.numbers]
          numbers[index] = { ...number, value: e.target.value }
          set('numbers', numbers)
        }} /></label>
        <label style={{ ...label, flex: 2 }}>{t.numberLabel}<input style={field} maxLength={60} value={number.label} onChange={(e) => {
          const numbers = [...value.numbers]
          numbers[index] = { ...number, label: e.target.value }
          set('numbers', numbers)
        }} /></label>
        <button type="button" style={smallButton} onClick={() => set('numbers', value.numbers.filter((_, i) => i !== index))}>{t.remove}</button>
      </div>)}
      {value.numbers.length < 4 && <button type="button" style={{ ...button, marginTop: '0.6rem' }}
        onClick={() => set('numbers', [...value.numbers, { value: '', label: '' }])}>{t.add}</button>}
    </div>
    <div style={card}>
      <label style={label}>{t.video}<input style={field} maxLength={500} value={value.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} /></label>
      <p className="bk-hint" style={{ marginTop: '0.3rem' }}>{t.videoHint}</p>
      <label style={{ ...label, marginTop: '0.8rem' }}>{t.price}<textarea style={field} maxLength={200} value={value.priceNote}
        onChange={(e) => set('priceNote', e.target.value)} /></label>
      <label className="bk-row" style={{ marginTop: '0.8rem', fontSize: 'var(--text-sm)' }}><input type="checkbox" checked={value.footer}
        onChange={(e) => set('footer', e.target.checked)} />{t.footer}</label>
    </div>
  </div>
}
