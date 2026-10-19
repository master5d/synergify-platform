'use client'

// Страница «Буклет ретрита»: форма по разделам слева, предпросмотр (он же печать) справа. Данные соседних инструментов
// приходят их ссылками и правятся только там; тексты и фото — здесь. Всё хранится в этом браузере.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { localToday, type IsoDate } from '../../lib/retreat-core/dates'
import { decodeToolLink, TOOL_MAX_FRAGMENT } from '../../lib/retreat-core/tool-link'
import type { RetreatPassport } from '../../lib/retreat-core/passport'
import {
  BOOKLET_PATH, bookletDraftKey, bookletHash, defaultForm, draftOf, exportJson, formFromDecoded, formFromDraft, importJson,
  pickBookletTool, type Accent, type BookletForm, type BookletImports, type Paper,
} from '../../lib/retreat-booklet/form'
import { importLink } from '../../lib/retreat-booklet/imports'
import { checkBooklet } from '../../lib/retreat-booklet/checks'
import { issueText } from '../../lib/retreat-booklet/labels'
import { bookletModel } from '../../lib/retreat-booklet/pages'
import { CALC_PATH, localePath, TIMELINE_PATH } from '../../lib/retreat-timeline/form'
import { MENU_PATH, calcHashFromPassport, menuHashFromPassport, timelineHashFromPassport } from '../../lib/retreat-menu/form'
import { PROGRAM_PATH, programHashFromPassport } from '../../lib/retreat-program/form'
import { FORM_PATH, formHashFromPassport } from '../../lib/retreat-guest-form/form'
import { LANDING_PATH } from '../../lib/retreat-booklet/landing'
import { PassportBar } from '../retreat-core/passport-bar'
import { download } from '../retreat-timeline/download'
import { SectionForm } from './section-form'
import { BookletPreview } from './preview'
import { PhotosPanel, usePhotos } from './photos-panel'
import { bk } from './ui'
import { button, card, field, GOLD, h2, label, pageRule } from './styles'

type Kind = keyof BookletImports
const KINDS: Kind[] = ['program', 'menu', 'calc', 'timeline']
const shown = (n: number | undefined) => (n !== undefined && Number.isFinite(n) ? String(n) : '')
const num = (s: string) => (s.trim() === '' ? undefined : Number(s))

function dateText(iso: IsoDate, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${iso}T00:00:00Z`))
}

export function RetreatBooklet({ locale }: { locale: Locale }) {
  const t = bk(locale)
  const [form, setForm] = useState<BookletForm | null>(null)
  const [today, setToday] = useState<IsoDate>('2026-01-01')
  const [url, setUrl] = useState('')
  const [notice, setNotice] = useState<{ text: string; alert: boolean } | null>(null)
  const jsonInput = useRef<HTMLInputElement>(null)
  const photos = usePhotos(locale)

  useEffect(() => {
    const now = localToday(); setToday(now)
    const hash = window.location.hash
    let draft: string | null = null
    try { draft = localStorage.getItem(bookletDraftKey(locale)) } catch { /* без хранилища — без черновика */ }
    const fromDraft = formFromDraft(draft, now, locale)
    if (hash) {
      const fromHash = formFromDecoded(decodeToolLink(hash, pickBookletTool, locale), now, locale)
      if (fromHash) {
        // ссылка применена один раз: дальше правки живут в черновике, и перезагрузка не возвращает буклет к ссылке
        history.replaceState(null, '', window.location.pathname + window.location.search)
        setForm(fromHash); setNotice({ text: t.loaded, alert: false }); return
      }
      setNotice({ text: t.linkBroken, alert: true })
    } else if (fromDraft) setNotice({ text: t.draftRestored, alert: false })
    setForm(fromDraft ?? defaultForm(now, locale))
  }, [locale, t.loaded, t.linkBroken, t.draftRestored])

  useEffect(() => {
    if (!form) return
    try { localStorage.setItem(bookletDraftKey(locale), draftOf(form)) } catch { /* черновик в браузере — удобство, без него всё работает */ }
  }, [form, locale])

  const blocks = useMemo(() => (form ? bookletModel(form, locale, today) : []), [form, locale, today])
  const checks = useMemo(() => (form ? checkBooklet(form, locale, today, photos.rights) : { errors: [], warnings: [] }), [form, locale, today, photos.rights])
  if (!form) return null

  const setPassport = <K extends keyof RetreatPassport>(key: K, value: RetreatPassport[K]) => setForm({ ...form, passport: { ...form.passport, [key]: value } })
  const pull = () => {
    const r = importLink(form, url.trim(), locale, today)
    if (r.ok) { setForm(r.form); setUrl(''); setNotice({ text: t.imported(t.tools[r.kind]), alert: false }) } else setNotice({ text: r.error, alert: true })
  }
  const dropImport = (kind: Kind) => { const imports = { ...form.imports }; delete imports[kind]; setForm({ ...form, imports }) }
  const copyLink = async () => {
    const hash = bookletHash(form)
    if (hash.length > TOOL_MAX_FRAGMENT) return setNotice({ text: t.tooLong, alert: true })
    const link = `${window.location.origin}${localePath(BOOKLET_PATH, locale)}${hash}`
    try { await navigator.clipboard.writeText(link); setNotice({ text: t.copied, alert: false }) } catch {
      window.location.hash = hash; setNotice({ text: t.copyFailed, alert: true })
    }
  }
  const loadJson = (file: File | undefined) => {
    if (!file) return
    void file.text().then((text) => {
      const next = importJson(text, today, locale)
      if (next) { setForm(next); setNotice({ text: t.jsonLoaded, alert: false }) } else setNotice({ text: t.jsonBroken, alert: true })
    })
  }
  const p = form.passport

  return (
    <div>
      <style>{pageRule(form.paper)}</style>
      <div className="bk-noprint">
        <PassportBar locale={locale} passport={p} links={[
          { href: localePath(TIMELINE_PATH, locale) + timelineHashFromPassport(p), label: t.openTimeline },
          { href: localePath(CALC_PATH, locale) + calcHashFromPassport(p), label: t.openCalc },
          { href: localePath(MENU_PATH, locale) + menuHashFromPassport(p), label: t.openMenu },
          { href: localePath(PROGRAM_PATH, locale) + programHashFromPassport(p), label: t.openProgram },
          { href: localePath(FORM_PATH, locale) + formHashFromPassport(p), label: t.openForm },
          { href: localePath(LANDING_PATH, locale) + bookletHash(form), label: t.openLanding },
        ]} />
        {notice && <p role={notice.alert ? 'alert' : 'status'} style={{ ...card, color: notice.alert ? 'var(--crit)' : GOLD, margin: '0 0 1.25rem' }}>{notice.text}</p>}
        <div style={{ ...card, marginBottom: '1.5rem' }}>
          <label style={label}>{t.importLabel}
            <span className="bk-row">
              <input style={{ ...field, flex: 1, minWidth: '14rem' }} value={url} onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') pull() }} />
              <button type="button" style={button} onClick={pull} disabled={!url.trim()}>{t.importButton}</button>
            </span>
          </label>
          <p className="bk-hint" style={{ marginTop: '0.4rem' }}>{t.importHint}</p>
          {KINDS.some((k) => form.imports[k]) && <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1.1rem', fontSize: 'var(--text-sm)' }}>
            {KINDS.filter((k) => form.imports[k]).map((k) => <li key={k}>{t.importedAt(t.toolsTitle[k], dateText(form.imports[k]!.at, locale))}
              {' '}<button type="button" style={{ ...button, padding: '0.1rem 0.45rem', fontSize: 'var(--text-xs)' }} onClick={() => dropImport(k)}>{t.removeImport}</button></li>)}
          </ul>}
        </div>
      </div>

      <div className="bk-layout">
        <div className="bk-noprint">
          <h2 style={h2}>{t.retreat}</h2>
          <div className="bk-row" style={{ alignItems: 'stretch' }}>
            <label style={{ ...label, flex: 2, minWidth: '12rem' }}>{t.titleLabel}
              <input style={field} value={p.title ?? ''} maxLength={200} onChange={(e) => setPassport('title', e.target.value || undefined)} /></label>
            <label style={{ ...label, flex: 1, minWidth: '6rem' }}>{t.currency}
              <input style={field} value={p.currency ?? ''} maxLength={3} onChange={(e) => setPassport('currency', e.target.value.toUpperCase() || undefined)} /></label>
          </div>
          <div className="bk-row" style={{ alignItems: 'stretch', marginTop: '0.6rem' }}>
            <label style={{ ...label, flex: 2, minWidth: '10rem' }}>{t.start}
              <input style={field} type="date" value={p.start ?? ''} onChange={(e) => setPassport('start', (e.target.value || undefined) as IsoDate | undefined)} /></label>
            <label style={{ ...label, flex: 1, minWidth: '5rem' }}>{t.nights}
              <input style={field} inputMode="numeric" value={shown(p.nights)} onChange={(e) => setPassport('nights', num(e.target.value))} /></label>
            <label style={{ ...label, flex: 1, minWidth: '5rem' }}>{t.guests}
              <input style={field} inputMode="numeric" value={shown(p.guests)} onChange={(e) => setPassport('guests', num(e.target.value))} /></label>
          </div>

          <h2 style={{ ...h2, marginTop: '2rem' }}>{t.sections}</h2>
          <SectionForm form={form} locale={locale} photos={photos.photos} onChange={setForm} />

          <PhotosPanel locale={locale} state={photos} content={form.content} onChange={(content) => setForm({ ...form, content })} />

          <h2 style={{ ...h2, marginTop: '2rem' }}>{t.settings}</h2>
          <div className="bk-row" style={{ alignItems: 'stretch' }}>
            <label style={{ ...label, flex: 1 }}>{t.paper}
              <select style={field} value={form.paper} onChange={(e) => setForm({ ...form, paper: e.target.value as Paper })}>
                <option value="a4">A4</option><option value="letter">Letter</option>
              </select></label>
            <label style={{ ...label, flex: 1 }}>{t.accent}
              <select style={field} value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value as Accent })}>
                {(['sand', 'sage', 'clay', 'ink'] as const).map((a) => <option key={a} value={a}>{t.accents[a]}</option>)}
              </select></label>
          </div>
          <div className="bk-row" style={{ margin: '1rem 0 0.4rem' }}>
            <button type="button" style={button} onClick={() => window.print()}>{t.savePdf}</button>
            <button type="button" style={button} onClick={copyLink}>{t.copyLink}</button>
            <button type="button" style={button} onClick={() => download('retreat-booklet.json', exportJson(form), 'application/json')}>{t.downloadJson}</button>
            <button type="button" style={button} onClick={() => jsonInput.current?.click()}>{t.uploadJson}</button>
            <input ref={jsonInput} type="file" accept=".json,application/json" hidden aria-label={t.uploadJson}
              onChange={(e) => { loadJson(e.target.files?.[0]); e.target.value = '' }} />
          </div>
          <p className="bk-hint">{t.pdfHint}</p>
          <p className="bk-hint" style={{ marginTop: '1.5rem' }}>{t.disclaimer}</p>
        </div>

        <div className="bk-preview-col">
          <div className="bk-noprint" style={{ ...card, marginBottom: '1rem' }}>
            {checks.errors.length > 0
              ? <div role="alert"><strong>{t.errors}</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem', fontSize: 'var(--text-sm)' }}>{checks.errors.map((x, i) => <li key={i}>{issueText(x, locale)}</li>)}</ul></div>
              : <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: GOLD }}>{t.allGood}</p>}
            {checks.warnings.length > 0 && <div style={{ marginTop: '0.8rem' }}><strong>{t.warnings}</strong>
              <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem', fontSize: 'var(--text-sm)' }}>{checks.warnings.map((x, i) => <li key={i}>{issueText(x, locale)}</li>)}</ul></div>}
          </div>
          {/* при печати с ошибками первым листом идёт их список: буклет-договор с дырами не должен уйти гостю молча */}
          {checks.errors.length > 0 && <div className="bk-print-errors"><strong>{t.errors}</strong>
            <ul>{checks.errors.map((x, i) => <li key={i}>{issueText(x, locale)}</li>)}</ul></div>}
          <BookletPreview form={form} blocks={blocks} locale={locale} photos={{ urls: photos.urls, rights: photos.rights }} />
        </div>
      </div>
    </div>
  )
}
