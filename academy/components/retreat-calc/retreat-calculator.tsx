'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { compute, profitGrid, validate, type ContractModel } from '../../lib/retreat-calc/engine'
import { applyLink, DEFAULT_FORM, num, toInputs, type Form, type SalesPreset } from '../../lib/retreat-calc/form'
import { decodeLink } from '../../lib/retreat-calc/link'
import { localToday } from '../../lib/retreat-core/dates'
import { localePath, TIMELINE_PATH, timelineHashFromCalcForm } from '../../lib/retreat-timeline/form'
import { RC_UI } from './ui'

// Текст/ссылки на бумаге — бронза (золото на светлом = 1.7:1)
const GOLD = 'var(--accent-ink)'

const field: React.CSSProperties = {
  width: '100%', padding: '0.45rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)',
}
const label: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }
const card: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }
const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'var(--text-lg)', margin: '2.25rem 0 0.9rem', color: 'var(--text-primary)' }

export function RetreatCalculator({ locale }: { locale: Locale }) {
  const t = RC_UI[locale]
  const [f, setF] = useState<Form>(DEFAULT_FORM)
  const [notice, setNotice] = useState<string | null>(null)
  const [view, setView] = useState<'leader' | 'venue'>('leader')

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const decoded = decodeLink(hash, locale)
    if (!decoded.ok) { setNotice(decoded.error); return }
    setF((prev) => applyLink(prev, decoded.data))
    setNotice(t.loaded)
  }, [t.loaded, locale])

  // дни до старта приходят из таймлайна вместе с месяцами; поменяли месяцы руками — дни устарели и больше не действуют
  const set = <K extends keyof Form>(k: K) => (value: Form[K]) =>
    setF((prev) => ({ ...prev, [k]: value, ...(k === 'monthsToStart' ? { daysToStart: undefined } : {}) }))
  const inputs = useMemo(() => toInputs(f), [f])
  const errors = useMemo(() => validate(inputs, locale), [inputs, locale])
  const result = useMemo(() => (errors.length ? null : compute(inputs, locale)), [inputs, errors, locale])

  const money = (c: number) => {
    try {
      return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ru-RU', { style: 'currency', currency: f.currency, maximumFractionDigits: 0 }).format(c / 100)
    } catch {
      return `${Math.round(c / 100)} ${f.currency}`
    }
  }
  const monthLabel = (m: number) => (m === inputs.monthsToStart ? t.startMonth : t.monthN(m))

  const priceSteps = useMemo(() => {
    const p = inputs.pricePerGuest
    if (!Number.isFinite(p) || p <= 0) return []
    // строка «0 %» — ровно введённая цена; соседние — круглые до $100, без повторов (ключ строки — цена)
    const steps = [-20, -10, 0, 10, 20].map((d) => (d === 0 ? p : Math.round((p * (100 + d)) / 100 / 10000) * 10000))
    return Array.from(new Set(steps.filter((x) => x > 0))).sort((a, b) => a - b)
  }, [inputs.pricePerGuest])
  const guestSteps = useMemo(() => {
    const g = inputs.guests
    if (!Number.isInteger(g)) return []
    const cap = inputs.venue.model === 'full_campus' ? inputs.venue.capacity : Infinity
    return Array.from(new Set([g - 6, g - 4, g - 2, g, g + 2].filter((x) => x >= 0 && x <= cap))).sort((a, b) => a - b)
  }, [inputs.guests, inputs.venue.model, inputs.venue.capacity])
  const grid = useMemo(() => (result ? profitGrid(inputs, priceSteps, guestSteps) : []), [result, inputs, priceSteps, guestSteps])

  const num2 = (k: keyof Form, text: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label style={label}>{text}
      <input style={field} inputMode="decimal" value={f[k] as string} onChange={(e) => set(k)(e.target.value as never)} {...extra} />
    </label>
  )

  return (
    <div>
      <style>{`
        .rc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr)); gap: 0.9rem; }
        .rc-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
        .rc-table th, .rc-table td { padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--border-soft); text-align: right; }
        .rc-table th:first-child, .rc-table td:first-child { text-align: left; }
        .rc-neg { color: var(--crit); }
        .rc-gap { background: var(--accent-wash); }
      `}</style>

      {notice && <p role="status" style={{ ...card, color: GOLD, margin: '0 0 1.25rem' }}>{notice}</p>}

      <div role="tablist" aria-label={t.viewLabel} style={{ display: 'flex', gap: '0.5rem', margin: '0 0 0.5rem' }}>
        {(['leader', 'venue'] as const).map((v) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} style={{
            ...field, width: 'auto', cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
            background: view === v ? 'var(--accent-wash)' : 'var(--bg-surface)', borderColor: view === v ? GOLD : 'var(--border-color)',
          }}>{v === 'leader' ? t.viewLeader : t.viewVenue}</button>
        ))}
      </div>

      <h2 style={h2}>{t.retreat}</h2>
      <div className="rc-grid">
        <label style={label}>{t.titleLabel}<input style={field} value={f.title} onChange={(e) => set('title')(e.target.value)} /></label>
        <label style={label}>{t.currency}<input style={field} value={f.currency} maxLength={3} onChange={(e) => set('currency')(e.target.value.toUpperCase())} /></label>
        {num2('price', t.price)}
        {num2('guests', t.guests)}
        {num2('nights', t.nights)}
        {num2('monthsToStart', t.monthsToStart)}
        <label style={label}>{t.depositMode}
          <select style={field} value={f.depositMode} onChange={(e) => set('depositMode')(e.target.value as Form['depositMode'])}>
            <option value="pct">{t.depositPct}</option><option value="amount">{t.depositAmount}</option>
          </select>
        </label>
        {num2('deposit', f.depositMode === 'pct' ? t.depositPct : t.depositAmount)}
        {num2('balanceDueDays', t.balanceDueDays)}
      </div>
      <div style={{ margin: '0.9rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={label}>{t.priceSlider}
          <input type="range" style={{ accentColor: 'var(--accent)' }} min={0} max={Math.max(20000, Math.round(num(f.price) * 2) || 0)} step={50} value={num(f.price) || 0}
            onChange={(e) => set('price')(e.target.value)} />
        </label>
        <label style={label}>{t.guestsSlider}
          <input type="range" style={{ accentColor: 'var(--accent)' }} min={0} max={f.model === 'full_campus' ? Math.max(1, num(f.capacity) || 1) : 100} step={1}
            value={num(f.guests) || 0} onChange={(e) => set('guests')(e.target.value)} />
        </label>
      </div>

      <h2 style={h2}>{t.venue}</h2>
      <div className="rc-grid">
        <label style={label}>{t.model}
          <select style={field} value={f.model} onChange={(e) => set('model')(e.target.value as ContractModel)}>
            <option value="full_campus">{t.models.full_campus}</option>
            <option value="per_guest">{t.models.per_guest}</option>
            <option value="buyout">{t.models.buyout}</option>
          </select>
        </label>
        {num2('rate', f.model === 'buyout' ? t.ratePerGuestBuyout : t.ratePerGuest)}
        {f.model === 'full_campus' && num2('capacity', t.capacity)}
        {f.model === 'per_guest' && num2('minGuests', t.minGuests)}
        {f.model === 'buyout' && num2('buyoutFee', t.buyoutFee)}
        {num2('venueDepositPct', t.venueDepositPct)}
        {num2('finalDueDays', t.finalDueDays)}
        {num2('discountPct', t.discountPct)}
        <label style={{ ...label, flexDirection: 'row', alignItems: 'center' }}>
          <input type="checkbox" checked={f.installments} onChange={(e) => set('installments')(e.target.checked)} /> {t.installments}
        </label>
        <label style={{ ...label, flexDirection: 'row', alignItems: 'center' }}>
          <input type="checkbox" checked={f.payInFull} onChange={(e) => set('payInFull')(e.target.checked)} /> {t.payInFull}
        </label>
      </div>

      {view === 'leader' && (
        <>
          <h2 style={h2}>{t.costs}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {f.costs.map((c, k) => (
              <div key={k} className="rc-grid" style={{ alignItems: 'end' }}>
                <label style={label}>{t.costName}<input style={field} value={c.name}
                  onChange={(e) => set('costs')(f.costs.map((x, j) => (j === k ? { ...x, name: e.target.value } : x)))} /></label>
                <label style={label}>{t.costAmount}<input style={field} inputMode="decimal" value={c.amount}
                  onChange={(e) => set('costs')(f.costs.map((x, j) => (j === k ? { ...x, amount: e.target.value } : x)))} /></label>
                <label style={label}>{t.costWhen}<input style={field} inputMode="numeric" value={c.monthsBeforeStart}
                  onChange={(e) => set('costs')(f.costs.map((x, j) => (j === k ? { ...x, monthsBeforeStart: e.target.value } : x)))} /></label>
                <button style={{ ...field, width: 'auto', cursor: 'pointer' }} onClick={() => set('costs')(f.costs.filter((_, j) => j !== k))}>{t.remove}</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {t.costPresets.map((name) => (
                <button key={name} style={{ ...field, width: 'auto', cursor: 'pointer' }}
                  onClick={() => set('costs')([...f.costs, { name, amount: '0', monthsBeforeStart: '1' }])}>+ {name}</button>
              ))}
            </div>
          </div>
          <div className="rc-grid" style={{ marginTop: '0.9rem' }}>
            {num2('perGuestCost', t.perGuestCost)}
            {num2('revenuePct', t.revenuePct)}
            <label style={label}>{t.sales}
              <select style={field} value={f.sales} onChange={(e) => set('sales')(e.target.value as SalesPreset)}>
                <option value="even">{t.salesEven}</option><option value="late">{t.salesLate}</option>
                <option value="early">{t.salesEarly}</option><option value="manual">{t.salesManual}</option>
              </select>
            </label>
            {f.sales === 'manual' && (
              <label style={label}>{t.salesManualHint}<input style={field} value={f.salesManual} onChange={(e) => set('salesManual')(e.target.value)} /></label>
            )}
          </div>
        </>
      )}

      {errors.length > 0 && (
        <div role="alert" style={{ ...card, marginTop: '1.5rem', borderColor: 'var(--crit)' }}>
          <strong>{t.fix}</strong>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      {result && view === 'leader' && (
        <>
          <h2 style={h2}>{t.results}</h2>
          <div className="rc-grid">
            <div style={card}><div style={label}>{t.honestProfit}</div><div className={result.profit < 0 ? 'rc-neg' : ''}
              style={{ fontSize: 'var(--text-xl)' }}>{money(result.profit)}</div></div>
            <div style={card}><div style={label}>{t.venueStyleProfit}</div><div style={{ fontSize: 'var(--text-xl)' }}>{money(result.venueStyleProfit)}</div>
              <div style={{ ...label, marginTop: '0.35rem' }}>{t.hiddenCosts(money(result.hiddenCosts))}</div></div>
            <div style={card}><div style={label}>{t.breakEven}</div><div style={{ fontSize: 'var(--text-xl)' }}>
              {result.breakEvenGuests === null ? t.never : t.guestsN(result.breakEvenGuests)}</div>
              {result.emptySeats > 0 && <div style={{ ...label, marginTop: '0.35rem' }}>{t.emptySeats(result.emptySeats, money(result.emptySeatsCost))}</div>}</div>
            <div style={card}><div style={label}>{t.cashGap}</div><div className={result.cashGap ? 'rc-neg' : ''} style={{ fontSize: 'var(--text-xl)' }}>
              {result.cashGap ? `${money(result.cashGap.amount)} · ${monthLabel(result.cashGap.month)}` : t.noGap}</div></div>
          </div>
          <p style={{ ...label, marginTop: '0.75rem' }}>{t.breakdown(money(result.revenue), money(result.venueCost), money(result.leaderCosts))}</p>

          {grid.length > 0 && (
            <>
              <h2 style={h2}>{t.grid}</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="rc-table">
                  <thead><tr><th>{t.gridCorner}</th>{guestSteps.map((g) => <th key={g}>{g}</th>)}</tr></thead>
                  <tbody>{priceSteps.map((p, r) => (
                    <tr key={p}><td>{money(p)}</td>{grid[r].map((c, k) => <td key={k} className={c !== null && c < 0 ? 'rc-neg' : ''}>{c === null ? '—' : money(c)}</td>)}</tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}

          <h2 style={h2}>{t.cashflow}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="rc-table">
              <thead><tr><th>{t.month}</th><th>{t.inflow}</th><th>{t.outflow}</th><th>{t.balance}</th></tr></thead>
              <tbody>{result.cashflow.map((c) => (
                <tr key={c.month} className={result.cashGap && result.cashGap.month === c.month ? 'rc-gap' : ''}>
                  <td>{monthLabel(c.month)}</td><td>{money(c.inflow)}</td><td>{money(c.outflow)}</td>
                  <td className={c.balance < 0 ? 'rc-neg' : ''}>{money(c.balance)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}

      {result && view === 'venue' && (
        <>
          <h2 style={h2}>{t.contract}</h2>
          <div className="rc-grid">
            <div style={card}><div style={label}>{t.contractValue}</div><div style={{ fontSize: 'var(--text-xl)' }}>{money(result.venueView.contractValue)}</div></div>
            <div style={card}><div style={label}>{t.leaderMargin}</div><div style={{ fontSize: 'var(--text-xl)' }}>{money(result.venueStyleProfit)}</div></div>
            <div style={card}><div style={label}>{t.payInFullGives}</div><div style={{ fontSize: 'var(--text-xl)' }}>
              {money(Math.round((result.venueView.contractValue * num(f.discountPct)) / 100))}</div></div>
          </div>
          <h2 style={h2}>{t.schedule}</h2>
          <table className="rc-table">
            <thead><tr><th>{t.month}</th><th>{t.amount}</th></tr></thead>
            <tbody>{result.venueView.schedule.map((p, k) => <tr key={k}><td>{monthLabel(p.month)}</td><td>{money(p.amount)}</td></tr>)}</tbody>
          </table>
        </>
      )}

      <p style={{ marginTop: '2rem' }}>
        <a style={{ color: GOLD }} href={localePath(TIMELINE_PATH, locale) + timelineHashFromCalcForm(f, localToday())}>{t.openTimeline} →</a>
      </p>

      <p style={{ ...label, marginTop: '2.5rem' }}>{t.disclaimer}</p>
    </div>
  )
}
