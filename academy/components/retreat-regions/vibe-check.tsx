'use client'

import { useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import type { AudienceId, RegionGuide, ThemeId } from '../../lib/retreat-regions/types'
import { AUDIENCES, THEMES, VENUE_KINDS } from '../../lib/retreat-regions/vocab'
import { VERDICT_TEXT, vibeVerdict } from '../../lib/retreat-regions/verdict'
import { venueStale } from '../../lib/retreat-regions/check'
import { REGION_LESSON_URL } from '../../lib/retreat-regions/regions'
import { BOOKLET_STYLE, GOLD, card, field, h2, label } from '../retreat-booklet/styles'
import { REGIONS_UI } from './ui'

export function VibeCheck({ guide, locale, buildDate, initialTheme, initialAudience }: {
  guide: RegionGuide; locale: Locale; buildDate: string; initialTheme?: ThemeId; initialAudience?: AudienceId
}) {
  const t = REGIONS_UI[locale]
  const [theme, setTheme] = useState<ThemeId | ''>(initialTheme ?? '')
  const [audience, setAudience] = useState<AudienceId | ''>(initialAudience ?? '')
  const themeFit = theme ? guide.themes[theme] : null
  const audienceFit = audience ? guide.audiences[audience] : null
  const verdict = vibeVerdict(themeFit?.mark ?? null, audienceFit?.mark ?? null)
  const markLabel = (mark: string) => mark === 'match' ? t.fits : mark === 'clash' ? t.clashes : t.neutral
  const picked = (ids: string[]) => ids.includes(theme) || ids.includes(audience)
  return <div><style>{BOOKLET_STYLE}</style>
    <div style={pickerStyle}>
      <label style={label}>{t.myTheme}<select style={field} value={theme} onChange={(event) => setTheme(event.target.value as ThemeId)}>
        <option value="">{t.empty}</option>{THEMES.map((item) => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}
      </select></label>
      <label style={label}>{t.myAudience}<select style={field} value={audience} onChange={(event) => setAudience(event.target.value as AudienceId)}>
        <option value="">{t.empty}</option>{AUDIENCES.map((item) => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}
      </select></label>
      {verdict && <div role="status"><strong>{t.verdict}: {VERDICT_TEXT[verdict][locale]}</strong>
        {verdict === 'yes-but' && <p>{themeFit?.mark === 'clash' ? themeFit.why[locale] : audienceFit?.why[locale]}</p>}
      </div>}
    </div>
    <Section title={t.character}><p>{guide.character[locale]}</p></Section>
    <Section title={t.whoGoes}><p>{guide.whoGoes[locale]}</p></Section>
    <Section title={t.narrative}><p><em>{t.narrativeNote}</em></p><List items={guide.narrative.map((item) => item[locale])} /></Section>
    <Section title={t.culture}><p>{guide.culture.lands[locale]}</p><p>{guide.culture.asks[locale]}</p>
      <List items={guide.culture.links.map((source) => <a href={source.url} key={source.url} target="_blank" rel="noopener" style={linkStyle}>{source.title}</a>)} />
    </Section>
    <Section title={t.themes}><FitList items={THEMES.map((item) => ({
      id: item.id, label: item.label[locale], fit: guide.themes[item.id],
    }))} picked={theme} markLabel={markLabel} locale={locale} /></Section>
    <Section title={t.audiences}><FitList items={AUDIENCES.map((item) => ({
      id: item.id, label: item.label[locale], fit: guide.audiences[item.id],
    }))} picked={audience} markLabel={markLabel} locale={locale} /></Section>
    <Section title={t.suits}><p>{guide.verdict.yes[locale]}</p><p>{guide.verdict.no[locale]}</p></Section>
    <Section title={t.venues}>{guide.venues.length === 0 ? <p>{t.noVenues}</p> : <div style={venueListStyle}>
      {guide.venues.map((venue) => <VenueCard key={venue.name} venue={venue} locale={locale} buildDate={buildDate} picked={picked} t={t} />)}
    </div>}</Section>
    <Section title={t.technical}><p>{t.technicalText} <a href={technicalUrl(locale, 'logistics')} style={{ color: GOLD }}>{t.logistics}</a>
      {' '}{t.and} <a href={technicalUrl(locale, 'package')} style={{ color: GOLD }}>{t.package}</a>.</p></Section>
    <Section title={t.sources}><List items={guide.sources.map((source) => <span key={source.url}>
      <a href={source.url} target="_blank" rel="noopener" style={linkStyle}>{source.title}</a> — {t.accessed(source.accessed)}
    </span>)} /></Section>
    <p><a href={REGION_LESSON_URL[locale]} style={{ color: GOLD }}>{t.lesson} →</a></p>
  </div>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ margin: '0 0 2rem' }}>
    <h2 style={h2}>{title}</h2>{children}
  </section>
}
function List({ items }: { items: React.ReactNode[] }) {
  return <ul style={{ paddingLeft: '1.2rem' }}>
    {items.map((item, index) => <li key={index} style={linkStyle}>{item}</li>)}
  </ul>
}
function FitList({ items, picked, markLabel, locale }: {
  items: { id: string; label: string; fit: { mark: string; why: { ru: string; en: string } } }[]
  picked: string; markLabel: (mark: string) => string; locale: Locale
}) {
  return <div style={fitListStyle}>{items.map((item) => <div key={item.id}
    data-fit={item.id}
    data-picked={item.id === picked || undefined}
    style={{ ...card, outline: item.id === picked ? `2px solid ${GOLD}` : undefined }}>
    <strong>{item.label} — {markLabel(item.fit.mark)}</strong><p>{item.fit.why[locale]}</p>
  </div>)}</div>
}

function VenueCard({ venue, locale, buildDate, picked, t }: {
  venue: RegionGuide['venues'][number]; locale: Locale; buildDate: string
  picked: (ids: string[]) => boolean; t: typeof REGIONS_UI.ru
}) {
  const isPicked = picked([...venue.themes, ...venue.audiences])
  return <div data-picked={isPicked || undefined}
    style={{ ...card, outline: isPicked ? `2px solid ${GOLD}` : undefined }}>
    <strong>{venue.name}</strong><p>{VENUE_KINDS[venue.kind][locale]} — {venue.about[locale]}</p>
    <a href={venue.url} target="_blank" rel="noopener" style={linkStyle}>{venue.url}</a>
    <p>{t.venueChecked(venue.checked)}{venueStale(venue.checked, buildDate) && ` — ${t.venueStale}`}</p>
  </div>
}

function technicalUrl(locale: Locale, lesson: 'logistics' | 'package') {
  const base = locale === 'ru' ? 'https://academy.synergify.com/retrit/lessons/' : 'https://academy.synergify.com/retrit/en/lessons/'
  return `${base}${lesson === 'logistics' ? '04-vedushchiy-programma/u4-logistika/' : '05-ploshchadka-model/u1-paket-stavka/'}`
}

const pickerStyle = { ...card, display: 'grid', gap: '0.8rem', marginBottom: '2rem' }
const venueListStyle = { display: 'grid', gap: '0.7rem' }
const fitListStyle = { display: 'grid', gap: '0.5rem' }
const linkStyle = { color: GOLD, overflowWrap: 'anywhere' as const }
