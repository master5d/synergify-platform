'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { CALC_PATH, localePath, TIMELINE_PATH } from '../../lib/retreat-timeline/form'
import { localToday } from '../../lib/retreat-core/dates'
import type { Meal, RetreatPassport } from '../../lib/retreat-core/passport'
import { decodeToolLink, TOOL_MAX_FRAGMENT } from '../../lib/retreat-core/tool-link'
import { decodeCsvBytes } from '../../lib/retreat-core/csv'
import { ALLERGENS, allergenName } from '../../lib/retreat-menu/allergens'
import { cellKey, computeMenu, emptyCell, validateMenu, type MenuCell, type SpecialDiet } from '../../lib/retreat-menu/engine'
import { menuFromCsv, menuMoney, menuToCsv, parseMoney } from '../../lib/retreat-menu/export'
import {
  calcHashFromPassport, defaultForm, draftOf, formFromDecoded, formFromDraft, MENU_DRAFT_KEY, MENU_PATH, menuHash,
  draftWorthKeeping, MENU_LIMITS, MENU_PREV_KEY, pickMenuTool, reconcileGrid, timelineHashFromPassport, withDraftMenu, type MenuForm,
} from '../../lib/retreat-menu/form'
import { dietLabel, issueText, mealLabel } from '../../lib/retreat-menu/labels'
import { FORM_PATH, formHashFromPassport } from '../../lib/retreat-guest-form/form'
import { PROGRAM_PATH, programHashFromPassport } from '../../lib/retreat-program/form'
import { PassportBar } from '../retreat-core/passport-bar'
import { download } from '../retreat-timeline/download'
import { MN_UI } from './ui'

// Текст/ссылки на бумаге — бронза (золото на светлом = 1.7:1)
const GOLD = 'var(--accent-ink)'
const field: React.CSSProperties = {
  width: '100%', padding: '0.4rem 0.55rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)',
}
const label: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }
const card: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }
const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'var(--text-lg)', margin: '2.25rem 0 0.9rem', color: 'var(--text-primary)' }
const button: React.CSSProperties = { ...field, width: 'auto', cursor: 'pointer' }
const SPECIAL: SpecialDiet[] = ['vegetarian', 'vegan', 'gluten-free', 'vegan-gluten-free']
const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner']

const shown = (n: number | undefined) => (n !== undefined && Number.isFinite(n) ? String(n) : '')
const parsedInt = (s: string) => (s.trim() === '' ? NaN : Number(s))

/** Поле суммы со своим текстом: «12,» и «12.» не съедаются при наборе, центы уходят наверх, когда число готово. */
function MoneyInput({ cents, onChange, locale, ...rest }: { cents: number | null; onChange: (c: number | null) => void; locale: Locale } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  const [text, setText] = useState(cents === null ? '' : menuMoney(cents, locale))
  useEffect(() => {
    if (parseMoney(text) !== cents) setText(cents === null ? '' : menuMoney(cents, locale))
    // текст меняется только при внешней смене суммы (загрузка CSV, ссылка), а не на каждую клавишу
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cents, locale])
  return (
    <input {...rest} style={field} inputMode="decimal" value={text}
      onChange={(e) => { setText(e.target.value); onChange(e.target.value.trim() === '' ? null : parseMoney(e.target.value)) }} />
  )
}

export function RetreatMenu({ locale }: { locale: Locale }) {
  const t = MN_UI[locale]
  const [f, setF] = useState<MenuForm | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [canRestore, setCanRestore] = useState(false)

  useEffect(() => {
    const now = localToday()
    const hash = window.location.hash
    // отложенное раньше меню остаётся доступным и после перезагрузки, пока его не вернули
    let stored: string | null = null
    try { stored = localStorage.getItem(MENU_PREV_KEY) } catch { /* без хранилища отложенного нет */ }
    const hasStored = formFromDraft(stored, now) !== null
    if (hash) {
      const d = decodeToolLink(hash, pickMenuTool, locale)
      const fromLink = formFromDecoded(d, now)
      if (fromLink) {
        let saved: string | null = null
        try { saved = localStorage.getItem(MENU_DRAFT_KEY) } catch { /* без хранилища — только ссылка */ }
        const linkHasMenu = d.ok && d.kind === 'tool' && Object.keys(d.link.tool.grid).length > 0
        // меню из ссылки (например, учебное из урока) не стирает своё молча: своё откладывается, его можно вернуть
        let kept = false
        if (linkHasMenu && draftWorthKeeping(saved, fromLink, now)) {
          try { localStorage.setItem(MENU_PREV_KEY, saved as string); kept = true } catch { /* без хранилища отложить нельзя */ }
        }
        setCanRestore(kept || hasStored)
        setF(withDraftMenu(fromLink, formFromDraft(saved, now), linkHasMenu))
        setNotice(kept ? t.loadedKeptDraft : t.loaded)
        return
      }
      if (!d.ok) setNotice(d.error)
    }
    let draft: string | null = null
    try { draft = localStorage.getItem(MENU_DRAFT_KEY) } catch { /* хранилище недоступно — начинаем с чистой формы */ }
    const fromDraft = formFromDraft(draft, now)
    if (fromDraft && !hash) setNotice(t.draftRestored)
    setCanRestore(hasStored)
    setF(fromDraft ?? defaultForm(now))
  }, [locale, t.loaded, t.draftRestored])

  useEffect(() => {
    if (!f) return
    try { localStorage.setItem(MENU_DRAFT_KEY, draftOf(f)) } catch { /* черновик — удобство, без него всё работает */ }
  }, [f])

  const errors = useMemo(() => (f ? validateMenu(f.passport, f.diets, locale) : []), [f, locale])
  const result = useMemo(() => (f && !errors.length ? computeMenu(f.passport, f.grid, f.diets) : null), [f, errors])

  if (!f) return null

  const setP = <K extends keyof RetreatPassport>(k: K, v: RetreatPassport[K]) => {
    const passport = { ...f.passport, [k]: v }
    setF({ ...f, passport, grid: reconcileGrid(f.grid, passport) })
  }
  const setCell = (key: string, patch: Partial<MenuCell>) => setF({ ...f, grid: { ...f.grid, [key]: { ...(f.grid[key] ?? emptyCell()), ...patch } } })
  const variantName = (variant: MenuCell['variants'][SpecialDiet]) => typeof variant === 'string' ? variant : variant?.name ?? ''
  const setVariant = (key: string, diet: SpecialDiet, name: string) => {
    const current = f.grid[key]?.variants[diet]
    const variant = name ? (typeof current === 'object' ? { ...current, name } : name) : undefined
    setCell(key, { variants: { ...(f.grid[key]?.variants ?? {}), [diet]: variant } })
  }
  const setVariantAllergens = (key: string, diet: SpecialDiet, allergen: typeof ALLERGENS[number], checked: boolean) => {
    const current = f.grid[key]?.variants[diet]
    const allergens = typeof current === 'object' ? current.allergens : []
    const next = checked ? [...new Set([...allergens, allergen])] : allergens.filter((a) => a !== allergen)
    setCell(key, { variants: { ...(f.grid[key]?.variants ?? {}), [diet]: { name: variantName(current), allergens: next } } })
  }
  const currency = f.passport.currency ?? 'USD'
  const money = (c: number) => {
    try {
      return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ru-RU', { style: 'currency', currency, minimumFractionDigits: c % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(c / 100)
    } catch {
      return `${menuMoney(c, locale)} ${currency}`
    }
  }
  const lastDay = (f.passport.nights ?? 0) + 1
  const days = result ? [...new Set(result.slots.map((s) => s.day))] : []

  const onFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const grid = menuFromCsv(decodeCsvBytes(new Uint8Array(reader.result as ArrayBuffer)))
      if (Object.keys(grid).length === 0) { setNotice(t.csvEmpty); return }
      setF({ ...f, grid: reconcileGrid({ ...f.grid, ...grid }, f.passport) })
    }
    reader.readAsArrayBuffer(file)
  }
  const copyLink = async () => {
    const hash = menuHash(f)
    if (hash.length > TOOL_MAX_FRAGMENT) { setNotice(t.tooLong); return }
    const url = `${window.location.origin}${localePath(MENU_PATH, locale)}${hash}`
    try { await navigator.clipboard.writeText(url); setNotice(t.copied) } catch { window.location.hash = menuHash(f) }
  }

  return (
    <div>
      <style>{`
        .mn-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr)); gap: 0.9rem; }
        .mn-days { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(19rem, 100%), 1fr)); gap: 1rem; }
        .mn-meal { border-top: 1px solid var(--border-soft); padding-top: 0.75rem; margin-top: 0.75rem; display: grid; gap: 0.5rem; }
        .mn-meal:first-of-type { border-top: 0; margin-top: 0.4rem; padding-top: 0; }
        .mn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        .mn-print { display: none; }
        .mn-print table { width: 100%; border-collapse: collapse; font-size: 11pt; }
        .mn-print th, .mn-print td { border: 1px solid #999; padding: 4px 6px; text-align: left; vertical-align: top; }
        @media print {
          .mn-screen { display: none !important; }
          .mn-print { display: block; }
        }
      `}</style>

      <div className="mn-screen">
        <PassportBar locale={locale} passport={f.passport} links={[
          { href: localePath(TIMELINE_PATH, locale) + timelineHashFromPassport(f.passport), label: t.openTimeline },
          { href: localePath(CALC_PATH, locale) + calcHashFromPassport(f.passport), label: t.openCalc },
          { href: localePath(FORM_PATH, locale) + formHashFromPassport(f.passport), label: t.openForm },
          { href: localePath(PROGRAM_PATH, locale) + programHashFromPassport(f.passport), label: t.openProgram },
        ]} />
        {notice && <p role="status" style={{ ...card, color: GOLD, margin: '0 0 1.25rem' }}>{notice}</p>}
        {canRestore && (
          <p style={{ margin: '0 0 1.25rem' }}>
            <button style={button} onClick={() => {
              let prev: string | null = null
              try { prev = localStorage.getItem(MENU_PREV_KEY) } catch { /* без хранилища вернуть нечего */ }
              const back = formFromDraft(prev, localToday())
              if (back) { setF(back); setNotice(t.restored) }
              setCanRestore(false)
              try { localStorage.removeItem(MENU_PREV_KEY) } catch { /* без хранилища очищать нечего */ }
            }}>{t.restore}</button>
          </p>
        )}

        <h2 style={h2}>{t.retreat}</h2>
        <div className="mn-grid">
          <label style={label}>{t.titleLabel}<input style={field} value={f.passport.title ?? ''} onChange={(e) => setP('title', e.target.value || undefined)} /></label>
          <label style={label}>{t.currency}<input style={field} value={f.passport.currency ?? ''} maxLength={3} onChange={(e) => setP('currency', e.target.value.toUpperCase() || undefined)} /></label>
          <label style={label}>{t.start}<input type="date" style={field} value={f.passport.start ?? ''} onChange={(e) => setP('start', e.target.value || undefined)} /></label>
          <label style={label}>{t.nights}<input style={field} inputMode="numeric" value={shown(f.passport.nights)} onChange={(e) => setP('nights', parsedInt(e.target.value))} /></label>
          <label style={label}>{t.guests}<input style={field} inputMode="numeric" value={shown(f.passport.guests)} onChange={(e) => setP('guests', parsedInt(e.target.value))} /></label>
          <label style={label}>{t.arrivalMeal}
            <select style={field} value={f.passport.arrivalMeal ?? 'lunch'} onChange={(e) => setP('arrivalMeal', e.target.value as Meal)}>
              {MEALS.map((m) => <option key={m} value={m}>{mealLabel(m, locale)}</option>)}
            </select>
          </label>
          <label style={label}>{t.departureMeal}
            <select style={field} value={f.passport.departureMeal ?? 'breakfast'} onChange={(e) => setP('departureMeal', e.target.value as Meal)}>
              {MEALS.map((m) => <option key={m} value={m}>{mealLabel(m, locale)}</option>)}
            </select>
          </label>
        </div>

        <h2 style={h2}>{t.diets}</h2>
        <p style={{ ...label, margin: '0 0 0.75rem' }}>{t.dietsHint}</p>
        <div className="mn-grid">
          {SPECIAL.map((d) => (
            <label key={d} style={label}>{dietLabel(d, locale)}
              <input style={field} inputMode="numeric" value={shown(f.diets[d])}
                onChange={(e) => setF({ ...f, diets: { ...f.diets, [d]: e.target.value.trim() === '' ? undefined : parsedInt(e.target.value) } })} />
            </label>
          ))}
        </div>

        {errors.length > 0 && (
          <div role="alert" style={{ ...card, marginTop: '1.5rem', borderColor: 'var(--crit)' }}>
            <strong>{t.fix}</strong>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
            <button style={{ ...button, marginTop: '0.75rem' }} onClick={() => window.print()}>{t.printErrors}</button>
          </div>
        )}

        {result && (
          <>
            <h2 style={h2}>{t.menu}</h2>
            <div className="mn-days">
              {days.map((day) => (
                <section key={day} style={card} aria-label={t.day(day, lastDay)}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 400 }}>{t.day(day, lastDay)}</h3>
                  {result.slots.filter((s) => s.day === day).map((s) => {
                    const key = cellKey(s)
                    const c = f.grid[key] ?? emptyCell()
                    const id = `mn-${key}`
                    return (
                      <div key={key} className="mn-meal">
                        <strong style={{ fontSize: 'var(--text-sm)', color: GOLD }}>{mealLabel(s.meal, locale)}</strong>
                        <label style={label}>{t.dish}<input style={field} maxLength={MENU_LIMITS.text} value={c.dish} onChange={(e) => setCell(key, { dish: e.target.value })} /></label>
                        <label style={{ ...label, flexDirection: 'row', alignItems: 'center' }}>
                          <input type="checkbox" checked={c.meat} onChange={(e) => setCell(key, { meat: e.target.checked })} /> {t.meat}
                        </label>
                        <div className="mn-row">
                          <label style={label}>{t.side}<input style={field} maxLength={MENU_LIMITS.text} value={c.side} onChange={(e) => setCell(key, { side: e.target.value })} /></label>
                          <label style={label}>{t.drink}<input style={field} maxLength={MENU_LIMITS.text} value={c.drink} onChange={(e) => setCell(key, { drink: e.target.value })} /></label>
                        </div>
                        <label style={label} htmlFor={`${id}-price`}>{t.price}</label>
                        <MoneyInput id={`${id}-price`} locale={locale} cents={c.priceCents} onChange={(v) => setCell(key, { priceCents: v })} />
                        <details>
                          <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)', color: GOLD }}>{t.more}</summary>
                          <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {SPECIAL.map((d) => (
                              <div key={d} style={{ display: 'grid', gap: '0.25rem' }}>
                                <label style={label}>{t.variant(dietLabel(d, locale))}
                                  <input style={field} maxLength={MENU_LIMITS.text} value={variantName(c.variants[d])}
                                    onChange={(e) => setVariant(key, d, e.target.value)} /></label>
                                {variantName(c.variants[d]) && (() => {
                                  const variant = c.variants[d]
                                  const allergens = typeof variant === 'object' ? variant.allergens : []
                                  return <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.75rem' }}>
                                    {ALLERGENS.map((a) => (
                                      <label key={a} style={{ ...label, flexDirection: 'row', alignItems: 'center' }}>
                                        <input type="checkbox" checked={allergens.includes(a)}
                                          onChange={(e) => setVariantAllergens(key, d, a, e.target.checked)} />
                                        {allergenName(a, locale)}
                                      </label>
                                    ))}
                                  </span>
                                })()}
                              </div>
                            ))}
                            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                              <legend style={label}>{t.allergens}</legend>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.75rem' }}>
                                {ALLERGENS.map((a) => (
                                  <label key={a} style={{ ...label, flexDirection: 'row', alignItems: 'center' }}>
                                    <input type="checkbox" checked={c.allergens.includes(a)}
                                      onChange={(e) => setCell(key, { allergens: e.target.checked ? [...c.allergens, a] : c.allergens.filter((x) => x !== a) })} />
                                    {allergenName(a, locale)}
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                            <div className="mn-row">
                              <label style={label}>{t.optionName}<input style={field} maxLength={MENU_LIMITS.optionName} value={c.option?.name ?? ''}
                                onChange={(e) => setCell(key, { option: e.target.value ? { name: e.target.value, priceCents: c.option?.priceCents ?? 0 } : null })} /></label>
                              <div style={label}>
                                <label htmlFor={`${id}-opt`}>{t.optionPrice}</label>
                                <MoneyInput id={`${id}-opt`} locale={locale} cents={c.option ? c.option.priceCents : null}
                                  onChange={(v) => setCell(key, { option: v === null && !c.option?.name ? null : { name: c.option?.name ?? '', priceCents: v ?? 0 } })} />
                              </div>
                            </div>
                          </div>
                        </details>
                      </div>
                    )
                  })}
                </section>
              ))}
            </div>

            <h2 style={h2}>{t.totals}</h2>
            <div className="mn-grid">
              <div style={card}><div style={label}>{t.perGuest}</div><div style={{ fontSize: 'var(--text-xl)' }}>
                {result.totals.perGuestWeek === null ? t.noTotal : money(result.totals.perGuestWeek)}</div></div>
              <div style={card}><div style={label}>{t.perGroup}</div><div style={{ fontSize: 'var(--text-xl)' }}>
                {result.totals.perGroup === null ? t.noTotal : money(result.totals.perGroup)}</div></div>
              <div style={card}><div style={label}>{t.options}</div>
                {result.totals.options.length === 0 ? <div>{t.noOptions}</div> : (
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.1rem', fontSize: 'var(--text-sm)' }}>
                    {result.totals.options.map((o, k) => <li key={k}>{t.day(o.day, lastDay)}, {mealLabel(o.meal, locale).toLowerCase()}: {o.name || t.optionUnnamed} +{money(o.priceCents)}</li>)}
                  </ul>
                )}</div>
            </div>
            <p style={{ ...label, marginTop: '0.75rem' }}>
              {t.byDay}: {result.totals.perGuestByDay.map((d) => `${d.day}: ${d.cents === null ? '—' : money(d.cents)}`).join(' · ')}
            </p>
            {result.totals.perGuestWeek !== null && <p style={{ ...label, marginTop: '0.25rem' }}>{t.calcHint(menuMoney(result.totals.perGuestWeek, locale))}</p>}

            <h2 style={h2}>{t.issues}</h2>
            {result.issues.length === 0
              ? <p style={label}>{t.noIssues}</p>
              : <ul style={{ paddingLeft: '1.2rem', fontSize: 'var(--text-sm)' }}>{result.issues.map((i, k) => <li key={k}>{issueText(i, locale)}</li>)}</ul>}

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <button style={button} onClick={() => download(`menu.${locale}.csv`, menuToCsv(result.slots, f.grid, locale), 'text/csv;charset=utf-8')}>{t.downloadCsv}</button>
              <button style={button} onClick={() => fileInput.current?.click()}>{t.uploadCsv}</button>
              <input ref={fileInput} type="file" accept=".csv,text/csv" hidden aria-label={t.uploadCsv}
                onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
              <button style={button} onClick={() => window.print()}>{t.print}</button>
              <button style={button} onClick={copyLink}>{t.copyLink}</button>
            </div>
          </>
        )}
        <p style={{ ...label, marginTop: '2.5rem' }}>{t.disclaimer}</p>
      </div>

      {(result || errors.length > 0) && (
        <div className="mn-print" aria-hidden="true">
          <h2>{f.passport.title || t.h1}</h2>
          {errors.length > 0 ? <><p>{t.fix}</p><ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul></> : <table>
            <thead><tr><th>{t.printDay}</th><th>{t.printMeal}</th><th>{t.dish}</th><th>{t.side}</th><th>{t.drink}</th><th>{t.allergens}</th></tr></thead>
            <tbody>{result!.slots.map((s) => {
              const c = f.grid[cellKey(s)] ?? emptyCell()
              const variants = SPECIAL.filter((d) => c.variants[d]).map((d) => {
                const variant = c.variants[d]!
                const name = variantName(variant)
                const allergens = typeof variant === 'string' || variant.allergens.length === 0 ? '' : ` [${variant.allergens.map((a) => allergenName(a, locale)).join(', ')}]`
                return `${dietLabel(d, locale)}: ${name}${allergens}`
              }).join('; ')
              return (
                <tr key={cellKey(s)}>
                  <td>{s.day}</td><td>{mealLabel(s.meal, locale)}</td>
                  <td>{c.dish}{c.meat ? ` ${t.meatMark}` : ''}{variants ? <><br /><small>{variants}</small></> : null}</td>
                  <td>{c.side}</td><td>{c.drink}</td><td>{c.allergens.map((a) => allergenName(a, locale)).join(', ')}</td>
                </tr>
              )
            })}</tbody>
          </table>}
        </div>
      )}
    </div>
  )
}
