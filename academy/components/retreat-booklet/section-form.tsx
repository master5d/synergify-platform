'use client'

// Форма буклета по разделам в порядке канона (SECTION_IDS). Обязательные разделы выключить нельзя; разделы, данные которых
// приходят из соседних инструментов, здесь только показывают, откуда они и как их поправить.
import type { Locale } from '../../lib/dictionaries'
import { BOOKLET_LIMITS, type BookletContent, type BookletForm, type Person, type Experience, type Testimonial, type Qa } from '../../lib/retreat-booklet/form'
import { REQUIRED_SECTIONS, SECTION_IDS, type SectionId } from '../../lib/retreat-booklet/sections'
import { sectionLabels } from '../../lib/retreat-booklet/labels'
import type { PhotoMeta } from '../../lib/retreat-booklet/photos'
import { CardsEditor, ListEditor, PhotoSelect, TextArea, TextField } from './editors'
import { bk, type BookletUi } from './ui'
import { label } from './styles'

const L = BOOKLET_LIMITS
type ImportKind = 'program' | 'menu' | 'calc' | 'timeline'
/** Раздел, чьи данные подтягиваются из соседа: какой сосед. */
const FROM_TOOL: Partial<Record<SectionId, ImportKind>> = { schedule: 'program', food: 'menu', pricing: 'calc', payments: 'timeline' }

function ImportedNote({ t, form, kind }: { t: BookletUi; form: BookletForm; kind: ImportKind }) {
  const done = Boolean(form.imports[kind])
  return <p className="bk-hint">{done ? t.fromTool(t.tools[kind]) : t.notImported(t.tools[kind])}</p>
}

function SectionBody({ id, form, t, photos, set }: {
  id: SectionId; form: BookletForm; t: BookletUi; photos: PhotoMeta[]; set: (patch: Partial<BookletContent>) => void
}) {
  const c = form.content; const f = t.fields
  const people = (key: 'leaders' | 'team', word: string) => (
    <CardsEditor<Person> t={t} word={word} items={c[key]} maxItems={L.people} blank={() => ({ name: '', role: '', bio: '' })}
      onChange={(v) => set({ [key]: v } as Partial<BookletContent>)} render={(p, setP) => <>
        <div className="bk-row" style={{ alignItems: 'stretch' }}>
          <div style={{ flex: 1, minWidth: '9rem' }}><TextField text={f.name} value={p.name} max={L.short} onChange={(v) => setP({ name: v })} /></div>
          <div style={{ flex: 1, minWidth: '9rem' }}><TextField text={f.role} value={p.role} max={L.short} onChange={(v) => setP({ role: v })} /></div>
        </div>
        <TextArea text={f.bio} value={p.bio} max={L.text} rows={3} onChange={(v) => setP({ bio: v })} />
        <PhotoSelect t={t} text={f.photo} value={p.photoId} photos={photos} onChange={(v) => setP({ photoId: v })} />
      </>} />
  )
  switch (id) {
    case 'cover': return <>
      <TextField text={f.place} value={c.place} max={L.short} onChange={(v) => set({ place: v })} />
      <TextField text={f.language} value={c.language === 'ru' ? 'русский' : c.language === 'en' ? 'English' : c.language} max={L.short}
        onChange={(v) => set({ language: v })} />
      <PhotoSelect t={t} text={f.photo} value={c.coverPhotoId} photos={photos} onChange={(v) => set({ coverPhotoId: v })} />
    </>
    case 'invitation': return <TextArea text={f.invitation} value={c.invitation} max={L.text} onChange={(v) => set({ invitation: v })} />
    case 'fit': return <>
      <ListEditor t={t} text={f.fitFor} items={c.fitFor} max={L.short} maxItems={L.list} onChange={(v) => set({ fitFor: v })} />
      <ListEditor t={t} text={f.notFor} items={c.notFor} max={L.short} maxItems={L.list} onChange={(v) => set({ notFor: v })} />
    </>
    case 'experiences': return (
      <CardsEditor<Experience> t={t} word={t.experienceWord} items={c.experiences} maxItems={L.list} blank={() => ({ text: '', serves: '' })}
        onChange={(v) => set({ experiences: v })} render={(x, setX) => <>
          <TextField text={f.experience} value={x.text} max={L.short} onChange={(v) => setX({ text: v })} />
          <TextField text={f.serves} value={x.serves} max={L.short} onChange={(v) => setX({ serves: v })} />
        </>} />
    )
    case 'days': {
      const count = Math.min(L.days, Math.max(1, (form.passport.nights ?? 0) + 1))
      return <div className="bk-stack">{Array.from({ length: count }, (_, i) => (
        <TextArea key={i} text={f.day(i + 1)} value={c.days[i] ?? ''} max={L.text} rows={2}
          onChange={(v) => { const days = Array.from({ length: Math.max(count, c.days.length) }, (_, j) => c.days[j] ?? ''); days[i] = v; set({ days }) }} />
      ))}</div>
    }
    case 'leaders': return people('leaders', t.leaderWord)
    case 'team': return people('team', t.teamWord)
    case 'place': return <>
      <TextArea text={f.placeText} value={c.placeText} max={L.text} onChange={(v) => set({ placeText: v })} />
      {photos.length > 0 && <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={label}>{f.placePhotos}</legend>
        <div className="bk-row">{photos.map((p) => (
          <label key={p.id} className="bk-row" style={{ fontSize: 'var(--text-xs)' }}>
            <input type="checkbox" checked={c.placePhotoIds.includes(p.id)} onChange={(e) => set({
              placePhotoIds: e.target.checked ? [...c.placePhotoIds, p.id] : c.placePhotoIds.filter((x) => x !== p.id),
            })} />{p.name}
          </label>
        ))}</div>
      </fieldset>}
    </>
    case 'food': return <TextArea text={f.foodText} value={c.foodText} max={L.text} onChange={(v) => set({ foodText: v })} />
    case 'inclusions': return <>
      <ListEditor t={t} text={f.included} items={c.included} max={L.short} maxItems={L.list} onChange={(v) => set({ included: v })} />
      <ListEditor t={t} text={f.notIncluded} items={c.notIncluded} max={L.short} maxItems={L.list} onChange={(v) => set({ notIncluded: v })} />
    </>
    case 'booking': return <ListEditor t={t} text={f.bookingSteps} items={c.bookingSteps} max={L.short} maxItems={L.list} onChange={(v) => set({ bookingSteps: v })} />
    case 'preparation': return <TextArea text={f.preparation} value={c.preparation} max={L.text} onChange={(v) => set({ preparation: v })} />
    case 'packing': return <ListEditor t={t} text={f.packing} items={c.packing} max={L.short} maxItems={L.list} onChange={(v) => set({ packing: v })} />
    case 'travel': {
      const tr = c.travel; const setT = (patch: Partial<typeof tr>) => set({ travel: { ...tr, ...patch } })
      return <>
        <div className="bk-row" style={{ alignItems: 'stretch' }}>
          <div style={{ flex: 1, minWidth: '8rem' }}><TextField text={f.startTime} value={tr.startTime} max={L.short} onChange={(v) => setT({ startTime: v })} /></div>
          <div style={{ flex: 1, minWidth: '8rem' }}><TextField text={f.endTime} value={tr.endTime} max={L.short} onChange={(v) => setT({ endTime: v })} /></div>
        </div>
        <TextField text={f.airport} value={tr.airport} max={L.short} onChange={(v) => setT({ airport: v })} />
        <TextField text={f.travelTime} value={tr.travelTime} max={L.short} onChange={(v) => setT({ travelTime: v })} />
        <TextArea text={f.notes} value={tr.notes} max={L.text} rows={3} onChange={(v) => setT({ notes: v })} />
      </>
    }
    case 'rules': return <ListEditor t={t} text={f.rules} items={c.rules} max={L.short} maxItems={L.list} onChange={(v) => set({ rules: v })} />
    case 'payments': return <TextArea text={f.paymentsText} value={c.paymentsText} max={L.text} onChange={(v) => set({ paymentsText: v })} />
    case 'testimonials': return (
      <CardsEditor<Testimonial> t={t} word={t.testimonialWord} items={c.testimonials} maxItems={L.testimonials}
        blank={() => ({ quote: '', author: '', consent: false })} onChange={(v) => set({ testimonials: v })} render={(x, setX) => <>
          <TextArea text={f.quote} value={x.quote} max={L.text} rows={3} onChange={(v) => setX({ quote: v })} />
          <TextField text={f.author} value={x.author} max={L.short} onChange={(v) => setX({ author: v })} />
          <label className="bk-row" style={{ fontSize: 'var(--text-xs)' }}>
            <input type="checkbox" checked={x.consent} onChange={(e) => setX({ consent: e.target.checked })} />{f.consent}
          </label>
        </>} />
    )
    case 'faq': return (
      <CardsEditor<Qa> t={t} word={t.qaWord} items={c.faq} maxItems={L.questions} blank={() => ({ q: '', a: '' })}
        onChange={(v) => set({ faq: v })} render={(x, setX) => <>
          <TextField text={f.q} value={x.q} max={L.short} onChange={(v) => setX({ q: v })} />
          <TextArea text={f.a} value={x.a} max={L.text} rows={3} onChange={(v) => setX({ a: v })} />
        </>} />
    )
    case 'contact': return <TextArea text={f.contact} value={c.contact} max={L.text} rows={2} onChange={(v) => set({ contact: v })} />
    default: return null
  }
}

export function SectionForm({ form, locale, photos, onChange }: {
  form: BookletForm; locale: Locale; photos: PhotoMeta[]; onChange: (next: BookletForm) => void
}) {
  const t = bk(locale); const labels = sectionLabels(locale)
  const set = (patch: Partial<BookletContent>) => onChange({ ...form, content: { ...form.content, ...patch } })
  const toggle = (id: SectionId, on: boolean) => onChange({ ...form, enabled: on ? [...form.enabled, id] : form.enabled.filter((x) => x !== id) })
  return (
    <div>
      {SECTION_IDS.map((id) => {
        const required = REQUIRED_SECTIONS.includes(id)
        const on = required || form.enabled.includes(id)
        const kind = FROM_TOOL[id]
        return (
          <section key={id} className="bk-section" data-section={id}>
            <div className="bk-section-head">
              <h3>{labels[id]}</h3>
              {required
                ? <span className="bk-tag">{t.required}</span>
                : <label className="bk-row" style={{ fontSize: 'var(--text-xs)' }}>
                  <input type="checkbox" checked={on} onChange={(e) => toggle(id, e.target.checked)} />{t.include}
                </label>}
            </div>
            {on && <div className="bk-stack">
              {kind && <ImportedNote t={t} form={form} kind={kind} />}
              <SectionBody id={id} form={form} t={t} photos={photos} set={set} />
            </div>}
          </section>
        )
      })}
    </div>
  )
}
