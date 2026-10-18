'use client'

import { useRef, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { decodeCsvBytes } from '../../lib/retreat-core/csv'
import type { RetreatPassport } from '../../lib/retreat-core/passport'
import {
  ARRIVAL_CSV_HEADER, ARRIVAL_FIELDS, arrivalsToCsv, checkArrivals, emptyArrival, parseArrivalsCsv, type ArrivalRow,
} from '../../lib/retreat-timeline/arrivals'
import { download } from './download'
import { TL_UI } from './ui'

const field: React.CSSProperties = {
  width: '100%', minWidth: '7rem', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)',
}
const button: React.CSSProperties = { ...field, width: 'auto', minWidth: 0, cursor: 'pointer', fontSize: 'var(--text-sm)' }

/** Лист прибытия. Строки — только в состоянии этого компонента: ни ссылка, ни черновик их не видят. */
export function ArrivalsPanel({ locale, passport }: { locale: Locale; passport: RetreatPassport }) {
  const t = TL_UI[locale]
  const [rows, setRows] = useState<ArrivalRow[]>([emptyArrival()])
  const issues = checkArrivals(rows, passport)
  const head = ARRIVAL_CSV_HEADER[locale]

  const fileInput = useRef<HTMLInputElement>(null)

  const onFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseArrivalsCsv(decodeCsvBytes(new Uint8Array(reader.result as ArrayBuffer)))
      setRows(parsed.length ? parsed : [emptyArrival()])
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{t.arrivalsLead}</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0 0 0.9rem' }}>
        {/* кнопка, а не label: до загрузки должно быть можно добраться с клавиатуры */}
        <button style={button} onClick={() => fileInput.current?.click()}>{t.uploadCsv}</button>
        <input ref={fileInput} type="file" accept=".csv,text/csv" hidden aria-label={t.uploadCsv}
          onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
        <button style={button} onClick={() => download(`arrival-list.${locale}.csv`, arrivalsToCsv(rows, locale), 'text/csv;charset=utf-8')}>{t.downloadCsv}</button>
        <button style={button} onClick={() => setRows([...rows, emptyArrival()])}>{t.addRow}</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="tl-table">
          <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}<th /></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i}>
              {ARRIVAL_FIELDS.map((f) => (
                <td key={f}>
                  <input style={field} aria-label={`${head[ARRIVAL_FIELDS.indexOf(f)]} · ${t.row(i + 1)}`} value={r[f]}
                    placeholder={f === 'dateIn' || f === 'dateOut' ? 'YYYY-MM-DD' : undefined}
                    onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, [f]: e.target.value } : x)))} />
                </td>
              ))}
              <td><button style={button} onClick={() => setRows(rows.filter((_, j) => j !== i))}>{t.remove}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 400, margin: '1.25rem 0 0.5rem' }}>{t.arrivalIssues}</h3>
      {issues.length === 0
        ? <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{t.noIssues}</p>
        : <ul style={{ paddingLeft: '1.2rem', fontSize: 'var(--text-sm)' }}>{issues.map((x, k) => <li key={k}>{t.row(x.row)}: {t.issue[x.id]}</li>)}</ul>}
    </div>
  )
}
