'use client'
import { bk } from './ui'
import type { Locale } from '../../lib/dictionaries'

export function ListEditor({ values, onChange, locale }: { values: string[]; onChange: (v: string[]) => void; locale: Locale }) {
  const t = bk(locale)
  return <div className="bk-fields">{values.map((value, i) => <div className="bk-row" key={i}>
    <input value={value} onChange={(e) => onChange(values.map((x, n) => n === i ? e.target.value : x))} maxLength={120} />
    <button type="button" onClick={() => onChange(values.filter((_, n) => n !== i))}>{t.delete}</button>
    <button type="button" disabled={i === 0} onClick={() => onChange(values.map((x, n) => n === i - 1 ? values[i] : n === i ? values[i - 1] : x))}>{t.up}</button>
    <button type="button" disabled={i === values.length - 1} onClick={() => onChange(values.map((x, n) => n === i + 1 ? values[i] : n === i ? values[i + 1] : x))}>{t.down}</button>
  </div>)}<button type="button" onClick={() => onChange([...values, ''])}>{t.add}</button></div>
}
