'use client'

import { useRef, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { cardIssueText, FORMAT, LOAD } from '../../lib/retreat-program/labels'
import {
  checkCard, emptyCard, mergeRegistry, pickCard, PRACTICE_LIMITS, registryFromJson, registryToJson,
  type PracticeCard,
} from '../../lib/retreat-program/practices'
import { download } from '../retreat-timeline/download'
import { button, card, field, label } from './styles'
import { PG_UI } from './ui'

interface Props {
  locale: Locale
  cards: PracticeCard[]
  linkedCards: PracticeCard[]
  onChange: (cards: PracticeCard[]) => void
  onNotice: (notice: string) => void
  onReset: () => void
  onPrintCards: () => void
}

const editable = [
  'name', 'format', 'groupMinutes', 'pairMinutes', 'groupSize', 'touch', 'touchConsent', 'load',
  'contraindications', 'guestDoes', 'description', 'needs', 'notPromise', 'source',
] as const
type Editable = (typeof editable)[number]

export function RegistryPanel({ locale, cards, linkedCards, onChange, onNotice, onReset, onPrintCards }: Props) {
  const t = PG_UI[locale]
  const input = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState<string | null>(null)
  const missing = linkedCards.filter((item) => !cards.some((cardItem) => cardItem.id === item.id))
  // Проверка — через pickCard (типы, лимиты), а текст хранится как набран: pickCard обрезает пробелы, и на каждое
  // нажатие пробел в конце съедался бы. При следующей загрузке registryFromStorage нормализует карточку сам.
  const update = (item: PracticeCard, key: Editable, value: string | boolean | number | null) => {
    const next = pickCard({ ...item, name: item.name.trim() || item.id, [key]: value })
    if (!next) return
    const typed = typeof value === 'string' && key !== 'format' && key !== 'load' ? { [key]: value } : {}
    const name = key === 'name' ? String(value) : item.name
    onChange(cards.map((cardItem) => cardItem.id === item.id ? { ...next, name, ...typed } : cardItem))
  }
  const addOwn = () => {
    let n = 1
    while (cards.some((item) => item.id === `my-${n}`)) n += 1
    const item = emptyCard(`my-${n}`)
    onChange([...cards, item])
    setOpen(item.id)
  }
  const importFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = registryFromJson(String(reader.result))
      if (result.error === 'broken') return onNotice(t.registryBroken)
      if (result.error === 'not-registry') return onNotice(t.registryNotOurs)
      const merged = mergeRegistry(cards, result.cards)
      onChange(merged.cards)
      const renamed = merged.renamed.length ? ` ${t.registryRenamed(merged.renamed.join(', '))}` : ''
      onNotice(`${t.registryMerged(merged.cards.length - cards.length)}${renamed}`)
    }
    reader.readAsText(file)
  }
  const renderField = (item: PracticeCard, key: Editable) => {
    const value = item[key]
    if (key === 'format') return <select style={field} value={value as string} onChange={(e) => update(item, key, e.target.value)}>
      {(['group', 'pair', 'solo'] as const).map((format) => <option key={format} value={format}>{FORMAT[locale][format]}</option>)}
    </select>
    if (key === 'load') return <select style={field} value={value as string} onChange={(e) => update(item, key, e.target.value)}>
      {(['low', 'medium', 'high'] as const).map((load) => <option key={load} value={load}>{LOAD[locale][load]}</option>)}
    </select>
    if (key === 'touch') return <input type="checkbox" checked={Boolean(value)} onChange={(e) => update(item, key, e.target.checked)} />
    if (key === 'groupMinutes' || key === 'pairMinutes') return <input style={field} type="number" min={1} max={600}
      value={typeof value === 'number' ? value : ''} onChange={(e) => update(item, key, e.target.value ? Number(e.target.value) : null)} />
    const area = ['touchConsent', 'contraindications', 'guestDoes', 'description', 'needs', 'notPromise', 'source'].includes(key)
    return area
      ? <textarea style={field} maxLength={PRACTICE_LIMITS.text} value={String(value)} onChange={(e) => update(item, key, e.target.value)} />
      : <input style={field} maxLength={PRACTICE_LIMITS.short} value={String(value)} onChange={(e) => update(item, key, e.target.value)} />
  }
  const printValue = (item: PracticeCard, key: Editable) => {
    if (key === 'format') return FORMAT[locale][item.format]
    if (key === 'load') return LOAD[locale][item.load]
    if (key === 'touch') return item.touch ? t.yes : t.no
    return String(item[key] ?? '')
  }
  return (
    <>
    <section className="pg-screen">
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>{t.registry}</h2>
      <p style={{ color: 'var(--text-secondary)' }}>{t.registryLead}</p>
      <div className="pg-actions">
        <button style={button} onClick={addOwn}>{t.addCard}</button>
        <button style={button} onClick={() => { onReset(); onNotice(t.resetDone) }}>{t.resetStarter}</button>
        <button style={button} onClick={() => download(
          `practices.${locale}.json`, registryToJson(cards), 'application/json;charset=utf-8')}>{t.downloadRegistry}</button>
        <button style={button} onClick={() => input.current?.click()}>{t.uploadRegistry}</button>
        <input ref={input} hidden type="file" accept="application/json,.json" onChange={(e) => { importFile(e.target.files?.[0]); e.target.value = '' }} />
        <button style={button} onClick={onPrintCards}>{t.printCards}</button>
      </div>
      {missing.length > 0 && <div style={card}>
        <h3>{t.fromLink}</h3>
        {missing.map((item) => <p key={item.id}>{item.name} <button style={button} onClick={() => onChange(mergeRegistry(cards, [item]).cards)}>{t.addToRegistry}</button></p>)}
      </div>}
      <div className="pg-days">
        {cards.map((item) => {
          const issues = checkCard(item)
          return <article key={item.id} style={card}>
            <div className="pg-card-summary">
              <strong>{item.name || item.id}</strong><span>{FORMAT[locale][item.format]}</span>
              <span>{item.groupMinutes !== null ? t.min(item.groupMinutes) : '—'}</span>
              {item.pairMinutes !== null && <span>{t.perPair(item.pairMinutes)}</span>}
              <span>{LOAD[locale][item.load]}</span>
              <span>{t.fields.touch}: {item.touch ? t.yes : t.no}</span>
              <button style={button} onClick={() => setOpen(open === item.id ? null : item.id)}>{open === item.id ? t.done : t.edit}</button></div>
            {issues.map((issue) => <p key={issue.id}>{cardIssueText(issue, item.name, locale)}</p>)}
            {open === item.id && <div className="pg-card-fields">{editable.map((key) => (
              <label key={key} style={label}>{t.fields[key]}
                {item.added.includes(key) && <small title={t.addedHint}>{t.added}</small>}
                {renderField(item, key)}
              </label>
            ))}
              <button style={button} onClick={() => onChange(cards.filter((cardItem) => cardItem.id !== item.id))}>{t.deleteCard}</button></div>}
          </article>
        })}
      </div>
    </section>
    <div className="pg-print-cards" aria-hidden="true">
      {cards.map((item) => <article key={item.id}><h2>{item.name}</h2>
        {editable.filter((key) => key !== 'name').map((key) => (
          <p key={key}><strong>{t.fields[key]}:</strong> {printValue(item, key)}</p>
        ))}
      </article>)}
    </div>
    </>
  )
}
