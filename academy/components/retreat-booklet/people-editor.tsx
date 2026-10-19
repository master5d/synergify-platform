'use client'
import type { Locale } from '../../lib/dictionaries'
import type { Person } from '../../lib/retreat-booklet/form'
import { bk } from './ui'

export function PeopleEditor({ people, onChange, locale }: { people: Person[]; onChange: (v: Person[]) => void; locale: Locale }) {
  const t = bk(locale)
  return <div className="bk-fields">{people.map((person, i) => <fieldset className="bk-card" key={i}>
    <legend>{locale === 'ru' ? 'Участник команды' : 'Team member'}</legend>
    <label>{locale === 'ru' ? 'Имя' : 'Name'}<input maxLength={120} value={person.name}
      onChange={(e) => onChange(people.map((x, n) => n === i ? { ...x, name: e.target.value } : x))} /></label>
    <label>{locale === 'ru' ? 'Роль' : 'Role'}<input maxLength={120} value={person.role}
      onChange={(e) => onChange(people.map((x, n) => n === i ? { ...x, role: e.target.value } : x))} /></label>
    <label>{locale === 'ru' ? 'Био' : 'Bio'}<textarea maxLength={2000} value={person.bio}
      onChange={(e) => onChange(people.map((x, n) => n === i ? { ...x, bio: e.target.value } : x))} /></label>
    <button type="button" onClick={() => onChange(people.filter((_, n) => n !== i))}>{t.delete}</button>
  </fieldset>)}<button type="button" onClick={() => onChange([...people, { name: '', role: '', bio: '' }])}>{t.add}</button></div>
}
