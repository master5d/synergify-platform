'use client'
import type { Locale } from '../../lib/dictionaries'
import type { BookletForm, BookletContent, SectionId } from '../../lib/retreat-booklet/form'
import { REQUIRED_SECTIONS, SECTION_IDS } from '../../lib/retreat-booklet/sections'
import { sectionLabels } from '../../lib/retreat-booklet/labels'
import { BOOKLET_LIMITS } from '../../lib/retreat-booklet/form'
import { ListEditor } from './list-editor'
import { PeopleEditor } from './people-editor'
import { bk } from './ui'

export function SectionForm({ form, locale, onChange }: { form: BookletForm; locale: Locale; onChange: (f: BookletForm) => void }) {
  const labels = sectionLabels(locale); const t = bk(locale)
  const update = (content: Partial<BookletContent>) => onChange({ ...form, content: { ...form.content, ...content } })
  const toggle = (id: SectionId) => onChange({ ...form, enabled: form.enabled.includes(id) ? form.enabled.filter((x) => x !== id) : [...form.enabled, id] })
  const list = (key: 'fitFor' | 'notFor' | 'included' | 'notIncluded' | 'bookingSteps' | 'packing' | 'rules') =>
    <ListEditor locale={locale} values={form.content[key]} onChange={(v) => update({ [key]: v })} />
  return <div className="bk-sections">{SECTION_IDS.map((id) => <section className="bk-section" key={id}>
    <h2>{labels[id]}</h2>{REQUIRED_SECTIONS.includes(id) ? <span className="bk-required">{t.required}</span> : <label>
      <input type="checkbox" checked={form.enabled.includes(id)} onChange={() => toggle(id)} /> {t.included}</label>}
    {id === 'cover' && <label>{locale === 'ru' ? 'Место' : 'Place'}<input maxLength={BOOKLET_LIMITS.short}
      value={form.content.place} onChange={(e) => update({ place: e.target.value })} /></label>}
    {id === 'invitation' && <label>{locale === 'ru' ? 'Приглашение' : 'Invitation'}<textarea maxLength={BOOKLET_LIMITS.text}
      value={form.content.invitation} onChange={(e) => update({ invitation: e.target.value })} /></label>}
    {(['fitFor', 'notFor', 'included', 'notIncluded', 'bookingSteps', 'packing', 'rules'] as const).includes(id as never) && list(id as never)}
    {id === 'leaders' && <PeopleEditor locale={locale} people={form.content.leaders} onChange={(leaders) => update({ leaders })} />}
    {id === 'team' && <PeopleEditor locale={locale} people={form.content.team} onChange={(team) => update({ team })} />}
    {id === 'contact' && <textarea maxLength={BOOKLET_LIMITS.text} value={form.content.contact} onChange={(e) => update({ contact: e.target.value })} />}
    {id === 'food' && <textarea maxLength={BOOKLET_LIMITS.text} value={form.content.foodText} onChange={(e) => update({ foodText: e.target.value })} />}
    {id === 'payments' && <textarea maxLength={BOOKLET_LIMITS.text} value={form.content.paymentsText} onChange={(e) => update({ paymentsText: e.target.value })} />}
    {id === 'days' && <ListEditor locale={locale} values={form.content.days} onChange={(days) => update({ days })} />}
  </section>)}</div>
}
