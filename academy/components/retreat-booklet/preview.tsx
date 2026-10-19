'use client'

// Предпросмотр буклета — он же печать. Рисует модель страниц движка (bookletModel) по разделам; фото — из этого браузера
// (object URL) и только с отметкой права: без неё на экране плашка, в печать не идёт ничего.
import type { Locale } from '../../lib/dictionaries'
import type { BookletForm } from '../../lib/retreat-booklet/form'
import type { BookletBlock } from '../../lib/retreat-booklet/pages'
import { dietLabel } from '../../lib/retreat-menu/labels'
import type { DietId } from '../../lib/retreat-menu/engine'
import { bk, type BookletUi } from './ui'
import { ACCENTS } from './styles'

export interface PhotoView { urls: Record<string, string>; rights: Record<string, boolean> }

function money(units: number, currency: string, locale: Locale): string {
  try {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ru-RU', { style: 'currency', currency, maximumFractionDigits: units % 1 === 0 ? 0 : 2 }).format(units)
  } catch {
    return `${units} ${currency}`
  }
}
function dateText(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${iso}T00:00:00Z`))
}

function Photo({ id, photos, t, alt }: { id: string | undefined; photos: PhotoView; t: BookletUi; alt: string }) {
  if (!id) return null
  if (photos.rights[id] !== true) return <div className="bk-no-rights bk-noprint">{t.noRights}</div>
  const url = photos.urls[id]
  return url ? <img src={url} alt={alt} /> : null
}

function List({ items }: { items: string[] }) {
  const shown = items.filter((x) => x.trim())
  return shown.length ? <ul>{shown.map((x, i) => <li key={i}>{x}</li>)}</ul> : null
}

/** Расписание без служебных строк сетки (нагрузка и свободные часы) и без пустых получасов. */
function scheduleRows(rows: unknown[]): string[][] {
  const table = rows as string[][]
  if (!table.length) return []
  const [head, ...body] = table
  return [head, ...body.filter((r) => !/нагрузка|load|свободное время|free time/i.test(r[0] ?? '') && r.slice(1).some((cell) => cell && cell !== '↓'))]
}

function Block({ block, form, locale, t, photos }: { block: BookletBlock; form: BookletForm; locale: Locale; t: BookletUi; photos: PhotoView }) {
  const c = form.content
  switch (block.id) {
    case 'cover': {
      const d = block.data
      const lang = c.language === 'ru' ? 'русский' : c.language === 'en' ? 'English' : c.language
      return (
        <section className="bk-sheet bk-cover" data-block="cover">
          <Photo id={c.coverPhotoId} photos={photos} t={t} alt="" />
          <div className="bk-cover-text">
            <div className="bk-cover-meta">{[d.dateText, d.nights ? t.nights_(d.nights) : ''].filter(Boolean).join(' · ')}</div>
            <h1 className="bk-cover-title">{d.title || t.h1}</h1>
            {d.place && <div>{d.place}</div>}
            {lang && <div style={{ fontSize: 12, marginTop: 6 }}>{t.languageLine}: {lang}</div>}
          </div>
        </section>
      )
    }
    case 'schedule': {
      const rows = scheduleRows(block.data.gridRows)
      return <section className="bk-sheet" data-block="schedule"><h2>{block.title}</h2>
        {rows.length > 1 && <table className="bk-table">
          <thead><tr>{rows[0].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>{rows.slice(1).map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
        </table>}
      </section>
    }
    case 'pricing': {
      const d = block.data; const cur = d.currency ?? form.passport.currency ?? 'USD'
      return <section className="bk-sheet" data-block="pricing"><h2>{block.title}</h2>
        {d.priceCents === null ? <p className="bk-noprint">{t.priceUnknown}</p> : <ul>
          <li>{t.priceLine}: <strong>{money(d.priceCents / 100, cur, locale)}</strong></li>
          {d.depositPct !== null && <li>{t.depositLine}: {d.depositPct}%</li>}
          {d.depositPct === null && d.depositCents !== null && <li>{t.depositLine}: {money(d.depositCents / 100, cur, locale)}</li>}
          {d.balanceDueDate && <li>{t.balanceLine} {dateText(d.balanceDueDate, locale)}</li>}
        </ul>}
        {d.accommodation && d.accommodation.length > 0 && <><h3>{t.accommodationTitle}</h3><ul>
          {d.accommodation.map((a, i) => <li key={i}>{a.name} — {t.surcharge} {money(a.surcharge, cur, locale)}</li>)}
        </ul></>}
      </section>
    }
    case 'food': {
      const d = block.data; const diets = form.imports.menu?.diets ?? {}
      const dietLines = Object.entries(diets).filter(([, n]) => (n ?? 0) > 0).map(([k, n]) => t.dietGuests(dietLabel(k as Exclude<DietId, 'standard'>, locale), n ?? 0))
      const day = d.firstFullDay
      if (!d.foodText && !dietLines.length && !(day && (day.breakfast || day.lunch || day.dinner))) return null
      return <section className="bk-sheet" data-block="food"><h2>{block.title}</h2>
        {d.foodText && <p>{d.foodText}</p>}
        {day && (day.breakfast || day.lunch || day.dinner) && <><h3>{t.sampleDay}</h3><ul>
          {day.breakfast && <li>{t.breakfast}: {day.breakfast}</li>}
          {day.lunch && <li>{t.lunch}: {day.lunch}</li>}
          {day.dinner && <li>{t.dinner}: {day.dinner}</li>}
        </ul></>}
        {dietLines.length > 0 && <p style={{ fontSize: 12 }}>{dietLines.join(' · ')}</p>}
      </section>
    }
    case 'payments': {
      const d = block.data
      return <section className="bk-sheet" data-block="payments"><h2>{block.title}</h2>
        {d.milestones.length > 0 && <ul className="bk-dates">{d.milestones.map((m, i) => (
          <li key={i}><strong>{dateText(m.date, locale)}</strong> — {m.id === 'guest-balance' ? t.balance : t.refund}</li>
        ))}</ul>}
        {d.paymentsText && <p>{d.paymentsText}</p>}
      </section>
    }
    case 'days': return null
    case 'invitation': return c.invitation ? <section className="bk-sheet" data-block="invitation"><h2>{block.title}</h2><p>{c.invitation}</p></section> : null
    case 'fit': return <section className="bk-sheet" data-block="fit"><h2>{block.title}</h2><div className="bk-two">
      <div><h3>{t.fields.fitFor}</h3><List items={c.fitFor} /></div>
      <div><h3>{t.fields.notFor}</h3><List items={c.notFor} /></div>
    </div></section>
    case 'experiences': return <section className="bk-sheet" data-block="experiences"><h2>{block.title}</h2><ul>
      {c.experiences.filter((x) => x.text.trim()).map((x, i) => <li key={i}><strong>{x.text}</strong>{x.serves ? ` — ${x.serves}` : ''}</li>)}
    </ul></section>
    case 'leaders': case 'team': {
      const people = block.id === 'leaders' ? c.leaders : c.team
      return <section className="bk-sheet" data-block={block.id}><h2>{block.title}</h2>
        {people.map((p, i) => <div key={i} className="bk-person">
          <div>{p.photoId ? <Photo id={p.photoId} photos={photos} t={t} alt={p.name} /> : null}</div>
          <div><h3 style={{ margin: 0 }}>{p.name}</h3>{p.role && <div style={{ fontSize: 12, color: 'var(--bk-accent)' }}>{p.role}</div>}<p>{p.bio}</p></div>
        </div>)}
      </section>
    }
    case 'place': return <section className="bk-sheet" data-block="place"><h2>{block.title}</h2>
      {c.placeText && <p>{c.placeText}</p>}
      {c.placePhotoIds.length > 0 && <div className="bk-photos">{c.placePhotoIds.map((id) => <Photo key={id} id={id} photos={photos} t={t} alt="" />)}</div>}
    </section>
    case 'inclusions': return <section className="bk-sheet" data-block="inclusions"><h2>{block.title}</h2><div className="bk-two">
      <div><h3>{t.fields.included}</h3><List items={c.included} /></div>
      <div><h3>{t.fields.notIncluded}</h3><List items={c.notIncluded} /></div>
    </div></section>
    case 'booking': return <section className="bk-sheet" data-block="booking"><h2>{block.title}</h2>
      <ol>{c.bookingSteps.filter((x) => x.trim()).map((x, i) => <li key={i}>{x}</li>)}</ol></section>
    case 'preparation': return <section className="bk-sheet" data-block="preparation"><h2>{block.title}</h2><p>{c.preparation}</p></section>
    case 'packing': return <section className="bk-sheet" data-block="packing"><h2>{block.title}</h2><List items={c.packing} /></section>
    case 'travel': {
      const tr = c.travel; const f = t.fields
      const lines = ([[f.startTime, tr.startTime], [f.endTime, tr.endTime], [f.airport, tr.airport], [f.travelTime, tr.travelTime]] as const).filter(([, v]) => v.trim())
      return <section className="bk-sheet" data-block="travel"><h2>{block.title}</h2>
        {lines.length > 0 && <ul>{lines.map(([k, v]) => <li key={k}>{k}: {v}</li>)}</ul>}{tr.notes && <p>{tr.notes}</p>}</section>
    }
    case 'rules': return <section className="bk-sheet" data-block="rules"><h2>{block.title}</h2><List items={c.rules} /></section>
    case 'testimonials': return <section className="bk-sheet" data-block="testimonials"><h2>{block.title}</h2>
      {c.testimonials.filter((x) => x.quote.trim()).map((x, i) => (
        <blockquote key={i} className={x.consent ? 'bk-quote' : 'bk-quote bk-noprint'}>«{x.quote}»{x.author ? <div style={{ fontSize: 12 }}>— {x.author}</div> : null}</blockquote>
      ))}</section>
    case 'faq': return <section className="bk-sheet" data-block="faq"><h2>{block.title}</h2><dl className="bk-dl">
      {c.faq.filter((x) => x.q.trim()).map((x, i) => <div key={i}><dt>{x.q}</dt><dd>{x.a}</dd></div>)}</dl></section>
    case 'contact': return <section className="bk-sheet" data-block="contact"><h2>{block.title}</h2><p>{c.contact}</p></section>
    default: return null
  }
}

export function BookletPreview({ form, blocks, locale, photos }: { form: BookletForm; blocks: BookletBlock[]; locale: Locale; photos: PhotoView }) {
  const t = bk(locale)
  const days = blocks.filter((b): b is Extract<BookletBlock, { id: 'days' }> => b.id === 'days' && b.data.text.trim() !== '')
  return (
    <div className="bk-paper" style={{ ['--bk-accent' as string]: ACCENTS[form.accent] } as React.CSSProperties}>
      {blocks.map((block, i) => {
        if (block.id === 'days') {
          // программа по дням — один раздел на все дни, на месте первого дня
          if (blocks.findIndex((b) => b.id === 'days') !== i || !days.length) return null
          return <section key={i} className="bk-sheet" data-block="days"><h2>{block.title}</h2>
            {days.map((d) => <div key={d.data.day}><h3>{t.fields.day(d.data.day)}</h3><p>{d.data.text}</p></div>)}</section>
        }
        return <Block key={i} block={block} form={form} locale={locale} t={t} photos={photos} />
      })}
    </div>
  )
}
