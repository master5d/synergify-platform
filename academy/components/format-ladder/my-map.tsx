'use client'

import { useEffect, useState } from 'react'
import { CHANNELS, EVENT_CLASSES } from '../../lib/format-ladder/axes'
import { EMPTY_MAP, MY_MAP_KEY, nextLabel, parseMyMap, serializeMyMap } from '../../lib/format-ladder/my-map'
import type { MyMap } from '../../lib/format-ladder/my-map'
import { FORMATS } from '../../lib/format-ladder/formats'
import { RUNGS } from '../../lib/format-ladder/rungs'
import type { Cell, ChannelId, EventClass, RungId } from '../../lib/format-ladder/types'
import { UI } from './ui'
import { button, card, field, h2, label, smallButton } from '../retreat-booklet/styles'

type Locale = 'ru' | 'en'
export interface NowDraft { rung: string; channel: string; eventClass: string }
type NextMode = 'none' | 'format' | 'custom'

// Клетка «Где я сейчас» появляется, только когда выбраны все три поля; до того черновик живёт отдельно
export function draftToCell(d: NowDraft): Cell | null {
  if (!d.rung || !d.channel || !d.eventClass) return null
  return { rung: d.rung as RungId, channel: d.channel as ChannelId, eventClass: d.eventClass as EventClass }
}

// Формат, пропавший из данных, открывается как «свой формат» с сохранённым названием
export function settleMissingFormat(m: MyMap, locale: Locale): MyMap {
  if (!m.next.formatId || FORMATS.some((f) => f.id === m.next.formatId)) return m
  return { ...m, next: { ...m.next, formatId: null, formatName: null, text: nextLabel(m, FORMATS, locale) } }
}

// Текст для «Скопировать»: подписи, а не служебные id
export function mapAsText(m: MyMap, locale: Locale): string {
  const t = UI[locale]
  const now = m.now
    ? [
        RUNGS.find((r) => r.id === m.now!.rung)!.label[locale],
        CHANNELS.find((c) => c.id === m.now!.channel)!.label[locale],
        EVENT_CLASSES.find((e) => e.id === m.now!.eventClass)!.label[locale],
      ].join(', ')
    : t.choose
  const next = [nextLabel(m, FORMATS, locale) || t.choose, m.next.date].filter(Boolean).join(', ')
  return `${t.whereNow}: ${now}\n${t.nextStep}: ${next}\n${t.sign}: ${m.signal}`
}

function modeOf(m: MyMap): NextMode {
  if (m.next.formatId) return 'format'
  return m.next.text ? 'custom' : 'none'
}

export function MyMapBlock({ locale, initialMap }: { locale: Locale; initialMap?: MyMap }) {
  const t = UI[locale]
  const start = initialMap ?? EMPTY_MAP
  const [map, setMap] = useState<MyMap>(start)
  const [draft, setDraft] = useState<NowDraft>(start.now ?? { rung: '', channel: '', eventClass: '' })
  const [mode, setMode] = useState<NextMode>(modeOf(start))
  // Пока хранилище не прочитано, ничего не пишем — иначе пустая карта затрёт сохранённую
  const [loaded, setLoaded] = useState(Boolean(initialMap))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (initialMap) return
    let saved = EMPTY_MAP
    try {
      saved = settleMissingFormat(parseMyMap(localStorage.getItem(MY_MAP_KEY)), locale)
    } catch {
      saved = EMPTY_MAP
    }
    setMap(saved)
    setDraft(saved.now ?? { rung: '', channel: '', eventClass: '' })
    setMode(modeOf(saved))
    setLoaded(true)
  }, [initialMap, locale])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(MY_MAP_KEY, serializeMyMap(map, FORMATS))
    } catch {
      // хранилище недоступно (приватное окно) — карта живёт до закрытия страницы
    }
  }, [map, loaded])

  const setNow = (key: keyof NowDraft, value: string) => {
    const next = { ...draft, [key]: value }
    setDraft(next)
    setMap((old) => ({ ...old, now: draftToCell(next) }))
  }

  const pickNext = (value: string) => {
    if (value === '') {
      setMode('none')
      setMap((old) => ({ ...old, next: { ...old.next, formatId: null, formatName: null, text: '' } }))
    } else if (value === 'custom') {
      setMode('custom')
      setMap((old) => ({ ...old, next: { ...old.next, formatId: null, formatName: null } }))
    } else {
      setMode('format')
      setMap((old) => ({ ...old, next: { ...old.next, formatId: value, text: '' } }))
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(mapAsText(map, locale))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const nextValue = mode === 'format' ? map.next.formatId ?? '' : mode === 'custom' ? 'custom' : ''
  const hints = map.now ? RUNGS.find((r) => r.id === map.now!.rung)!.upSignals : []

  return (
    <section style={{ ...card, marginTop: '2rem' }}>
      <h2 style={h2}>{t.myMap}</h2>
      <div className="ladder-two">
        <div>
          <h3>{t.whereNow}</h3>
          <label style={label}>{t.step}
            <select style={field} value={draft.rung} onChange={(e) => setNow('rung', e.target.value)}>
              <option value="">{t.choose}</option>
              {RUNGS.map((r) => <option key={r.id} value={r.id}>{r.label[locale]}</option>)}
            </select>
          </label>
          <label style={label}>{t.channel}
            <select style={field} value={draft.channel} onChange={(e) => setNow('channel', e.target.value)}>
              <option value="">{t.choose}</option>
              {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label[locale]}</option>)}
            </select>
          </label>
          <label style={label}>{t.eventClass}
            <select style={field} value={draft.eventClass} onChange={(e) => setNow('eventClass', e.target.value)}>
              <option value="">{t.choose}</option>
              {EVENT_CLASSES.map((c) => <option key={c.id} value={c.id}>{c.label[locale]}</option>)}
            </select>
          </label>
        </div>
        <div>
          <h3>{t.nextStep}</h3>
          <select aria-label={t.nextStep} style={field} value={nextValue} onChange={(e) => pickNext(e.target.value)}>
            <option value="">{t.choose}</option>
            {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.name[locale]}</option>)}
            <option value="custom">{t.ownFormat}</option>
          </select>
          {mode === 'custom' && (
            <input type="text" aria-label={t.ownFormat} placeholder={t.ownFormat} style={field} value={map.next.text}
              onChange={(e) => setMap((old) => ({ ...old, next: { ...old.next, text: e.target.value } }))} />
          )}
          <label style={label}>{t.date}
            <input type="date" style={field} value={map.next.date}
              onChange={(e) => setMap((old) => ({ ...old, next: { ...old.next, date: e.target.value } }))} />
          </label>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h3>{t.sign}</h3>
        {hints.map((hint) => (
          <button type="button" key={hint.ru} style={smallButton}
            onClick={() => setMap((old) => ({ ...old, signal: old.signal ? `${old.signal}; ${hint[locale]}` : hint[locale] }))}>
            {hint[locale]}
          </button>
        ))}
        <textarea aria-label={t.sign} style={{ ...field, minHeight: '5rem', marginTop: '.5rem' }} value={map.signal}
          onChange={(e) => setMap((old) => ({ ...old, signal: e.target.value }))} />
      </div>
      <div className="bk-noprint" style={{ display: 'flex', gap: '.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <button type="button" style={button} onClick={copy}>{copied ? t.copied : t.copy}</button>
        <button type="button" style={button} onClick={() => window.print()}>{t.print}</button>
      </div>
      <p>{t.localOnly}</p>
    </section>
  )
}
