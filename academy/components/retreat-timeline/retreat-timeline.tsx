'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import type { ContractModel, Venue } from '../../lib/retreat-calc/engine'
import { localToday } from '../../lib/retreat-core/dates'
import type { RetreatPassport } from '../../lib/retreat-core/passport'
import { decodeToolLink } from '../../lib/retreat-core/tool-link'
import { buildTimeline, validateTimeline, type TimelineTerms } from '../../lib/retreat-timeline/engine'
import { milestonesToCsv, milestonesToIcs } from '../../lib/retreat-timeline/export'
import {
  CALC_PATH, calcHashFromTimeline, defaultForm, draftOf, formFromDecoded, formFromDraft, localePath,
  pickTimelineTool, TIMELINE_DRAFT_KEY, TIMELINE_PATH, timelineHash, type TimelineForm, withPassportId,
} from '../../lib/retreat-timeline/form'
import { milestoneLabel, warningText, SOURCE_LABELS, STATUS_LABELS, WHO_LABELS } from '../../lib/retreat-timeline/labels'
import { MENU_PATH, menuHashFromPassport } from '../../lib/retreat-menu/form'
import { FORM_PATH, formHashFromPassport } from '../../lib/retreat-guest-form/form'
import { PROGRAM_PATH, programHashFromPassport } from '../../lib/retreat-program/form'
import { PassportBar } from '../retreat-core/passport-bar'
import { MoneyInput } from '../retreat-core/money-input'
import { ArrivalsPanel } from './arrivals-panel'
import { download } from './download'
import { TL_UI } from './ui'

// Текст/ссылки на бумаге — бронза (золото на светлом = 1.7:1)
const GOLD = 'var(--accent-ink)'

const field: React.CSSProperties = {
  width: '100%', padding: '0.45rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)',
}
const label: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }
const card: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }
const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'var(--text-lg)', margin: '2.25rem 0 0.9rem', color: 'var(--text-primary)' }
const button: React.CSSProperties = { ...field, width: 'auto', cursor: 'pointer' }

const shown = (n: number | undefined) => (n !== undefined && Number.isFinite(n) ? String(n) : '')
const parsed = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')))

export function RetreatTimeline({ locale }: { locale: Locale }) {
  const t = TL_UI[locale]
  const [today, setToday] = useState<string | null>(null)
  const [f, setF] = useState<TimelineForm | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [tab, setTab] = useState<'milestones' | 'arrivals'>('milestones')

  useEffect(() => {
    const now = localToday()
    setToday(now)
    const hash = window.location.hash
    if (hash) {
      const d = decodeToolLink(hash, pickTimelineTool, locale)
      const fromLink = formFromDecoded(d, now)
      if (fromLink) {
        setF(withPassportId(fromLink))
        setNotice(d.ok && d.kind === 'calc' ? t.loadedCalc : t.loaded)
        return
      }
      if (!d.ok) setNotice(d.error)
    }
    let draft: string | null = null
    try { draft = localStorage.getItem(TIMELINE_DRAFT_KEY) } catch { /* хранилище недоступно — начинаем с чистой формы */ }
    const fromDraft = formFromDraft(draft, now)
    if (fromDraft && !hash) setNotice(t.draftRestored)
    setF(withPassportId(fromDraft ?? defaultForm(now)))
  }, [locale, t.loaded, t.loadedCalc, t.draftRestored])

  useEffect(() => {
    if (!f) return
    try { localStorage.setItem(TIMELINE_DRAFT_KEY, draftOf(f)) } catch { /* черновик — удобство, без него всё работает */ }
  }, [f])

  const errors = useMemo(() => (f ? validateTimeline(f.passport, f.terms, locale) : []), [f, locale])
  const result = useMemo(() => (f && today && !errors.length ? buildTimeline(f.passport, f.terms, today) : null), [f, today, errors])

  if (!f) return null

  const setP = <K extends keyof RetreatPassport>(k: K, v: RetreatPassport[K]) => setF({ ...f, passport: { ...f.passport, [k]: v } })
  const setT = <K extends keyof TimelineTerms>(k: K, v: TimelineTerms[K]) => setF({ ...f, terms: { ...f.terms, [k]: v } })
  const setV = <K extends keyof Venue>(k: K, v: Venue[K]) => setT('venue', { ...f.terms.venue, [k]: v })
  const v = f.terms.venue
  const currency = f.passport.currency ?? 'USD'

  const money = (c: number) => {
    try {
      return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(c / 100)
    } catch {
      return `${Math.round(c / 100)} ${currency}`
    }
  }
  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(`${iso}T00:00:00Z`))

  const numberInput = (text: string, value: number | undefined, onChange: (n: number) => void) => (
    <label style={label}>{text}
      <input style={field} inputMode="numeric" value={shown(value)} onChange={(e) => onChange(parsed(e.target.value))} />
    </label>
  )
  const moneyInput = (text: string, cents: number, onChange: (c: number) => void) => (
    <label style={label}>{text}<MoneyInput locale={locale} value={cents} onChange={(value) => onChange(value ?? 0)} /></label>
  )

  const calcHref = localePath(CALC_PATH, locale) + calcHashFromTimeline(f)
  const copyLink = async () => {
    const url = `${window.location.origin}${localePath(TIMELINE_PATH, locale)}${timelineHash(f)}`
    try { await navigator.clipboard.writeText(url); setNotice(t.copied) } catch { window.location.hash = timelineHash(f) }
  }

  return (
    <div>
      <style>{`
        .tl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr)); gap: 0.9rem; }
        .tl-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
        .tl-table th, .tl-table td { padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--border-soft); text-align: left; vertical-align: top; }
        .tl-num { text-align: right !important; white-space: nowrap; }
        .tl-past { color: var(--text-secondary); }
      `}</style>

      <div className="tl-noprint"><PassportBar locale={locale} passport={f.passport} links={[
        { href: calcHref, label: t.openCalc },
        { href: localePath(MENU_PATH, locale) + menuHashFromPassport(f.passport), label: t.openMenu },
        { href: localePath(FORM_PATH, locale) + formHashFromPassport(f.passport), label: t.openForm },
        { href: localePath(PROGRAM_PATH, locale) + programHashFromPassport(f.passport), label: t.openProgram },
      ]} /></div>
      {notice && <p className="tl-noprint" role="status" style={{ ...card, color: GOLD, margin: '0 0 1.25rem' }}>{notice}</p>}

      <div className="tl-noprint"><h2 style={h2}>{t.retreat}</h2>
      <div className="tl-grid">
        <label style={label}>{t.titleLabel}<input style={field} value={f.passport.title ?? ''} onChange={(e) => setP('title', e.target.value || undefined)} /></label>
        <label style={label}>{t.currency}<input style={field} value={f.passport.currency ?? ''} maxLength={3}
          onChange={(e) => setP('currency', e.target.value.toUpperCase() || undefined)} /></label>
        <label style={label}>{t.start}<input type="date" style={field} value={f.passport.start ?? ''} onChange={(e) => setP('start', e.target.value || undefined)} /></label>
        {numberInput(t.nights, f.passport.nights, (n) => setP('nights', n))}
        {numberInput(t.guests, f.passport.guests, (n) => setP('guests', n))}
      </div></div>

      <div className="tl-noprint"><h2 style={h2}>{t.contract}</h2>
      <div className="tl-grid">
        <label style={label}>{t.signDate}<input type="date" style={field} value={f.terms.signDate} onChange={(e) => setT('signDate', e.target.value)} /></label>
        <label style={label}>{t.model}
          <select style={field} value={v.model} onChange={(e) => setV('model', e.target.value as ContractModel)}>
            <option value="full_campus">{t.models.full_campus}</option>
            <option value="per_guest">{t.models.per_guest}</option>
            <option value="buyout">{t.models.buyout}</option>
          </select>
        </label>
        {moneyInput(t.ratePerGuest, v.ratePerGuest, (c) => setV('ratePerGuest', c))}
        {v.model === 'full_campus' && numberInput(t.capacity, v.capacity, (n) => setV('capacity', n))}
        {v.model === 'per_guest' && numberInput(t.minGuests, v.minGuests, (n) => setV('minGuests', n))}
        {v.model === 'buyout' && moneyInput(t.buyoutFee, v.buyoutFee, (c) => setV('buyoutFee', c))}
        {numberInput(t.venueDepositPct, v.depositPct, (n) => setV('depositPct', n))}
        {numberInput(t.finalDueDays, v.finalDueDays, (n) => setV('finalDueDays', n))}
        {numberInput(t.venueNoReturnDays, f.terms.venueNoReturnDays, (n) => setT('venueNoReturnDays', n))}
        <label style={{ ...label, flexDirection: 'row', alignItems: 'center' }}>
          <input type="checkbox" checked={v.installments} onChange={(e) => setV('installments', e.target.checked)} /> {t.installments}
        </label>
        <label style={{ ...label, flexDirection: 'row', alignItems: 'center' }}>
          <input type="checkbox" checked={v.payInFull} onChange={(e) => setV('payInFull', e.target.checked)} /> {t.payInFull}
        </label>
      </div></div>

      <div className="tl-noprint"><h2 style={h2}>{t.guestTerms}</h2>
      <div className="tl-grid">
        {numberInput(t.guestBalanceDueDays, f.terms.guestBalanceDueDays, (n) => setT('guestBalanceDueDays', n))}
        {numberInput(t.guestRefundDays, f.terms.guestRefundDays, (n) => setT('guestRefundDays', n))}
      </div></div>

      {errors.length > 0 && (
        <div className="tl-noprint" role="alert" style={{ ...card, marginTop: '1.5rem', borderColor: 'var(--crit)' }}>
          <strong>{t.fix}</strong>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <div className="tl-noprint" role="tablist" aria-label={t.tabsLabel} style={{ display: 'flex', gap: '0.5rem', margin: '2.25rem 0 0' }}>
        {(['milestones', 'arrivals'] as const).map((k) => (
          <button key={k} role="tab" id={`tl-tab-${k}`} aria-controls={`tl-panel-${k}`} aria-selected={tab === k} onClick={() => setTab(k)} style={{
            ...button, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
            background: tab === k ? 'var(--accent-wash)' : 'var(--bg-surface)', borderColor: tab === k ? GOLD : 'var(--border-color)',
          }}>{k === 'milestones' ? t.tabMilestones : t.tabArrivals}</button>
        ))}
      </div>

      <div role="tabpanel" id="tl-panel-milestones" aria-labelledby="tl-tab-milestones" hidden={tab !== 'milestones'}>
      {result && (
        <>
          {result.warnings.length > 0 && (
            <div className="tl-noprint" style={{ ...card, marginTop: '1.25rem', borderColor: GOLD }}>
              <strong>{t.warnings}</strong>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>{result.warnings.map((w, k) => <li key={k}>{warningText(w, locale)}</li>)}</ul>
            </div>
          )}
          <h2 style={h2}>{t.milestones}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="tl-table">
               <thead><tr><th>{t.colDate}</th><th className="tl-num">{t.colDays}</th><th>{t.colWho}</th><th>{t.colWhat}</th>
                 <th className="tl-num">{t.colAmount}</th><th>{t.colStatus}</th><th>{t.colSource}</th></tr></thead>
              <tbody>{result.milestones.map((m, k) => (
                <tr key={k} className={today && m.date < today ? 'tl-past' : ''}>
                  <td style={{ whiteSpace: 'nowrap' }}>{date(m.date)}</td>
                  <td className="tl-num">{m.daysBefore}</td>
                  <td>{WHO_LABELS[locale][m.who]}</td>
                  <td>{milestoneLabel(m, locale)}</td>
                   <td className="tl-num">{m.amountCents === null ? '' : money(m.amountCents)}</td>
                   <td>{m.status ? STATUS_LABELS[locale][m.status] : ''}</td><td>{SOURCE_LABELS[locale][m.source]}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="tl-noprint" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button style={button} onClick={() => download(`timeline.${locale}.csv`, milestonesToCsv(result.milestones, locale), 'text/csv;charset=utf-8')}>{t.downloadCsv}</button>
            <button style={button} onClick={() => download('retreat.ics', milestonesToIcs(
              result.milestones, f.passport.title ?? '', locale,
              new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', f.passport.id,
            ), 'text/calendar;charset=utf-8')}>{t.downloadIcs}</button>
            <button style={button} onClick={() => window.print()}>{t.print}</button>
            <button style={button} onClick={copyLink}>{t.copyLink}</button>
          </div>
        </>
      )}
      </div>

      {/* панель не размонтируется при смене вкладки: строки гостей живут только в её состоянии */}
      <div className="tl-noprint" role="tabpanel" id="tl-panel-arrivals" aria-labelledby="tl-tab-arrivals" hidden={tab !== 'arrivals'} style={{ marginTop: '1.25rem' }}>
        <ArrivalsPanel locale={locale} passport={f.passport} />
      </div>

      <p style={{ ...label, marginTop: '2.5rem' }}>{t.disclaimer}</p>
    </div>
  )
}
