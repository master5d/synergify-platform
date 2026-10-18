'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { localToday } from '../../lib/retreat-core/dates'
import { PASSPORT_DEFAULTS, validatePassport, type RetreatPassport } from '../../lib/retreat-core/passport'
import { decodeToolLink, TOOL_MAX_FRAGMENT } from '../../lib/retreat-core/tool-link'
import { CALC_PATH, localePath, TIMELINE_PATH } from '../../lib/retreat-timeline/form'
import { MENU_PATH, calcHashFromPassport, menuHashFromPassport, timelineHashFromPassport } from '../../lib/retreat-menu/form'
import { FORM_PATH, formHashFromPassport } from '../../lib/retreat-guest-form/form'
import { VENUE_PATH, venueHashFromPassport } from '../../lib/retreat-venue/form'
import { blockMinutes, fromMinutes, STEP, toMinutes, pickProgramTool, type Block } from '../../lib/retreat-program/grid'
import { mealLabel } from '../../lib/retreat-menu/labels'
import {
  defaultForm, draftOf, draftWorthKeeping, formFromDecoded, formFromDraft, programHash, PROGRAM_DRAFT_KEY, PROGRAM_PREV_KEY,
  PROGRAM_PATH, registryKey, registryFromStorage, reconcileMeals, restoreStarter, withDraftBlocks, type ProgramForm,
} from '../../lib/retreat-program/form'
import { gridRows, gridToCsv } from '../../lib/retreat-program/export'
import { type PracticeCard } from '../../lib/retreat-program/practices'
import { PassportBar } from '../retreat-core/passport-bar'
import { download } from '../retreat-timeline/download'
import { GridPanel } from './grid-panel'
import { RegistryPanel } from './registry-panel'
import { button, card, field, h2, label } from './styles'
import { PG_UI } from './ui'

const meals = ['breakfast', 'lunch', 'dinner'] as const
const shown = (value: number | undefined) => value === undefined || !Number.isFinite(value) ? '' : String(value)
const numberValue = (value: string) => value.trim() === '' ? NaN : Number(value)

export function RetreatProgram({ locale }: { locale: Locale }) {
  const t = PG_UI[locale]
  const [form, setForm] = useState<ProgramForm | null>(null)
  const [registry, setRegistry] = useState<PracticeCard[]>([])
  const [linkedCards, setLinkedCards] = useState<PracticeCard[]>([])
  const [notice, setNotice] = useState('')
  const [previousDraft, setPreviousDraft] = useState<ProgramForm | null>(null)

  useEffect(() => {
    const today = localToday()
    const hash = window.location.hash
    let loaded: ReturnType<typeof formFromDecoded> = null
    if (hash) loaded = formFromDecoded(decodeToolLink(hash, pickProgramTool, locale), today)
    let draft: string | null = null
    let saved: string | null = null
    try {
      draft = localStorage.getItem(PROGRAM_DRAFT_KEY)
      saved = localStorage.getItem(registryKey(locale))
    } catch { /* черновик и реестр в браузере — удобство, без них всё работает */ }
    const draftForm = formFromDraft(draft, today)
    const linkForm = loaded?.form
    const keepDraft = Boolean(linkForm && loaded?.linkHasBlocks && draftWorthKeeping(draft, linkForm, today))
    const previous = keepDraft ? draftForm : null
    let prevSaved: string | null = null
    try { prevSaved = localStorage.getItem(PROGRAM_PREV_KEY) } catch { /* без хранилища отложенного нет */ }
    if (previous) {
      setPreviousDraft(previous)
      try { localStorage.setItem(PROGRAM_PREV_KEY, draftOf(previous)) } catch { /* без хранилища отложить нельзя */ }
    } else {
      // отложенная раньше программа остаётся доступной и после перезагрузки, пока её не вернули
      const stored = formFromDraft(prevSaved, today)
      if (stored) setPreviousDraft(stored)
    }
    setForm(linkForm ? withDraftBlocks(linkForm, draftForm, loaded?.linkHasBlocks ?? false) : draftForm ?? defaultForm(today))
    setLinkedCards(loaded?.cards ?? [])
    if (loaded && keepDraft) setNotice(t.linkOpened)
    else if (loaded) setNotice(t.loaded)
    else if (hash) setNotice(t.linkBroken)
    else if (draftForm) setNotice(t.draftRestored)
    setRegistry(registryFromStorage(saved, locale))
  }, [locale, t.loaded, t.linkBroken, t.draftRestored])

  useEffect(() => {
    if (!form) return
    try {
      localStorage.setItem(PROGRAM_DRAFT_KEY, draftOf(form))
      localStorage.setItem(registryKey(locale), JSON.stringify({ v: 1, cards: registry }))
    } catch { /* черновик и реестр в браузере — удобство, без них всё работает */ }
  }, [form, registry])

  const allCards = useMemo(() => [...registry, ...linkedCards.filter((item) => !registry.some((cardItem) => cardItem.id === item.id))], [registry, linkedCards])
  if (!form) return null
  const errors = validatePassport(form.passport, locale)
  const setPassport = <K extends keyof RetreatPassport>(key: K, value: RetreatPassport[K]) => {
    const passport = { ...form.passport, [key]: value }
    setForm({ ...form, passport, blocks: reconcileMeals(form.blocks, form.passport, passport) })
  }
  const updateBlock = (index: number, patch: Partial<Block>) => setForm({ ...form, blocks: form.blocks.map((block, n) => n === index ? { ...block, ...patch } : block) })
  const removeBlock = (index: number) => setForm({ ...form, blocks: form.blocks.filter((_, n) => n !== index) })
  const addBlock = (day: number) => {
    const items = form.blocks.filter((block) => block.day === day)
    const end = items.length
      ? Math.max(...items.map((block) => toMinutes(block.start) + blockMinutes(
        block, allCards.find((item) => item.id === block.practiceId))))
      : toMinutes('07:00')
    const rounded = Math.ceil(end / STEP) * STEP
    const start = fromMinutes(Math.min(rounded, toMinutes('23:30')))
    setForm({ ...form, blocks: [...form.blocks, { day, start, minutes: 30, kind: 'free' }] })
  }
  const copyLink = async () => {
    const hash = programHash(form, allCards)
    if (hash.length > TOOL_MAX_FRAGMENT) return setNotice(t.tooLong)
    const url = `${window.location.origin}${localePath(PROGRAM_PATH, locale)}${hash}`
    try { await navigator.clipboard.writeText(url); setNotice(t.copied) } catch { window.location.hash = hash }
  }
  const printPart = (part: 'grid' | 'cards') => {
    document.body.dataset.pgPrint = part
    const done = () => { delete document.body.dataset.pgPrint; window.removeEventListener('afterprint', done) }
    window.addEventListener('afterprint', done)
    window.print()
  }
  const printRows = gridRows(form.passport, form.blocks, allCards, locale)
  return (
    <div>
      <div className="pg-screen">
        <PassportBar locale={locale} passport={form.passport} links={[
          { href: localePath(TIMELINE_PATH, locale) + timelineHashFromPassport(form.passport), label: t.openTimeline },
          { href: localePath(MENU_PATH, locale) + menuHashFromPassport(form.passport), label: t.openMenu },
          { href: localePath(CALC_PATH, locale) + calcHashFromPassport(form.passport), label: t.openCalc },
          { href: localePath(FORM_PATH, locale) + formHashFromPassport(form.passport), label: t.openForm },
          { href: localePath(VENUE_PATH, locale) + venueHashFromPassport(form.passport), label: t.openVenue },
        ]} />
        {notice && <p role="status" style={{ ...card, color: 'var(--accent-ink)' }}>{notice}</p>}
        {previousDraft && <p>
          <button style={button} onClick={() => {
            setForm(previousDraft); setPreviousDraft(null); setNotice(t.draftBack)
            try { localStorage.removeItem(PROGRAM_PREV_KEY) } catch { /* без хранилища очищать нечего */ }
          }}>{t.restoreDraft}</button>
        </p>}
        <h2 style={h2}>{t.retreat}</h2>
        <div className="pg-grid">
          <label style={label}>{t.titleLabel}<input style={field} value={form.passport.title ?? ''} onChange={(e) => setPassport('title', e.target.value || undefined)} /></label>
          <label style={label}>{t.currency}<input style={field} maxLength={3}
            value={form.passport.currency ?? ''} onChange={(e) => setPassport('currency', e.target.value.toUpperCase() || undefined)} /></label>
          <label style={label}>{t.start}<input style={field} type="date" value={form.passport.start ?? ''}
            onChange={(e) => setPassport('start', e.target.value || undefined)} /></label>
          <label style={label}>{t.nights}<input style={field} value={shown(form.passport.nights)} onChange={(e) => setPassport('nights', numberValue(e.target.value))} /></label>
          <label style={label}>{t.guests}<input style={field} value={shown(form.passport.guests)} onChange={(e) => setPassport('guests', numberValue(e.target.value))} /></label>
          {(['arrivalMeal', 'departureMeal'] as const).map((key) => <label key={key} style={label}>{t[key]}
            <select style={field} value={form.passport[key] ?? PASSPORT_DEFAULTS[key]} onChange={(e) => setPassport(key, e.target.value as RetreatPassport[typeof key])}>
              {meals.map((meal) => <option key={meal} value={meal}>{mealLabel(meal, locale)}</option>)}
            </select>
          </label>)}
        </div>
        {errors.length > 0 && <div role="alert" style={{ ...card, marginTop: '1rem' }}><strong>{t.fix}</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
        <GridPanel locale={locale} form={form} cards={allCards} onUpdate={updateBlock} onRemove={removeBlock} onAdd={addBlock} />
        <div className="pg-actions">
          <button style={button} onClick={() => download(
            `program.${locale}.csv`, gridToCsv(form.passport, form.blocks, allCards, locale),
            'text/csv;charset=utf-8')}>{t.downloadCsv}</button>
          <button style={button} onClick={() => printPart('grid')}>{t.printGrid}</button>
          <button style={button} onClick={copyLink}>{t.copyLink}</button>
        </div>
      </div>
      {/* реестр — вне pg-screen: его печатная часть должна оставаться видимой при печати карточек */}
      <RegistryPanel locale={locale} cards={registry} linkedCards={linkedCards} disclaimer={t.disclaimer} onChange={setRegistry}
        onNotice={setNotice} onReset={() => setRegistry(restoreStarter(registry, locale))}
        onPrintCards={() => printPart('cards')} />
      <div className="pg-print-grid" aria-hidden="true">
        <table><thead><tr>{printRows[0].map((cell, index) => <th key={index}>{cell}</th>)}</tr></thead>
          <tbody>{printRows.slice(1).map((row, index) => <tr key={index}>
            {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <p className="pg-screen" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: '2rem' }}>{t.disclaimer}</p>
    </div>
  )
}
