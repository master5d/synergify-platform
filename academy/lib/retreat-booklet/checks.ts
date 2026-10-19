import type { Lang } from '../retreat-calc/engine'
import { REQUIRED_SECTIONS } from './sections'
import { holidaysOverlapping } from './holidays'
import { issueText } from './labels'
import type { BookletForm, SectionId } from './form'
import { findPromises } from '../retreat-program/promises'
import { passportFromCalcLink } from '../retreat-core/passport'
export interface BookletIssue { id: string; section?: SectionId; detail?: string }
const textFields = (f: BookletForm) => { const c = f.content;
  return [c.place, c.invitation, c.placeText, c.foodText, c.preparation, c.paymentsText, c.contact, ...c.fitFor, ...c.notFor, ...c.days, ...c.included, ...c.notIncluded,
  ...c.packing, ...c.rules, ...c.bookingSteps, ...c.experiences.flatMap((x) => [x.text, x.serves]), ...c.leaders.flatMap((x) => [x.name, x.role, x.bio]),
  ...c.team.flatMap((x) => [x.name, x.role, x.bio]), ...c.testimonials.flatMap((x) => [x.quote, x.author]), ...c.faq.flatMap((x) => [x.q, x.a])] }
export function checkBooklet(form: BookletForm, lang: Lang, today: string, photoRights: Record<string, boolean> = {}): { errors: BookletIssue[]; warnings: BookletIssue[] } {
  const c = form.content; const errors: BookletIssue[] = []; const warnings: BookletIssue[] = []
  if (!c.fitFor.length) errors.push({ id: 'required-empty', section: 'fit' }); if (!c.leaders.length) errors.push({ id: 'required-empty', section: 'leaders' });
  if (!c.included.length) errors.push({ id: 'required-empty', section: 'inclusions' }); if (!c.contact.trim()) errors.push({ id: 'required-empty', section: 'contact' });
  if (!c.notIncluded.length) errors.push({ id: 'no-not-included', section: 'inclusions' });
  if (!form.imports.calc) errors.push({ id: 'required-empty', section: 'pricing' });
  if (!form.imports.timeline && !c.paymentsText.trim()) errors.push({ id: 'required-empty', section: 'payments' })
  for (const [kind, item] of Object.entries(form.imports)) {
    if (!item) continue
    const retreat = kind === 'calc' ? passportFromCalcLink(item.data, item.at) : 'retreat' in item ? item.retreat : {}
    for (const field of ['start', 'nights', 'currency'] as const) {
      if (retreat[field] !== undefined && retreat[field] !== form.passport[field]) errors.push({ id: 'import-passport-mismatch', detail: `${kind}.${field}` })
    }
  }
  for (const x of c.experiences) if (!x.serves.trim()) warnings.push({ id: 'experience-without-purpose', section: 'experiences' });
  // без даты старта праздники не проверяем: иначе «сегодня» дало бы ложное замечание
  if (form.passport.start) for (const h of holidaysOverlapping(form.passport.start, form.passport.nights ?? 0, lang)) warnings.push({ id: 'holiday-overlap', detail: h.name })
  const englishPromises = /(?<![A-Za-z])(?:guarantee\w*|heal(?:s|ing|ed|er)?|cure[sd]?|forever)(?![A-Za-z])/i
  const russianPromises = /(?<![A-Za-zА-Яа-яЁё])(?:гарантир\p{L}*|навсегда)(?![A-Za-zА-Яа-яЁё])/iu
  if (textFields(form).some((x) => findPromises(x).length > 0 || englishPromises.test(x) || russianPromises.test(x))) warnings.push({ id: 'promise-words' })
  if (c.testimonials.some((x) => !x.consent)) warnings.push({ id: 'testimonial-without-consent', section: 'testimonials' })
  const photos = [c.coverPhotoId, ...c.placePhotoIds, ...c.leaders.map((x) => x.photoId), ...c.team.map((x) => x.photoId)].filter((x): x is string => Boolean(x));
  for (const id of photos) if (photoRights[id] !== true) warnings.push({ id: 'photo-without-rights', detail: id })
  if (form.imports.program?.cards.some((x) => x.contraindications.trim())
  && !c.bookingSteps.some((x) => /анкет|form/i.test(x))) warnings.push({ id: 'booking-without-form', section: 'booking' })
  return { errors, warnings }
}
export { issueText }
