'use client'
import { useEffect, useRef, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { decodeToolLink, TOOL_MAX_FRAGMENT } from '../../lib/retreat-core/tool-link'
import { localePath } from '../../lib/retreat-timeline/form'
import { PROGRAM_PATH, programHashFromPassport } from '../../lib/retreat-program/form'
import { venueToCsv } from '../../lib/retreat-venue/export'
import { checkVenue, computeYear, defaultVenue, validateVenue, type VenueYear } from '../../lib/retreat-venue/engine'
import { DISCLAIMER, DEAL, issueText, VENUE_TYPE } from '../../lib/retreat-venue/labels'
import {
  defaultVenueForm,
  draftOf,
  draftWorthKeeping,
  formFromDraft,
  venueFromDecoded,
  venueHash,
  VENUE_DRAFT_KEY,
  VENUE_PREV_KEY,
  calcHrefForMonth,
  VENUE_PATH,
  type VenueForm,
  pickVenueTool,
} from '../../lib/retreat-venue/form'
import { PassportBar } from '../retreat-core/passport-bar'
import { download } from '../retreat-timeline/download'
import { MonthsPanel } from './months-panel'
import { ResultsPanel } from './results-panel'
import { venueFieldName, VY_UI } from './ui'
import { button, card, field, h2, label } from './styles'
import { MoneyInput } from './money-input'

const numberValue = (text: string) => {
  const value = Number(text)
  return text.trim() === '' || !Number.isFinite(value) ? 0 : value
}

export function RetreatVenue({ locale }: { locale: Locale }) {
  const t = VY_UI[locale]
  const [form, setForm] = useState<VenueForm | null>(null)
  const [notice, setNotice] = useState('')
  const [previous, setPrevious] = useState<VenueForm | null>(null)
  // набираемый код валюты: неполный («EU») живёт только в поле, в модель и ссылку уходит код из трёх букв
  const [currencyText, setCurrencyText] = useState<string | null>(null)
  // последняя площадка без ошибок ввода: расчёт бросает на неверных данных, а страница падать не должна
  const lastValid = useRef<VenueYear>(defaultVenue())
  useEffect(() => {
    const decoded = window.location.hash ? venueFromDecoded(decodeToolLink(window.location.hash, pickVenueTool, locale)) : null
    let saved: string | null = null
    let parked: string | null = null
    try {
      saved = localStorage.getItem(VENUE_DRAFT_KEY)
      parked = localStorage.getItem(VENUE_PREV_KEY)
    } catch {
      /* браузер может запретить хранилище */
    }
    const draft = formFromDraft(saved)
    const linked = decoded?.form
    const keep = Boolean(linked && decoded?.linkHasVenue && draftWorthKeeping(saved, linked))
    const opened = linked
      ? decoded?.linkHasVenue
        ? linked
        : { ...(draft ?? defaultVenueForm()), currency: linked.currency, title: linked.title }
      : null
    if (keep && draft) {
      setPrevious(draft)
      try {
        localStorage.setItem(VENUE_PREV_KEY, draftOf(draft))
      } catch {
        /* без хранилища отложить нельзя */
      }
    } else {
      const old = formFromDraft(parked)
      if (old) setPrevious(old)
    }
    setForm(opened ?? draft ?? defaultVenueForm())
    setNotice(keep ? t.linkOpened : linked ? t.loaded : window.location.hash ? t.linkBroken : draft ? t.draftRestored : '')
  }, [locale, t.draftRestored, t.linkBroken, t.linkOpened, t.loaded])
  useEffect(() => {
    if (form)
      try {
        localStorage.setItem(VENUE_DRAFT_KEY, draftOf(form))
      } catch {
        /* без хранилища не сохраняем */
      }
  }, [form])
  if (!form) return null
  const venue = form.venue
  const errors = validateVenue(venue, locale, (field) => venueFieldName(field, locale))
  if (errors.length === 0) lastValid.current = venue
  const counted = lastValid.current
  const year = computeYear(counted)
  const issues = errors.length ? [] : checkVenue(venue)
  const setVenue = (patch: Partial<VenueYear>) => setForm({ ...form, venue: { ...venue, ...patch } })
  const moneyField = (key: keyof VenueYear, text: string) => (
    <label style={label}>
      {text}
      <MoneyInput locale={locale} value={venue[key] as number} onChange={(value) => setVenue({ [key]: value ?? 0 })} />
    </label>
  )
  const intField = (key: keyof VenueYear, text: string) => (
    <label style={label}>
      {text}
      <input
        style={field}
        type="number"
        min="0"
        value={venue[key] as number}
        onChange={(event) => setVenue({ [key]: numberValue(event.target.value) })}
      />
    </label>
  )
  const copyLink = async () => {
    const hash = venueHash(form)
    if (hash.length > TOOL_MAX_FRAGMENT) return setNotice(t.tooLong)
    const url = `${window.location.origin}${localePath(VENUE_PATH, locale)}${hash}`
    try {
      await navigator.clipboard.writeText(url)
      setNotice(t.copied)
    } catch {
      window.location.hash = hash
    }
  }
  return (
    <div className="vy-content">
      <PassportBar
        locale={locale}
        passport={{ title: form.title, currency: form.currency }}
        links={[
          { href: calcHrefForMonth(form, 1, locale), label: t.openCalc },
          {
            href: localePath(PROGRAM_PATH, locale) + programHashFromPassport({ title: form.title, currency: form.currency }),
            label: t.openProgram,
          },
        ]}
      />
      {notice && (
        <p role="status" style={{ ...card, color: 'var(--accent-ink)' }}>
          {notice}
        </p>
      )}
      {previous && (
        <p>
          <button
            style={button}
            onClick={() => {
              setForm(previous)
              setPrevious(null)
              setNotice(t.draftBack)
              try {
                localStorage.removeItem(VENUE_PREV_KEY)
              } catch {
                /* нечего очищать */
              }
            }}
          >
            {t.restoreDraft}
          </button>
        </p>
      )}
      <h2 style={h2}>{t.venue}</h2>
      <div className="vy-fields">
        <label style={label}>
          {t.type}
          <select style={field} value={venue.type} onChange={(e) => setVenue({ type: e.target.value as VenueYear['type'] })}>
            {Object.entries(VENUE_TYPE[locale]).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label style={label}>
          {t.titleLabel}
          <input style={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label style={label}>
          {t.currency}
          <input
            style={field}
            maxLength={3}
            pattern="[A-Za-z]{3}"
            value={currencyText ?? form.currency}
            onChange={(e) => {
              const next = e.target.value.toUpperCase()
              if (!/^[A-Z]{0,3}$/.test(next)) return
              setCurrencyText(next)
              if (next.length === 3) setForm({ ...form, currency: next })
            }}
            onBlur={() => setCurrencyText(null)}
          />
        </label>
        {intField('units', `${t.units} (${t.unitsHint})`)}
        {intField('groupBeds', t.groupBeds)}
        {moneyField('nightPriceCents', t.nightPrice)}
        <label style={label}>
          {t.deal}
          <select style={field} value={venue.deal} onChange={(e) => setVenue({ deal: e.target.value as VenueYear['deal'] })}>
            {Object.entries(DEAL[locale]).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </label>
        {moneyField('rateCents', t.rate)}
        {venue.deal === 'per_guest' && intField('minGuests', t.minGuests)}
        {venue.deal === 'buyout' && moneyField('buyoutFeeCents', t.buyoutFee)}
      </div>
      <h2 style={h2}>{t.costs}</h2>
      <div className="vy-fields">
        {moneyField('varPerGuestWeekCents', t.varPerGuestWeek)}
        {moneyField('varPerNightCents', t.varPerNight)}
        {moneyField('fixedOpenMonthCents', t.fixedOpen)}
        {venue.type === 'seasonal' && moneyField('fixedClosedMonthCents', t.fixedClosed)}
        {moneyField('insuranceCents', t.insurance)}
        {moneyField('replacementReserveCents', t.reserve)}
        <label style={label}>
          {t.taxPct}
          <small>{t.taxHint}</small>
          <input
            style={field}
            type="number"
            min="0"
            max="100"
            value={venue.taxPct}
            onChange={(e) => setVenue({ taxPct: numberValue(e.target.value) })}
          />
        </label>
        {moneyField('debtServiceCents', t.debt)}
        {venue.type === 'seasonal' && (
          <>
            {moneyField('seasonOpenCents', t.seasonOpen)}
            {moneyField('seasonCloseCents', t.seasonClose)}
          </>
        )}
        {moneyField('investmentCents', t.investment)}
        {moneyField('borrowedCents', t.borrowed)}
      </div>
      {errors.length > 0 && (
        <div role="alert" style={{ ...card, marginTop: '1rem' }}>
          <strong>{t.fix}</strong>
          <p>{t.invalidHint}</p>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <MonthsPanel locale={locale} form={form} results={year.months} onChange={(months) => setVenue({ months })} />
      <ResultsPanel locale={locale} venue={counted} currency={form.currency} />
      <h2 style={h2}>{t.issues}</h2>
      {issues.length ? (
        <div role="alert" style={card}>
          {issues.map((issue, index) => (
            <p key={`${issue.id}-${index}`}>{issueText(issue, locale)}</p>
          ))}
        </div>
      ) : (
        <p>{t.noIssues}</p>
      )}
      <div className="vy-actions">
        <button
          style={button}
          disabled={errors.length > 0}
          onClick={() => download(`venue-year.${locale}.csv`, venueToCsv(counted, locale), 'text/csv;charset=utf-8')}
        >
          {t.downloadCsv}
        </button>
        <button style={button} disabled={errors.length > 0} onClick={() => window.print()}>
          {t.print}
        </button>
        <button style={button} onClick={copyLink}>
          {t.copyLink}
        </button>
      </div>
      <p className="vy-disclaimer">{DISCLAIMER[locale]}</p>
    </div>
  )
}
