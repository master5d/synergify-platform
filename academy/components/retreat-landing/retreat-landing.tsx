'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { localToday, type IsoDate } from '../../lib/retreat-core/dates'
import { decodeToolLink } from '../../lib/retreat-core/tool-link'
import { CALC_PATH, localePath, TIMELINE_PATH } from '../../lib/retreat-timeline/form'
import { MENU_PATH, calcHashFromPassport, menuHashFromPassport, timelineHashFromPassport } from '../../lib/retreat-menu/form'
import { PROGRAM_PATH, programHashFromPassport } from '../../lib/retreat-program/form'
import { FORM_PATH, formHashFromPassport } from '../../lib/retreat-guest-form/form'
import { bookletDraftKey, bookletHash, defaultForm, draftOf, formFromDecoded, formFromDraft, pickBookletTool, type BookletForm } from '../../lib/retreat-booklet/form'
import { checkLanding, renderLandingHtml } from '../../lib/retreat-booklet/landing'
import { htmlBytes } from '../../lib/retreat-booklet/landing-media'
import { issueText } from '../../lib/retreat-booklet/labels'
import { PassportBar } from '../retreat-core/passport-bar'
import { download } from '../retreat-timeline/download'
import { usePhotos, photoDataUris } from '../retreat-booklet/photos-panel'
import { button, card, GOLD } from '../retreat-booklet/styles'
import { ExtrasForm, landingFileName } from './extras-form'
import { landingUi } from './ui'
import { LandingPreview } from './preview'

const photoIds = (form: BookletForm) => [...new Set([
  form.content.coverPhotoId, ...form.content.placePhotoIds, ...form.content.leaders.map((p) => p.photoId), ...form.content.team.map((p) => p.photoId),
].filter((id): id is string => Boolean(id)))]

export function RetreatLanding({ locale }: { locale: Locale }) {
  const t = landingUi(locale)
  const [form, setForm] = useState<BookletForm | null>(null)
  const [today, setToday] = useState<IsoDate>('2026-01-01')
  const [notice, setNotice] = useState<{ text: string; alert: boolean } | null>(null)
  const [photoUris, setPhotoUris] = useState<Record<string, string>>({})
  const [device, setDevice] = useState<'phone' | 'computer'>('phone')
  const photos = usePhotos(locale)

  useEffect(() => {
    const now = localToday(); setToday(now)
    let draft: string | null = null
    try { draft = localStorage.getItem(bookletDraftKey(locale)) } catch { /* без хранилища — без черновика */ }
    const fromDraft = formFromDraft(draft, now, locale)
    if (window.location.hash) {
      const fromHash = formFromDecoded(decodeToolLink(window.location.hash, pickBookletTool, locale), now, locale)
      if (fromHash) {
        history.replaceState(null, '', window.location.pathname + window.location.search)
        setForm(fromHash); setNotice({ text: t.loaded, alert: false }); return
      }
      setNotice({ text: t.linkBroken, alert: true })
    } else if (fromDraft) setNotice({ text: t.draftRestored, alert: false })
    setForm(fromDraft ?? defaultForm(now, locale))
  }, [locale, t.loaded, t.linkBroken, t.draftRestored])

  useEffect(() => {
    if (!form) return
    try { localStorage.setItem(bookletDraftKey(locale), draftOf(form)) } catch { /* черновик — удобство, без него всё работает */ }
  }, [form, locale])

  const ids = useMemo(() => form ? photoIds(form) : [], [form])
  const rightsKey = photos.photos.map((p) => `${p.id}:${p.rights ? '1' : '0'}`).join(',')
  useEffect(() => {
    let alive = true
    if (!photos.photos.length) { setPhotoUris({}); return () => { alive = false } }
    // data URI пересчитываются только при смене набора используемых фото или их прав, а не на каждый ввод текста
    const getUris = async () => {
      const result: Record<string, string> = {}
      for (const id of ids) {
        const uri = await photos.dataUri(id)
        if (uri) result[id] = uri
      }
      return result
    }
    void getUris().then((result) => { if (alive) setPhotoUris(result) })
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(','), rightsKey])

  const html = useMemo(() => form ? renderLandingHtml(form, locale, today, { photoUris, rights: photos.rights }) : '', [form, locale, today, photoUris, photos.rights])
  const bytes = htmlBytes(html)
  const checks = form ? checkLanding(form, locale, today, photos.rights, bytes) : { errors: [], warnings: [] }
  if (!form) return null
  const p = form.passport
  const setLanding = (landing: BookletForm['landing']) => setForm({ ...form, landing })
  const copy = () => download(landingFileName(p.title ?? ''), html, 'text/html;charset=utf-8')
  const errorItems = checks.errors.map((x, i) => <li key={i}>{issueText(x, locale)}</li>)
  const warningItems = checks.warnings.map((x, i) => <li key={i}>{issueText(x, locale)}</li>)
  return <div>
    <div className="bk-noprint"><PassportBar locale={locale} passport={p} links={[
      { href: localePath('/instrumenty/buklet/', locale) + bookletHash(form), label: locale === 'ru' ? 'Буклет' : 'Booklet' },
      { href: localePath(TIMELINE_PATH, locale) + timelineHashFromPassport(p), label: locale === 'ru' ? 'Таймлайн' : 'Timeline' },
      { href: localePath(CALC_PATH, locale) + calcHashFromPassport(p), label: locale === 'ru' ? 'Калькулятор' : 'Calculator' },
      { href: localePath(MENU_PATH, locale) + menuHashFromPassport(p), label: locale === 'ru' ? 'Меню' : 'Menu' },
      { href: localePath(PROGRAM_PATH, locale) + programHashFromPassport(p), label: locale === 'ru' ? 'Программа' : 'Programme' },
      { href: localePath(FORM_PATH, locale) + formHashFromPassport(p), label: locale === 'ru' ? 'Анкета' : 'Guest form' },
    ]} />
      {notice && <p role={notice.alert ? 'alert' : 'status'} style={{ ...card, color: notice.alert ? 'var(--crit)' : GOLD }}>{notice.text}</p>}
    </div>
    <div className="bk-layout"><div className="bk-noprint"><ExtrasForm locale={locale} value={form.landing} onChange={setLanding} />
      <p className="bk-hint" style={{ marginTop: '1rem' }}>{t.bookletNote} — <a href={localePath('/instrumenty/buklet/', locale) + bookletHash(form)}>{t.openBooklet}</a></p>
      <div className="bk-row" style={{ marginTop: '1rem' }}><button type="button" style={button} onClick={copy}>{t.download}</button>
        <span className="bk-hint">{t.size(bytes)}</span></div>
      {checks.errors.length > 0 && <p className="bk-hint" style={{ color: 'var(--crit)' }}>{t.downloadBlocked}</p>}
    </div><div className="bk-preview-col">
      <div className="bk-noprint" style={{ ...card, marginBottom: '1rem' }} role="alert">
        {checks.errors.length ? <><strong>{t.errors}</strong><ul>{errorItems}</ul></> : <p style={{ margin: 0, color: GOLD }}>{t.allGood}</p>}
        {checks.warnings.length > 0 && <><strong>{t.warnings}</strong><ul>{warningItems}</ul></>}
      </div>
      <div className="bk-noprint bk-row" style={{ marginBottom: '0.6rem' }}>
        <button type="button" style={button} onClick={() => setDevice('phone')}>{t.phone}</button>
        <button type="button" style={button} onClick={() => setDevice('computer')}>{t.computer}</button>
      </div>
      <LandingPreview html={html} phone={device === 'phone'} title={t.preview} />
    </div></div>
  </div>
}
