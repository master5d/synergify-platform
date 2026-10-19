import type { Locale } from '../../lib/dictionaries'
import { MONTHS } from '../../lib/retreat-venue/labels'
import { calcHrefForMonth, type VenueForm } from '../../lib/retreat-venue/form'
import { DAYS_IN_MONTH, type MonthInput, type MonthResult } from '../../lib/retreat-venue/engine'
import { MoneyInput } from './money-input'
import { card, field, h2, label } from './styles'
import { VY_UI } from './ui'

const money = (value: number, currency: string, locale: Locale) => {
  try {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency }).format(value / 100)
  } catch {
    return `${(value / 100).toFixed(2)} ${currency}`
  }
}
const pct = (value: number, locale: Locale) => (locale === 'ru' ? `${String(value).replace('.', ',')} %` : `${value}%`)
const integerValue = (text: string) => {
  const value = Number(text)
  return text.trim() === '' || !Number.isFinite(value) ? 0 : Math.max(0, Math.floor(value))
}

export function MonthsPanel({
  locale,
  form,
  results,
  onChange,
}: {
  locale: Locale
  form: VenueForm
  results: MonthResult[]
  onChange: (months: MonthInput[]) => void
}) {
  const t = VY_UI[locale]
  const set = (index: number, patch: Partial<MonthInput>) =>
    onChange(form.venue.months.map((month, n) => (n === index ? { ...month, ...patch } : month)))
  const integerInput = (
    index: number,
    text: string,
    value: number,
    key: 'retreatWeeks' | 'groupGuests' | 'offsiteGuests' | 'nightlyOccupancyPct' | 'gapDays',
    disabled = false,
  ) => (
    <input
      style={field}
      type="number"
      min="0"
      aria-label={`${text} · ${MONTHS[locale][index]}`}
      value={value}
      disabled={disabled}
      onChange={(event) => set(index, { [key]: integerValue(event.target.value) })}
    />
  )
  const rateInput = (index: number, month: MonthInput, disabled: boolean) => (
    <MoneyInput
      nullable
      locale={locale}
      value={month.rateCents}
      label={`${t.monthRate} · ${MONTHS[locale][index]}`}
      disabled={disabled}
      onChange={(value) => set(index, { rateCents: value })}
    />
  )
  // у закрытого месяца калькулятор не нужен; ссылка — не кнопка-коробка, чтобы не ломать узкую колонку
  const calcLink = (index: number, closed: boolean) =>
    closed ? null : (
      <a className="vy-calc vy-noprint" href={calcHrefForMonth(form, index + 1, locale)}>
        {t.toCalc} →
      </a>
    )
  const fields = (month: MonthInput, index: number, disabled: boolean) => (
    <>
      <label style={label}>
        {t.weeks}
        {integerInput(index, t.weeks, month.retreatWeeks, 'retreatWeeks', disabled)}
      </label>
      <label style={label}>
        {t.guests}
        {integerInput(index, t.guests, month.groupGuests, 'groupGuests', disabled)}
      </label>
      <label style={label}>
        {t.offsite}
        {integerInput(index, t.offsite, month.offsiteGuests, 'offsiteGuests', disabled)}
      </label>
      <label style={label}>
        {t.monthRate}
        <small>{t.monthRateHint}</small>
        {rateInput(index, month, disabled)}
      </label>
      <label style={label}>
        {t.occupancy}
        {integerInput(index, t.occupancy, month.nightlyOccupancyPct, 'nightlyOccupancyPct', disabled)}
      </label>
      <label style={label}>
        {t.gapDays}
        {integerInput(index, t.gapDays, month.gapDays, 'gapDays', disabled)}
      </label>
    </>
  )
  // поля закрытого месяца заперты, пока в них нечего править; гости или неверные дни (например, из ссылки) — открыты,
  // иначе замечание «месяц закрыт, а в нём стоят гости» не убрать, не открыв месяц
  const locked = (month: MonthInput, index: number, closed: boolean) =>
    closed && month.retreatWeeks === 0 && month.nightlyOccupancyPct === 0 && month.gapDays <= DAYS_IN_MONTH[index]
  const row = (month: MonthInput, result: MonthResult, index: number) => {
    const closed = form.venue.type === 'seasonal' && !month.open
    const off = locked(month, index, closed)
    return (
      <tr className={closed ? 'closed' : undefined} key={index}>
        <th>
          {MONTHS[locale][index]}
          {closed && <small> ({t.closed})</small>}
        </th>
        <td>
          {form.venue.type === 'seasonal' ? (
            <input
              type="checkbox"
              checked={month.open}
              aria-label={`${t.open} · ${MONTHS[locale][index]}`}
              onChange={(event) => set(index, { open: event.target.checked })}
            />
          ) : (
            '✓'
          )}
        </td>
        <td>{integerInput(index, t.weeks, month.retreatWeeks, 'retreatWeeks', off)}</td>
        <td>{integerInput(index, t.guests, month.groupGuests, 'groupGuests', off)}</td>
        <td>{integerInput(index, t.offsite, month.offsiteGuests, 'offsiteGuests', off)}</td>
        <td>{rateInput(index, month, off)}</td>
        <td>{integerInput(index, t.occupancy, month.nightlyOccupancyPct, 'nightlyOccupancyPct', off)}</td>
        <td>{integerInput(index, t.gapDays, month.gapDays, 'gapDays', off)}</td>
        <td>
          {money(result.resultCents, form.currency, locale)}
          <br />
          {pct(result.occupancyPct, locale)}
        </td>
        <td>{result.weekContributionCents === null ? '—' : money(result.weekContributionCents, form.currency, locale)}</td>
        <td>{calcLink(index, closed)}</td>
      </tr>
    )
  }
  return (
    <section className="vy-print-months">
      <h2 style={h2}>{t.months}</h2>
      <p className="vy-hint">{t.monthsHint}</p>
      <div className="vy-month-table">
        <table>
          <thead>
            <tr>
              <th>{t.month}</th>
              <th>{t.open}</th>
              <th>{t.weeks}</th>
              <th>{t.guests}</th>
              <th>{t.offsite}</th>
              <th>{t.monthRate}</th>
              <th>{t.occupancy}</th>
              <th>{t.gapDays}</th>
              <th>{t.monthResult}</th>
              <th title={t.weekContributionHint}>{t.weekContribution}*</th>
              <th />
            </tr>
          </thead>
          <tbody>{form.venue.months.map((month, index) => row(month, results[index], index))}</tbody>
        </table>
        <p className="vy-hint">* {t.weekContributionHint}</p>
      </div>
      <div className="vy-month-cards">
        {form.venue.months.map((month, index) => {
          const result = results[index]
          const closed = form.venue.type === 'seasonal' && !month.open
          return (
            <article style={card} className={closed ? 'closed' : undefined} key={index}>
              <h3>
                {MONTHS[locale][index]}
                {closed && ` (${t.closed})`}
              </h3>
              {form.venue.type === 'seasonal' && (
                <label style={label}>
                  {t.open}
                  <input
                    type="checkbox"
                    checked={month.open}
                    aria-label={`${t.open} · ${MONTHS[locale][index]}`}
                    onChange={(event) => set(index, { open: event.target.checked })}
                  />
                </label>
              )}
              <div className="vy-fields">{fields(month, index, locked(month, index, closed))}</div>
              <p>
                {t.monthResult}: {money(result.resultCents, form.currency, locale)}
                <br />
                {t.monthOccupancy}: {pct(result.occupancyPct, locale)}
                <br />
                {t.weekContribution}:{' '}
                {result.weekContributionCents === null ? '—' : money(result.weekContributionCents, form.currency, locale)}
              </p>
              {calcLink(index, closed)}
            </article>
          )
        })}
      </div>
    </section>
  )
}
