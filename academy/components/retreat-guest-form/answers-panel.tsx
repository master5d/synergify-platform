'use client'

import { useMemo, useRef, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { decodeCsvBytes } from '../../lib/retreat-core/csv'
import {
  answerText, arrivalsOf, chefToCsv, matchColumns, readAnswers, safetyToCsv, SAFETY_COLUMNS, summarize, type AnswersTable, type ColumnMap,
} from '../../lib/retreat-guest-form/answers'
import { menuHashWithDiets, type GuestFormState } from '../../lib/retreat-guest-form/form'
import { guestLabel, summaryIssueText } from '../../lib/retreat-guest-form/labels'
import { QUESTIONS, type QuestionId } from '../../lib/retreat-guest-form/questions'
import { DIETS } from '../../lib/retreat-menu/engine'
import { MENU_PATH } from '../../lib/retreat-menu/form'
import { dietLabel } from '../../lib/retreat-menu/labels'
import { arrivalsToCsv } from '../../lib/retreat-timeline/arrivals'
import { localePath } from '../../lib/retreat-timeline/form'
import { download } from '../retreat-timeline/download'
import { button, card, field, GOLD, h2, label, printPart } from './styles'
import { GF_UI } from './ui'

const h3: React.CSSProperties = { fontSize: 'var(--text-base)', fontWeight: 400, margin: '0 0 0.5rem', color: 'var(--text-primary)' }
const hint: React.CSSProperties = { color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: '0 0 0.75rem' }
const csv = 'text/csv;charset=utf-8'

/** Сводка ответов. Таблица ответов — только в состоянии этого компонента: ни ссылка, ни черновик её не видят,
 *  после перезагрузки страницы её нет. */
export function AnswersPanel({ locale, form }: { locale: Locale; form: GuestFormState }) {
  const t = GF_UI[locale]
  const [table, setTable] = useState<AnswersTable | null>(null)
  // ручной выбор колонки поверх узнанной; -1 — «нет колонки»
  const [overrides, setOverrides] = useState<Partial<Record<QuestionId, number>>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const map = useMemo<ColumnMap>(() => {
    if (!table) return {}
    const m: ColumnMap = { ...matchColumns(table.header, form.on), ...overrides }
    for (const k of Object.keys(m) as QuestionId[]) if (m[k] === -1) delete m[k]
    return m
  }, [table, form.on, overrides])
  const summary = useMemo(() => (table ? summarize(table, map, form.on, form.passport.guests) : null), [table, map, form.on, form.passport.guests])

  const onFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const tbl = readAnswers(decodeCsvBytes(new Uint8Array(reader.result as ArrayBuffer), locale === 'en' ? 'windows-1252' : 'windows-1251'))
      if (!tbl.rows.length) { setNotice(t.noRows); return }
      setTable(tbl)
      setOverrides({})
      setNotice(t.loadedRows(tbl.rows.length))
    }
    reader.readAsArrayBuffer(file)
  }
  const name = (n: string | undefined, row: number) => n || guestLabel(row, locale)
  // гости, чью диету сводка не знает: колонка пуста; меню посчитает их обычными
  const noDiet = summary && summary.on.includes('diet') ? summary.guests.filter((g) => !g.choice.diet).length : 0
  const wishes = summary ? summary.guests.filter((g) => g.values.expectations) : []

  return (
    <section>
      <div className="gf-screen">
        <h2 style={h2}>{t.answers}</h2>
        <p style={hint}>{t.answersLead}</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0 0 1rem' }}>
          {/* кнопка, а не label: до загрузки должно быть можно добраться с клавиатуры */}
          <button style={button} onClick={() => fileInput.current?.click()}>{t.uploadAnswers}</button>
          <input ref={fileInput} type="file" accept=".csv,text/csv" hidden aria-label={t.uploadAnswers}
            onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
          {table && <button style={button} onClick={() => { setTable(null); setOverrides({}); setNotice(null) }}>{t.clearAnswers}</button>}
        </div>
        {notice && <p role="status" style={{ ...card, color: GOLD, margin: '0 0 1rem' }}>{notice}</p>}
      </div>

      {table && summary && (
        <>
          <div className="gf-screen" style={{ display: 'grid', gap: '1rem' }}>
            <details style={card}>
              <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)' }}>{t.matching}</summary>
              <p style={{ ...hint, marginTop: '0.75rem' }}>{t.matchingHint}</p>
              <div className="gf-grid">
                {QUESTIONS.filter((q) => summary.on.includes(q.id)).map((q) => (
                  <label key={q.id} style={label}>{q.short[locale]}
                    <select style={field} value={map[q.id] ?? -1} onChange={(e) => setOverrides({ ...overrides, [q.id]: Number(e.target.value) })}>
                      <option value={-1}>{t.noColumn}</option>
                      {table.header.map((h, i) => <option key={i} value={i}>{h || `#${i + 1}`}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </details>

            <div style={card}>
              <h3 style={h3}>{t.diets}</h3>
              <p style={hint}>{t.dietsTotal(summary.guests.length)}</p>
              <ul style={{ paddingLeft: '1.2rem', fontSize: 'var(--text-sm)', margin: '0 0 0.75rem' }}>
                {DIETS.filter((d) => summary.diets[d]).map((d) => <li key={d}>{dietLabel(d, locale)}: {summary.diets[d]}</li>)}
                {summary.diets.other ? <li>{t.otherDiets}: {summary.diets.other}
                  <ul>{summary.otherDiets.map((o, k) => <li key={k}>{name(o.guest, o.row)}{o.text ? ` — ${o.text}` : ''}</li>)}</ul></li> : null}
              </ul>
              {noDiet > 0 && <p style={hint}>{t.noDietAnswer(noDiet)}</p>}
              {summary.diets.other ? <p style={hint}>{t.otherNotInMenu}</p> : null}
              {map.diet !== undefined && <a href={localePath(MENU_PATH, locale) + menuHashWithDiets(form.passport, summary.diets)} style={{ color: GOLD, fontSize: 'var(--text-sm)' }}>{t.openMenu} →</a>}
            </div>

            {wishes.length > 0 && (
              <div style={card}>
                <h3 style={h3}>{t.wishes}</h3>
                <ul style={{ paddingLeft: '1.2rem', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: 0 }}>
                  {wishes.map((g) => <li key={g.row}>{name(g.values.name, g.row)} — {g.values.expectations}</li>)}
                </ul>
              </div>
            )}

            <div style={card}>
              <h3 style={h3}>{t.arrivals}</h3>
              <p style={hint}>{t.arrivalsHint}</p>
              <button style={button} onClick={() => download(`arrival-list.${locale}.csv`, arrivalsToCsv(arrivalsOf(summary, locale), locale), csv)}>{t.downloadArrivals}</button>
            </div>

            <div style={card}>
              <h3 style={h3}>{t.chef}</h3>
              <p style={hint}>{t.chefHint}</p>
              <button style={button} onClick={() => download(`guests-for-chef.${locale}.csv`, chefToCsv(summary, locale), csv)}>{t.downloadChef}</button>
            </div>

            <div style={card}>
              <h3 style={h3}>{t.safety}</h3>
              <p style={hint}>{t.safetyHint}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button style={button} onClick={() => download(`good-to-know.${locale}.csv`, safetyToCsv(summary, locale), csv)}>{t.downloadSafety}</button>
                <button style={button} onClick={() => printPart('safety')}>{t.printSafety}</button>
              </div>
            </div>

            <div>
              <h3 style={h3}>{t.issues}</h3>
              {summary.issues.length === 0
                ? <p style={hint}>{t.noIssues}</p>
                : <ul style={{ paddingLeft: '1.2rem', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{summary.issues.map((x, k) => <li key={k}>{summaryIssueText(x, locale)}</li>)}</ul>}
            </div>
          </div>

          <div className="gf-print-safety" aria-hidden="true">
            <h2 style={{ fontSize: '14pt', fontWeight: 400 }}>{form.passport.title ? `${form.passport.title} · ` : ''}{t.safety}</h2>
            <table>
              <thead><tr>{SAFETY_COLUMNS.filter((id) => summary.on.includes(id)).map((id) => <th key={id}>{QUESTIONS.find((q) => q.id === id)!.short[locale]}</th>)}</tr></thead>
              <tbody>{summary.guests.map((g) => (
                <tr key={g.row}>{SAFETY_COLUMNS.filter((id) => summary.on.includes(id)).map((id) => (
                  <td key={id}>{id === 'name' ? name(g.values.name, g.row) : answerText(g, id, locale)}</td>
                ))}</tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
