'use client'

import { useState } from 'react'
import { CHANNELS, EVENT_CLASSES, RUNGS_ORDER } from '../../lib/format-ladder/axes'
import { FAMILIES } from '../../lib/format-ladder/families'
import { courseOf, formatsIn } from '../../lib/format-ladder/formats'
import { RUNGS } from '../../lib/format-ladder/rungs'
import type { ChannelId, EventClass, Format, RungId } from '../../lib/format-ladder/types'
import { UI } from './ui'
import { card, h2, label } from '../retreat-booklet/styles'

type Locale = 'ru' | 'en'
type Labels = typeof UI.ru

// Карта форматов: ступени сверху вниз, в каждой — законы, признаки и три клетки каналов; фильтр класса события сверху
export function LadderGrid({ locale, initialClass = null }: { locale: Locale; initialClass?: EventClass | null }) {
  const t = UI[locale]
  const [eventClass, setEventClass] = useState<EventClass | null>(initialClass)

  return (
    <div>
      <fieldset style={filterStyle}>
        <legend style={label}>{t.eventClass}</legend>
        <label style={label}>
          <input type="radio" name="ladder-class" checked={eventClass === null} onChange={() => setEventClass(null)} /> {t.all}
        </label>
        {EVENT_CLASSES.map((item) => (
          <label key={item.id} style={label}>
            <input type="radio" name="ladder-class" value={item.id} checked={eventClass === item.id}
              onChange={() => setEventClass(item.id)} /> {item.label[locale]}
          </label>
        ))}
      </fieldset>
      {RUNGS_ORDER.map((id) => <RungSection key={id} id={id} eventClass={eventClass} locale={locale} t={t} />)}
    </div>
  )
}

function RungSection({ id, eventClass, locale, t }: { id: RungId; eventClass: EventClass | null; locale: Locale; t: Labels }) {
  const rung = RUNGS.find((item) => item.id === id)!
  const laws: [string, string][] = [
    [t.attention, rung.laws.attention[locale]],
    [t.pricePerHead, rung.laws.pricePerHead[locale]],
    [t.team, rung.laws.team[locale]],
    [t.voice, rung.laws.voice[locale]],
    [t.gives, rung.laws.gives[locale]],
  ]
  return (
    <section data-rung={id} style={{ ...card, marginBottom: '1rem' }}>
      <h2 style={h2}>{rung.label[locale]} <small>{rung.size[locale]}</small></h2>
      <dl>
        {laws.map(([title, value]) => (
          <div key={title}>
            <dt>{title}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="ladder-two">
        <Signals title={t.timeToStepUp} items={rung.upSignals.map((x) => x[locale])} />
        <Signals title={t.tooEarly} items={rung.earlySignals.map((x) => x[locale])} />
      </div>
      <div className="ladder-channels">
        {CHANNELS.map((channel) => (
          <ChannelCell key={channel.id} channel={channel.id} title={channel.label[locale]} rung={id}
            eventClass={eventClass} locale={locale} t={t} />
        ))}
      </div>
    </section>
  )
}

function Signals({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  )
}

function ChannelCell({ channel, title, rung, eventClass, locale, t }: {
  channel: ChannelId; title: string; rung: RungId; eventClass: EventClass | null; locale: Locale; t: Labels
}) {
  const formats = formatsIn(rung, channel, eventClass)
  return (
    <div data-channel={channel}>
      <h3>{title}</h3>
      {formats.map((format) => <FormatCard key={format.id} format={format} rung={rung} channel={channel} locale={locale} t={t} />)}
      {formats.length === 0 && <p>{t.empty}</p>}
    </div>
  )
}

// Карточка без атрибута id: формат с двумя клетками на одной ступени даёт две карточки
function FormatCard({ format, rung, channel, locale, t }: { format: Format; rung: RungId; channel: ChannelId; locale: Locale; t: Labels }) {
  const family = FAMILIES.find((item) => item.id === format.family)!
  const course = courseOf(format)
  const classes = format.cells
    .filter((c) => c.rung === rung && c.channel === channel)
    .map((c) => EVENT_CLASSES.find((e) => e.id === c.eventClass)!.label[locale])
  return (
    <article data-format={format.id} style={{ ...card, marginBottom: '.6rem' }}>
      <strong>{format.name[locale]}</strong>
      <p>{format.about[locale]}</p>
      <small data-class>{classes.join(', ')} · {family.label[locale]}</small>
      {course
        ? <a href={course[locale]} style={{ display: 'block', marginTop: '.5rem' }}>{t.course}</a>
        : <span style={{ display: 'block', marginTop: '.5rem' }}>{t.soon}</span>}
    </article>
  )
}

const filterStyle = { ...card, border: 0, margin: '0 0 2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' as const }
