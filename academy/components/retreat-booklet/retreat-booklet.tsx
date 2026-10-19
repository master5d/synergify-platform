'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { bookletDraftKey, bookletHash, defaultForm, exportJson, formFromDecoded, formFromDraft, importJson,
  type BookletForm, type BookletContent } from '../../lib/retreat-booklet/form'
import { importLink } from '../../lib/retreat-booklet/imports'
import { checkBooklet } from '../../lib/retreat-booklet/checks'
import { issueText } from '../../lib/retreat-booklet/labels'
import { decodeToolLink } from '../../lib/retreat-core/tool-link'
import { pickBookletTool } from '../../lib/retreat-booklet/form'
import type { Locale } from '../../lib/dictionaries'
import { bk } from './ui'
import { PhotosPanel } from './photos-panel'
import { BookletPreview } from './preview'
import { SectionForm } from './section-form'
import { PassportBar } from '../retreat-core/passport-bar'

const today = () => new Date().toISOString().slice(0, 10) as never
export function RetreatBooklet({ locale }: { locale: Locale }) {
  const lang = locale
  const t = bk(locale)
  const [form, setForm] = useState<BookletForm>(() => defaultForm(today(), lang))
  const [url, setUrl] = useState('')
  const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const fromHash = formFromDecoded(decodeToolLink(window.location.hash, pickBookletTool, lang), today(), lang)
    const saved = formFromDraft(localStorage.getItem(bookletDraftKey(lang)), today(), lang)
    setForm(fromHash ?? saved ?? defaultForm(today(), lang))
  }, [lang])
  useEffect(() => { try { localStorage.setItem(bookletDraftKey(lang), JSON.stringify(form)) } catch { /* браузер может запретить localStorage */ } }, [form, lang])
  const issues = useMemo(() => checkBooklet(form, lang, today()), [form, lang]);
  const update = (content: Partial<BookletContent>) => setForm((f) => ({ ...f, content: { ...f.content, ...content } }))
  const importNow = () => { const result = importLink(form, url, lang, today()); if (result.ok) {
    setForm(result.form); setNotice(`${result.kind} ${t.imported}`)
  } else {
    const tooLong = locale === 'ru' ? 'Ссылка слишком длинная — скачайте черновик файлом'
      : 'The link is too long — download the draft as a file'
    const message = url.length > 64000 ? tooLong : result.error
    setNotice(message)
  } }
  const download = () => { const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([exportJson(form)], { type: 'application/json' })); a.download = 'retreat-booklet.json'; a.click(); URL.revokeObjectURL(a.href) }
  const bookletLinks = ['tajmlajn', 'kalkulyator-retrita', 'generator-menyu', 'konstruktor-programmy', 'anketa-gostya'].map((path) => ({
    href: `${locale === 'en' ? '/en' : ''}/instrumenty/${path}/`, label: t.build,
  }))
  const accentValue = { sand: 'var(--accent)', sage: 'var(--accent-sage)', clay: 'var(--accent-clay)', ink: 'var(--accent-ink)' }[form.accent]
  return <div style={{ ['--bk-accent' as string]: accentValue } as React.CSSProperties}><style>{`@page{size:${form.paper === 'letter' ? 'Letter' : 'A4'}}`}</style>
    <PassportBar locale={locale} passport={form.passport} links={bookletLinks} />
    <div className="bk-noprint bk-panel"><div className="bk-row"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t.importLabel} />
      <button type="button" onClick={importNow}>{t.importButton}</button></div>{notice && <p role="status">{notice}</p>}</div>
      <div className="bk-grid"><div className="bk-noprint"><div className="bk-panel"><SectionForm form={form} locale={locale} onChange={setForm} />
        <label>{t.paper}<select value={form.paper}
        onChange={(e) => setForm({ ...form, paper: e.target.value as BookletForm['paper'] })}>
        <option value="a4">{t.a4}</option><option value="letter">{t.letter}</option></select></label>
        <label>{t.accent}<select value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value as BookletForm['accent'] })}>
          <option value="sand">sand</option><option value="sage">sage</option><option value="clay">clay</option><option value="ink">ink</option></select></label>
      <div className="bk-actions"><button type="button" onClick={() => window.print()}>{t.save}</button>
        <button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href.split('#')[0] + bookletHash(form))
          .then(() => setNotice('')).catch(() => setNotice(locale === 'ru' ? 'Не удалось скопировать ссылку.' : 'Could not copy the link.'))}>{t.copy}</button>
        <button type="button" onClick={download}>{t.download}</button><button type="button" onClick={() => fileRef.current?.click()}>{t.upload}</button>
        <input hidden ref={fileRef} type="file" accept="application/json" onChange={(e) => { const file = e.target.files?.[0]; if (file) void file.text().then((text) => {
          const next = importJson(text, today(), lang); if (next) setForm(next)
          else setNotice(locale === 'ru' ? 'Файл не распознан.' : 'File not recognised.') }) }} /></div></div>
      <PhotosPanel locale={locale} content={form.content} onChange={(content) => setForm({ ...form, content })} /></div>
      <div><div className="bk-panel bk-noprint">{issues.errors.length > 0 && <div role="alert"><strong>{locale === 'ru' ? 'Ошибки' : 'Errors'}</strong>
        {issues.errors.map((x, i) => <p key={i}>{issueText(x, lang)}</p>)}</div>}{issues.warnings.length > 0 && <div><strong>{locale === 'ru' ? 'Замечания' : 'Notes'}</strong>
         {issues.warnings.map((x, i) => <p key={i}>{issueText(x, lang)}</p>)}</div>}</div>
        {issues.errors.length > 0 && <div className="bk-print-errors"><strong>{locale === 'ru' ? 'Сначала исправьте' : 'Fix these first'}</strong>
          <ul>{issues.errors.map((x, i) => <li key={i}>{issueText(x, lang)}</li>)}</ul></div>}
        <BookletPreview form={form} locale={locale} today={today()} /></div></div></div>
}
