'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { localToday } from '../../lib/retreat-core/dates'
import { validatePassport, type RetreatPassport } from '../../lib/retreat-core/passport'
import { decodeToolLink } from '../../lib/retreat-core/tool-link'
import {
  defaultForm, draftOf, FORM_DRAFT_KEY, FORM_PATH, formFromDecoded, formFromDraft, formHash, pickFormTool, type GuestFormState,
} from '../../lib/retreat-guest-form/form'
import { answersTemplateCsv, formText, normalizeOn, QUESTIONS, SECTION_TITLE, SECTION_WHY, type QuestionId, type SectionId } from '../../lib/retreat-guest-form/questions'
import { calcHashFromPassport, menuHashFromPassport, MENU_PATH, timelineHashFromPassport } from '../../lib/retreat-menu/form'
import { CALC_PATH, localePath, TIMELINE_PATH } from '../../lib/retreat-timeline/form'
import { PROGRAM_PATH, programHashFromPassport } from '../../lib/retreat-program/form'
import { PassportBar } from '../retreat-core/passport-bar'
import { download } from '../retreat-timeline/download'
import { AnswersPanel } from './answers-panel'
import { button, card, field, GOLD, h2, label, printPart } from './styles'
import { GF_UI } from './ui'

const SECTIONS: SectionId[] = ['contact', 'travel', 'food', 'health', 'other']

const shown = (n: number | undefined) => (n !== undefined && Number.isFinite(n) ? String(n) : '')
const parsedInt = (s: string) => (s.trim() === '' ? NaN : Number(s))

export function RetreatGuestForm({ locale }: { locale: Locale }) {
  const t = GF_UI[locale]
  const [f, setF] = useState<GuestFormState | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const now = localToday()
    const hash = window.location.hash
    if (hash) {
      const d = decodeToolLink(hash, pickFormTool, locale)
      const fromLink = formFromDecoded(d, now)
      if (fromLink) { setF(fromLink); setNotice(t.loaded); return }
      if (!d.ok) setNotice(d.error)
    }
    let draft: string | null = null
    try { draft = localStorage.getItem(FORM_DRAFT_KEY) } catch { /* хранилище недоступно — начинаем с чистой формы */ }
    const fromDraft = formFromDraft(draft, now)
    if (fromDraft && !hash) setNotice(t.draftRestored)
    setF(fromDraft ?? defaultForm(now))
  }, [locale, t.loaded, t.draftRestored])

  useEffect(() => {
    if (!f) return
    // в черновике — только паспорт и набор вопросов (draftOf); ответов в этом состоянии нет
    try { localStorage.setItem(FORM_DRAFT_KEY, draftOf(f)) } catch { /* черновик — удобство, без него всё работает */ }
  }, [f])

  const errors = useMemo(() => (f ? validatePassport(f.passport, locale) : []), [f, locale])
  const text = useMemo(() => (f ? formText(f.on, locale, f.passport.title) : ''), [f, locale])

  if (!f) return null

  const setP = <K extends keyof RetreatPassport>(k: K, v: RetreatPassport[K]) => setF({ ...f, passport: { ...f.passport, [k]: v } })
  const toggle = (id: QuestionId, on: boolean) => setF({ ...f, on: normalizeOn(on ? [...f.on, id] : f.on.filter((x) => x !== id)) })
  const copy = async (value: string, ok: string, fallback: () => void) => {
    try { await navigator.clipboard.writeText(value); setNotice(ok) } catch { fallback() }
  }

  return (
    <div>
      <style>{`
        .gf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr)); gap: 0.9rem; }
        .gf-sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(19rem, 100%), 1fr)); gap: 1rem; }
        .gf-q { display: flex; gap: 0.55rem; align-items: flex-start; font-size: var(--text-sm); padding: 0.35rem 0; }
        .gf-route { color: var(--text-secondary); font-size: var(--text-xs); }
        .gf-print-form, .gf-print-safety, .gf-print-wishes { display: none; }
        .gf-print-safety table, .gf-print-wishes table { width: 100%; border-collapse: collapse; font-size: 10pt; }
        .gf-print-safety th, .gf-print-safety td, .gf-print-wishes th, .gf-print-wishes td { border: 1px solid #999; padding: 4px 6px; text-align: left; vertical-align: top; }
        @media print {
          .gf-screen { display: none !important; }
          body:not([data-gf-print]) .gf-print-form, body[data-gf-print="form"] .gf-print-form { display: block; }
          body[data-gf-print="safety"] .gf-print-safety { display: block; }
          body[data-gf-print="wishes"] .gf-print-wishes { display: block; }
        }
      `}</style>

      <div className="gf-screen">
        <PassportBar locale={locale} passport={f.passport} links={[
          { href: localePath(TIMELINE_PATH, locale) + timelineHashFromPassport(f.passport), label: t.openTimeline },
          { href: localePath(MENU_PATH, locale) + menuHashFromPassport(f.passport), label: t.openMenuBar },
          { href: localePath(CALC_PATH, locale) + calcHashFromPassport(f.passport), label: t.openCalc },
          { href: localePath(PROGRAM_PATH, locale) + programHashFromPassport(f.passport), label: t.openProgram },
        ]} />
        {notice && <p role="status" style={{ ...card, color: GOLD, margin: '0 0 1.25rem', whiteSpace: 'pre-wrap' }}>{notice}</p>}

        <h2 style={h2}>{t.retreat}</h2>
        <div className="gf-grid">
          <label style={label}>{t.titleLabel}<input style={field} value={f.passport.title ?? ''} onChange={(e) => setP('title', e.target.value || undefined)} /></label>
          <label style={label}>{t.currency}
            <input style={field} value={f.passport.currency ?? ''} maxLength={3}
              onChange={(e) => setP('currency', e.target.value.toUpperCase() || undefined)} />
          </label>
          <label style={label}>{t.start}<input type="date" style={field} value={f.passport.start ?? ''} onChange={(e) => setP('start', e.target.value || undefined)} /></label>
          <label style={label}>{t.nights}
            <input style={field} inputMode="numeric" value={shown(f.passport.nights)}
              onChange={(e) => setP('nights', parsedInt(e.target.value))} />
          </label>
          <label style={label}>{t.guests}
            <input style={field} inputMode="numeric" value={shown(f.passport.guests)}
              onChange={(e) => setP('guests', parsedInt(e.target.value))} />
          </label>
        </div>
        {errors.length > 0 && (
          <div role="alert" style={{ ...card, marginTop: '1rem', borderColor: 'var(--accent-ink)' }}>
            <strong>{t.fix}</strong>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}

        <h2 style={h2}>{t.builder}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: '0 0 1rem' }}>{t.builderLead}</p>
        <div className="gf-sections">
          {SECTIONS.map((s) => (
            <fieldset key={s} style={{ ...card, margin: 0 }}>
              <legend style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', padding: '0 0.3rem' }}>{SECTION_TITLE[s][locale]}</legend>
              {SECTION_WHY[s] && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.5rem' }}>{SECTION_WHY[s]![locale]}</p>}
              {QUESTIONS.filter((q) => q.section === s).map((q) => (
                <label key={q.id} className="gf-q">
                  <input type="checkbox" checked={f.on.includes(q.id)} disabled={q.required} onChange={(e) => toggle(q.id, e.target.checked)} />
                  <span>{q.text[locale]}{q.required ? ` (${t.always})` : ''}<br />
                    <span className="gf-route">{t.routeLabel}: {q.routes.map((r) => t.routes[r]).join(', ')}</span></span>
                </label>
              ))}
            </fieldset>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1.25rem 0' }}>
          <button style={button} onClick={() => copy(text, t.textCopied, () => setNotice(text))}>{t.copyText}</button>
          <button style={button} onClick={() => printPart('form')}>{t.printForm}</button>
          <button style={button} onClick={() => download(
            `guest-answers-template.${locale}.csv`, answersTemplateCsv(f.on, locale), 'text/csv;charset=utf-8',
          )}>{t.downloadTemplate}</button>
          <button style={button} onClick={() => {
            const url = `${window.location.origin}${localePath(FORM_PATH, locale)}${formHash(f)}`
            copy(url, t.copied, () => { window.location.hash = formHash(f) })
          }}>{t.copyLink}</button>
        </div>
        <details style={card}>
          <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)' }}>{t.preview}</summary>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: '0.75rem 0 0' }}>{text}</pre>
        </details>
      </div>

      <AnswersPanel locale={locale} form={f} />

      <div className="gf-print-form" aria-hidden="true">
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '11pt', lineHeight: 1.7 }}>{text}</pre>
      </div>

      <p className="gf-screen" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', lineHeight: 1.6, marginTop: '2rem' }}>{t.disclaimer}</p>
    </div>
  )
}
