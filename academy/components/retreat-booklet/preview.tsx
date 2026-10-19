import { bookletModel, type BookletBlock } from '../../lib/retreat-booklet/pages'
import type { BookletForm, Person } from '../../lib/retreat-booklet/form'
import type { Locale } from '../../lib/dictionaries'
import { sectionLabels } from '../../lib/retreat-booklet/labels'

export function BookletPreview({ form, locale, today, photoRights = {} }: { form: BookletForm; locale: Locale; today: string; photoRights?: Record<string, boolean> }) {
  const blocks = bookletModel(form, locale, today as never); const labels = sectionLabels(locale)
  return <div className="bk-preview">{blocks.map((block, i) => <Block key={`${block.id}-${i}`} block={block} labels={labels} locale={locale} photoRights={photoRights} />)}</div>
}
function Block({ block, labels, locale, photoRights }: { block: BookletBlock; labels: Record<string, string>; locale: Locale; photoRights: Record<string, boolean> }) {
  const c = block.data && 'content' in block.data ? block.data.content : null
  if (block.id === 'cover') return <article className="bk-page bk-cover"><p className="bk-meta">
    {block.data.dateText} · {block.data.nights} {locale === 'ru' ? 'ночей' : 'nights'}</p><h2>{block.data.title || labels.cover}</h2><p>{block.data.place}</p></article>
  if (block.id === 'schedule') return <article className="bk-page"><h2>{block.title}</h2><table><tbody>{block.data.gridRows.map((row, i) => <tr key={i}>
    {Array.isArray(row) ? row.map((cell, n) => <td key={n}>{typeof cell === 'object' && cell !== null
      ? Object.values(cell as Record<string, unknown>).join(' · ') : String(cell ?? '')}</td>) : <td>{String(row)}</td>}
  </tr>)}</tbody></table></article>
  if (block.id === 'pricing') return <article className="bk-page"><h2>{block.title}</h2><ul>
    <li>{locale === 'ru' ? 'Цена участия' : 'Participation price'}: {block.data.priceCents === null ? '—'
      : `${(block.data.priceCents / 100).toFixed(2)} ${block.data.currency ?? ''}`}</li>
    <li>{locale === 'ru' ? 'Депозит' : 'Deposit'}: {block.data.depositCents === null ? '—' : block.data.depositCents / 100}</li>
    {block.data.accommodation?.map((x) => <li key={x.name}>{x.name}: {x.cost}</li>)}</ul></article>
  if (block.id === 'payments') return <article className="bk-page"><h2>{block.title}</h2><p>{block.data.paymentsText}</p>
    {block.data.milestones.map((x) => <p key={x.id}>{x.date}</p>)}</article>
  if (block.id === 'days') return <article className="bk-page"><h2>{block.title} {block.data.day}</h2><p>{block.data.text}</p></article>
  if (block.id === 'food') return <article className="bk-page"><h2>{block.title}</h2><p>{block.data.foodText}</p></article>
  if (block.id === 'leaders' || block.id === 'team') return <article className="bk-page"><h2>{block.title}</h2>
    <People people={c?.[block.id] ?? []} photoRights={photoRights} locale={locale} /></article>
  if (block.id === 'faq') return <article className="bk-page"><h2>{block.title}</h2><dl>{c?.faq.map((x) => <div key={x.q}><dt>{x.q}</dt><dd>{x.a}</dd></div>)}</dl></article>
  if (block.id === 'testimonials') return <article className="bk-page"><h2>{block.title}</h2>
    {c?.testimonials.map((x) => <blockquote key={x.author}>{x.quote} — {x.author}</blockquote>)}</article>
  return <article className="bk-page"><h2>{block.title}</h2><p>{c ? String(c[block.id as keyof typeof c] ?? '') : ''}</p></article>
}
function People({ people, photoRights, locale }: { people: Person[]; photoRights: Record<string, boolean>; locale: Locale }) {
  return <div>{people.map((person) => <div className="bk-card" key={`${person.name}-${person.role}`}>
    {person.photoId && photoRights[person.photoId] === true ? <img src={`/api/photo/${person.photoId}`} alt="" />
      : person.photoId ? <p className="bk-no-photo">{locale === 'ru' ? 'нет права на фото' : 'no rights to this photo'}</p> : null}
    <h3>{person.name}</h3><p>{person.role}</p><p>{person.bio}</p></div>)}</div>
}
