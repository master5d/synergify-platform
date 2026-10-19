// Лендинг ретрита: та же модель, что у буклета (bookletModel), плюс своё (form.landing), — в один HTML-файл без
// зависимостей. Стили внутри, фото — data URI и только с отметкой права, без <script>, внешних шрифтов и трекеров;
// единственный внешний ресурс — iframe видео YouTube (nocookie) или Vimeo (dnt). Порядок разделов — spec E §4.2.
import type { Lang } from '../retreat-calc/engine'
import type { IsoDate } from '../retreat-core/dates'
import { milestoneLabel } from '../retreat-timeline/labels'
import { checkBooklet, type BookletIssue } from './checks'
import { sectionLabels } from './labels'
import { bookletModel, type BookletBlock } from './pages'
import { ctaUrlOk, LANDING_LIMITS, videoEmbedUrl } from './landing-media'
import type { BookletForm } from './form'
import type { SectionId } from './sections'

export { ctaUrlOk, LANDING_LIMITS, videoEmbedUrl }

export interface LandingMedia { photoUris: Record<string, string>; rights: Record<string, boolean> }

/** Проверки буклета плюс свои: кнопка записи, видео, вес файла. */
export function checkLanding(form: BookletForm, lang: Lang, today: IsoDate, photoRights: Record<string, boolean> = {}, htmlSize?: number):
  { errors: BookletIssue[]; warnings: BookletIssue[] } {
  const result = checkBooklet(form, lang, today, photoRights)
  const url = form.landing.cta.url.trim()
  if (!url) result.errors.push({ id: 'cta-missing' })
  else if (!ctaUrlOk(url)) result.errors.push({ id: 'cta-invalid' })
  if (form.landing.videoUrl.trim() && !videoEmbedUrl(form.landing.videoUrl)) result.warnings.push({ id: 'video-not-allowed' })
  if (htmlSize !== undefined && htmlSize > LANDING_LIMITS.heavyBytes) result.warnings.push({ id: 'file-heavy' })
  return result
}

/** Те же цвета акцента, что у буклета (components/retreat-booklet/styles.ts): буклет и страница одного ретрита в одном цвете. */
export const LANDING_ACCENTS = { sand: '#b8925a', sage: '#7d9472', clay: '#b0674a', ink: '#34465c' } as const

/** Порядок разделов страницы — spec E §4.2 (у буклета свой порядок, страница читается сверху вниз иначе). */
export const LANDING_ORDER: SectionId[] = [
  'fit', 'experiences', 'days', 'schedule', 'leaders', 'team', 'place', 'food', 'pricing', 'inclusions', 'booking', 'payments',
  'preparation', 'packing', 'travel', 'rules', 'testimonials', 'faq', 'contact',
]

const COPY = {
  ru: { fitFor: 'Для кого', notFor: 'Кому не подойдёт', included: 'Включено', notIncluded: 'Не включено', day: 'День', participation: 'Участие',
    surcharge: 'доплата', video: 'Видео ретрита', footer: 'Страница собрана в академии S.A.S.H.A.', start: 'Начало', end: 'Конец', time: 'Время' },
  en: { fitFor: 'Who it is for', notFor: 'Who it will not suit', included: 'Included', notIncluded: 'Not included', day: 'Day', participation: 'Participation',
    surcharge: 'surcharge', video: 'Retreat video', footer: 'Page assembled at S.A.S.H.A. academy', start: 'Start', end: 'End', time: 'Time' },
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
/** Экранирование для текста и атрибутов: все пять символов. */
export const esc = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (ch) => ESC[ch])
const para = (value: string) => (value.trim() ? `<p>${esc(value).replace(/\n/g, '<br>')}</p>` : '')
const list = (items: string[]) => {
  const shown = items.filter((x) => x.trim())
  return shown.length ? `<ul>${shown.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''
}
const money = (units: number, currency: string, lang: Lang) => {
  try {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ru-RU', { style: 'currency', currency, maximumFractionDigits: units % 1 === 0 ? 0 : 2 }).format(units)
  } catch {
    return `${units} ${currency}`
  }
}
const dateText = (iso: string, lang: Lang) =>
  new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`))

export function renderLandingHtml(form: BookletForm, lang: Lang, today: IsoDate, media: LandingMedia): string {
  const c = form.content; const l = form.landing; const t = COPY[lang]; const labels = sectionLabels(lang)
  const blocks = bookletModel(form, lang, today)
  const has = (id: SectionId) => blocks.some((b) => b.id === id)
  const block = <K extends BookletBlock['id']>(id: K) => blocks.find((b) => b.id === id) as Extract<BookletBlock, { id: K }> | undefined
  const ctaOk = ctaUrlOk(l.cta.url)
  const button = () => (ctaOk ? `<a class="button" href="${esc(l.cta.url.trim())}" rel="noopener">${esc(l.cta.label)}</a>` : '')
  const photoUri = (id: string | undefined) => (id && media.rights[id] === true && media.photoUris[id]?.startsWith('data:') ? media.photoUris[id] : '')
  const img = (id: string | undefined, alt = '') => { const uri = photoUri(id); return uri ? `<img src="${esc(uri)}" alt="${esc(alt)}">` : '' }

  const cover = block('cover')
  const title = form.passport.title ?? cover?.data.title ?? ''
  const description = (l.subtitle || c.invitation).slice(0, 160)
  const coverUri = photoUri(c.coverPhotoId)
  const pricing = block('pricing')
  const payments = block('payments')
  const scheduleRows = (block('schedule')?.data.gridRows ?? []) as string[][]
  const days = blocks.filter((b): b is Extract<BookletBlock, { id: 'days' }> => b.id === 'days' && b.data.text.trim() !== '')
  const video = videoEmbedUrl(l.videoUrl)

  const body: Partial<Record<SectionId, string>> = {
    fit: `<div class="two"><div><h3>${esc(t.fitFor)}</h3>${list(c.fitFor)}</div><div><h3>${esc(t.notFor)}</h3>${list(c.notFor)}</div></div>`,
    experiences: `<ul>${c.experiences.filter((x) => x.text.trim()).map((x) => `<li><strong>${esc(x.text)}</strong>${x.serves ? ` — ${esc(x.serves)}` : ''}</li>`).join('')}</ul>`,
    days: days.map((d) => `<h3>${esc(t.day)} ${d.data.day}</h3>${para(d.data.text)}`).join(''),
    schedule: scheduleRows.length > 1
      ? `<div class="scroll"><table><thead><tr>${scheduleRows[0].map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${
        scheduleRows.slice(1).filter((r) => r.slice(1).some((cell) => cell && cell !== '↓'))
          .map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
      : '',
    leaders: c.leaders.map((p) => `<article class="person">${img(p.photoId, p.name)}<div><h3>${esc(p.name)}</h3>${p.role ? `<p class="role">${esc(p.role)}</p>` : ''}${para(p.bio)}</div></article>`).join(''),
    team: c.team.map((p) => `<article class="person">${img(p.photoId, p.name)}<div><h3>${esc(p.name)}</h3>${p.role ? `<p class="role">${esc(p.role)}</p>` : ''}${para(p.bio)}</div></article>`).join(''),
    place: `${para(c.placeText)}<div class="photos">${c.placePhotoIds.map((id) => img(id)).join('')}</div>`,
    food: para(c.foodText),
    pricing: (() => {
      if (!pricing || pricing.data.priceCents === null) return para(l.priceNote)
      const cur = pricing.data.currency ?? form.passport.currency ?? 'USD'
      const cards = [`<article class="card"><h3>${esc(t.participation)}</h3><p class="price">${esc(money(pricing.data.priceCents / 100, cur, lang))}</p>${button()}</article>`,
        ...(pricing.data.accommodation ?? []).map((o) => `<article class="card"><h3>${esc(o.name)}</h3><p class="price">${esc(t.surcharge)} ${
          esc(money(o.surcharge, cur, lang))}</p>${button()}</article>`)]
      return `<div class="cards">${cards.join('')}</div>${para(l.priceNote)}`
    })(),
    inclusions: `<div class="two"><div><h3>${esc(t.included)}</h3>${list(c.included)}</div><div><h3>${esc(t.notIncluded)}</h3>${list(c.notIncluded)}</div></div>`,
    booking: `<ol>${c.bookingSteps.filter((x) => x.trim()).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>${button()}`,
    payments: `${(payments?.data.milestones ?? []).map((m) => `<p><strong>${esc(dateText(m.date, lang))}</strong> — ${esc(milestoneLabel(m, lang))}</p>`).join('')}${para(c.paymentsText)}`,
    preparation: para(c.preparation),
    packing: list(c.packing),
    travel: `${list([c.travel.startTime && `${t.start}: ${c.travel.startTime}`, c.travel.endTime && `${t.end}: ${c.travel.endTime}`, c.travel.airport,
      c.travel.travelTime].filter(Boolean) as string[])}${para(c.travel.notes)}`,
    rules: list(c.rules),
    testimonials: c.testimonials.filter((x) => x.consent && x.quote.trim())
      .map((x) => `<blockquote>«${esc(x.quote)}»${x.author ? `<cite>— ${esc(x.author)}</cite>` : ''}</blockquote>`).join(''),
    faq: c.faq.filter((x) => x.q.trim()).map((x) => `<details><summary>${esc(x.q)}</summary>${para(x.a)}</details>`).join(''),
    contact: para(c.contact),
  }
  const sectionIds = LANDING_ORDER.filter((id) => has(id) && (body[id] ?? '').replace(/<[^>]+>/g, '').trim() !== '')
  const sections = sectionIds.map((id) => `<section id="${id}"><h2>${esc(labels[id])}</h2>${body[id]}</section>`)
  // видео — отдельным блоком после «что ты переживёшь» (или первым, если такого раздела нет)
  if (video) {
    const html = `<section id="video" class="video"><iframe src="${esc(video)}" title="${esc(t.video)}" loading="lazy" allowfullscreen></iframe></section>`
    const at = sectionIds.indexOf('experiences')
    sections.splice(at >= 0 ? at + 1 : Math.min(1, sections.length), 0, html)
  }
  const nav = sectionIds.map((id) => `<a href="#${id}">${esc(labels[id])}</a>`).join('')
  const numbers = l.numbers.filter((n) => n.value.trim())
  const hero = `<section id="cover" class="hero">${img(c.coverPhotoId, '')}<div class="hero-text">`
    + `${cover?.data.dateText ? `<p class="meta">${esc(cover.data.dateText)}</p>` : ''}<h1>${esc(title)}</h1>`
    + `${l.subtitle ? `<p class="lead">${esc(l.subtitle)}</p>` : ''}${c.place ? `<p>${esc(c.place)}</p>` : ''}${button()}</div></section>`
    + (numbers.length ? `<section id="numbers" class="numbers">${numbers.map((n) => `<div><strong>${esc(n.value)}</strong><span>${esc(n.label)}</span></div>`).join('')}</section>` : '')
    + (c.invitation.trim() && has('invitation') ? `<section id="invitation">${para(c.invitation)}</section>` : '')

  const accent = LANDING_ACCENTS[form.accent]
  const style = `<style>:root{--accent:${accent}}*{box-sizing:border-box}body{margin:0;font:17px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;color:#2a2620;background:#fffdf8}`
    + 'header{position:sticky;top:0;background:#fffdf8ee;border-bottom:1px solid #e6dfd2;display:flex;gap:1rem;align-items:center;justify-content:space-between;padding:.6rem 1rem;z-index:2}'
    + 'header strong{font-size:1rem}nav{display:none;gap:1rem;overflow:auto;font-size:.9rem}nav a{color:#2a2620;text-decoration:none;white-space:nowrap}'
    + 'main{max-width:70ch;margin:0 auto;padding:0 1rem 3rem}section{padding:2rem 0;border-bottom:1px solid #eee6d8}h2{color:var(--accent);font-weight:500;font-size:1.6rem;margin:0 0 1rem}'
    + 'h1{font-size:clamp(2rem,7vw,3.4rem);line-height:1.1;margin:.3rem 0}.hero{position:relative;padding:0;border:0;margin:0 -1rem}.hero img{width:100%;max-height:70vh;object-fit:cover;display:block}'
    + '.hero-text{padding:1.5rem 1rem}.meta{color:var(--accent);letter-spacing:.03em;margin:0}.lead{font-size:1.2rem}'
    + '.button{display:inline-block;background:var(--accent);color:#fff;padding:.7rem 1.2rem;border-radius:.4rem;text-decoration:none;font-weight:600;margin:.6rem 0}'
    + 'header .button{margin:0;padding:.45rem .9rem}.numbers{display:grid;grid-template-columns:repeat(auto-fit,minmax(8rem,1fr));gap:1rem}'
    + '.numbers strong{display:block;font-size:2rem;color:var(--accent)}.two{display:grid;gap:1rem}.cards{display:grid;gap:1rem}.card{background:#f5efe4;border-radius:.5rem;padding:1rem}'
    + '.price{font-size:1.3rem;font-weight:600}.person{display:grid;grid-template-columns:96px 1fr;gap:1rem;margin-bottom:1.2rem}.person img{width:96px;height:96px;border-radius:50%;object-fit:cover}'
    + '.role{color:var(--accent);margin:0}.photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.5rem}.photos img{width:100%;height:120px;object-fit:cover;border-radius:.3rem}'
    + '.scroll{overflow-x:auto}table{border-collapse:collapse;font-size:.8rem;min-width:36rem}th,td{border:1px solid #e0d8c8;padding:.3rem .4rem;text-align:left;vertical-align:top}th{background:#f3eee4}'
    + '.video iframe{width:100%;aspect-ratio:16/9;border:0}blockquote{border-left:3px solid var(--accent);margin:0 0 1rem;padding:.2rem 0 .2rem 1rem}cite{display:block;font-size:.9rem}'
    + 'details{border-bottom:1px solid #eee6d8;padding:.5rem 0}summary{cursor:pointer;font-weight:600}footer{text-align:center;font-size:.8rem;color:#7a7266;padding:2rem 1rem}'
    + '@media (min-width:900px){nav{display:flex}.two{grid-template-columns:1fr 1fr}.cards{grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))}.hero{margin:0}}</style>'
  const footer = l.footer ? `<footer>${esc(t.footer)}</footer>` : ''
  return '<!doctype html>'
    + `<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">`
    + `<title>${esc(title)}</title><meta name="description" content="${esc(description)}">`
    + `<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">`
    + (coverUri ? `<meta property="og:image" content="${esc(coverUri)}">` : '') + style + '</head>'
    + `<body><header><strong>${esc(title)}</strong><nav>${nav}</nav>${button()}</header>`
    + `<main>${hero}${sections.join('')}</main>${footer}</body></html>`
}
