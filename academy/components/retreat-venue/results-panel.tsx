import type { Locale } from '../../lib/dictionaries'
import { paybackText, SCENARIO, TOTALS } from '../../lib/retreat-venue/labels'
import { computeYear, type VenueYear } from '../../lib/retreat-venue/engine'
import { card, h2 } from './styles'
import { VY_UI } from './ui'

const money = (value: number, currency: string, locale: Locale) => {
  try {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency }).format(value / 100)
  } catch {
    return `${(value / 100).toFixed(2)} ${currency}`
  }
}
const years = (value: number | null, invested: number, locale: Locale) =>
  paybackText(value, invested, locale, (y) => TOTALS[locale].years(y.toFixed(1).replace('.', locale === 'ru' ? ',' : '.')))
const percent = (value: number | null, locale: Locale) =>
  value === null ? '—' : locale === 'ru' ? `${value.toFixed(1).replace('.', ',')} %` : `${value.toFixed(1)}%`

export function ResultsPanel({ locale, venue, currency }: { locale: Locale; venue: VenueYear; currency: string }) {
  const t = VY_UI[locale]
  const totals = TOTALS[locale]
  const result = computeYear(venue)
  const cards = [
    [totals.revenue, money(result.revenueCents, currency, locale)],
    [totals.noi, money(result.noiCents, currency, locale)],
    [totals.tax, money(result.taxCents, currency, locale)],
    [totals.ownerCash, money(result.ownerCashCents, currency, locale)],
    [totals.yieldPct, percent(result.yieldPct, locale)],
    [totals.payback, years(result.paybackYears, venue.investmentCents, locale)],
    [totals.ownPayback, years(result.ownPaybackYears, venue.investmentCents - venue.borrowedCents, locale)],
  ]
  return (
    <section className="vy-print-results">
      <h2 style={h2}>{t.results}</h2>
      <div className="vy-results">
        {cards.map(([title, value]) => (
          <article style={card} key={title}>
            <small>{title}</small>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <h2 style={h2}>{t.scenarios}</h2>
      <p className="vy-hint">{t.scenariosHint}</p>
      <div className="vy-results">
        {(['as-set', 'nightly-only', 'retreats-only'] as const).map((scenario) => {
          const item = computeYear(venue, scenario)
          return (
            <article style={card} key={scenario}>
              <small>{SCENARIO[locale][scenario]}</small>
              <span>
                {t.scenarioRevenue}: <strong>{money(item.revenueCents, currency, locale)}</strong>
              </span>
              <span>
                {t.scenarioNoi}: {money(item.noiCents, currency, locale)}
              </span>
              <span>
                {t.scenarioPayback}: {years(item.paybackYears, venue.investmentCents, locale)}
              </span>
            </article>
          )
        })}
      </div>
    </section>
  )
}
