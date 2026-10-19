import { LIMITS, type Lang } from '../retreat-calc/engine'
import { encodeToolLink, type DecodedTool } from '../retreat-core/tool-link'
import { pickPassport, type RetreatPassport } from '../retreat-core/passport'
import { isIsoDate, type IsoDate } from '../retreat-core/dates'
import { SECTION_IDS, REQUIRED_SECTIONS, type SectionId } from './sections'
export type { SectionId } from './sections'
import { pickProgramTool, type Block } from '../retreat-program/grid'
import type { PracticeCard } from '../retreat-program/practices'
import type { MenuGrid, Diets } from '../retreat-menu/engine'
import { pickMenuTool } from '../retreat-menu/form'
import { decodeLink, encodeLink, type LinkData } from '../retreat-calc/link'
import type { TimelineTerms } from '../retreat-timeline/engine'
import { formFromDecoded as timelineForm, pickTimelineTool } from '../retreat-timeline/form'

export interface Person { name: string; role: string; bio: string; photoId?: string }
export interface Experience { text: string; serves: string }
export interface Testimonial { quote: string; author: string; consent: boolean }
export interface Qa { q: string; a: string }
export interface Travel { startTime: string; endTime: string; airport: string; travelTime: string; notes: string }
export interface BookletContent { place: string; language: string; coverPhotoId?: string; invitation: string; fitFor: string[]; notFor: string[];
  experiences: Experience[]; days: string[]; leaders: Person[]; team: Person[]; placeText: string; placePhotoIds: string[]; foodText: string; included: string[];
  notIncluded: string[]; bookingSteps: string[]; preparation: string; packing: string[]; travel: Travel; rules: string[]; paymentsText: string;
  testimonials: Testimonial[]; faq: Qa[]; contact: string }
export type Paper = 'a4' | 'letter'
export type Accent = 'sand' | 'sage' | 'clay' | 'ink'
export interface BookletImports { program?: { at: IsoDate; retreat: RetreatPassport; blocks: Block[]; cards: PracticeCard[] }; menu?: { at: IsoDate;
  retreat: RetreatPassport; grid: MenuGrid; diets: Diets }; calc?: { at: IsoDate; data: LinkData }; timeline?: { at: IsoDate; retreat: RetreatPassport; terms: TimelineTerms } }
export interface BookletForm { passport: RetreatPassport; content: BookletContent; enabled: SectionId[]; imports: BookletImports; paper: Paper; accent: Accent }
export const BOOKLET_LIMITS = { text: 2000, short: 120, list: 30, people: 8, testimonials: 8, questions: 20, days: LIMITS.nights + 1 } as const
const blankTravel = (): Travel => ({ startTime: '', endTime: '', airport: '', travelTime: '', notes: '' })
const blankContent = (lang: Lang): BookletContent => ({ place: '', language: lang, invitation: '', fitFor: [], notFor: [], experiences: [], days: [], leaders: [],
  team: [], placeText: '', placePhotoIds: [], foodText: '', included: [], notIncluded: [], bookingSteps: lang === 'ru' ? ['Заявка', 'Короткий созвон', 'Анкета гостя',
  'Депозит', 'Подтверждение места'] : ['Application', 'Short call', 'Guest form', 'Deposit', 'Place confirmed'], preparation: '', packing: [], travel: blankTravel(),
  rules: [], paymentsText: '', testimonials: [], faq: [], contact: '' })
export function defaultForm(_today: IsoDate, lang: Lang): BookletForm { return { passport: {}, content: blankContent(lang), enabled: [...REQUIRED_SECTIONS],
  imports: {}, paper: lang === 'ru' ? 'a4' : 'letter', accent: 'sand' } }
export const bookletDraftKey = (lang: Lang) => `retreat-booklet:draft:${lang}`
export function enabledSections(form: Pick<BookletForm, 'enabled'>): SectionId[] { return SECTION_IDS.filter((id) => form.enabled.includes(id) || REQUIRED_SECTIONS.includes(id)) }
const PHOTO_ID = /^ph-[a-z0-9]{12}$/
const str = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : ''
const strings = (v: unknown, max: number = BOOKLET_LIMITS.text, count: number = BOOKLET_LIMITS.list) => Array.isArray(v)
  ? v.filter((x): x is string => typeof x === 'string').map((x) => str(x, max)).slice(0, count) : []
const photos = (v: unknown) => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && PHOTO_ID.test(x)).slice(0, BOOKLET_LIMITS.list) : []
const person = (v: unknown): Person => { const o = v && typeof v === 'object' ? v as Record<string, unknown> : {};
  return { name: str(o.name, 120), role: str(o.role, 120), bio: str(o.bio, 2000), ...(typeof o.photoId === 'string' && PHOTO_ID.test(o.photoId) ? { photoId: o.photoId } : {}) } }

function pickedImports(raw: unknown): BookletImports {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: BookletImports = {}
  for (const [key, value] of Object.entries(raw)) {
    if (!['program', 'menu', 'calc', 'timeline'].includes(key) || !value || typeof value !== 'object' || Array.isArray(value)) continue
    const o = value as Record<string, unknown>
    if (!isIsoDate(o.at)) continue
    const retreat = pickPassport(o.retreat)
    if (key === 'program') { const tool = pickProgramTool(o); out.program = { at: o.at, retreat, ...tool } }
    if (key === 'menu') { const tool = pickMenuTool(o); out.menu = { at: o.at, retreat, ...tool } }
    if (key === 'calc') {
      const data = o.data
      if (data) { const checked = decodeLink(encodeLink(data as LinkData), 'ru'); if (checked.ok) out.calc = { at: o.at, data: checked.data } }
    }
    if (key === 'timeline') {
      // в черновике условия таймлайна лежат в центах, а pickTimelineTool разбирает ссылку в целых единицах валюты:
      // деньги площадки переводим обратно, иначе каждое чтение черновика умножало бы их на 100
      const terms = o.terms && typeof o.terms === 'object' ? o.terms as Record<string, unknown> : {}
      const venue = terms.venue && typeof terms.venue === 'object' ? terms.venue as Record<string, unknown> : {}
      const units = (x: unknown) => (typeof x === 'number' ? x / 100 : x)
      const tool = pickTimelineTool({ ...terms, venue: { ...venue, ratePerGuest: units(venue.ratePerGuest), buyoutFee: units(venue.buyoutFee) } })
      const decoded = { ok: true as const, kind: 'tool' as const, link: { v: 1 as const, retreat, tool } }
      const timeline = timelineForm(decoded, o.at)
      if (timeline) out.timeline = { at: o.at, retreat, terms: timeline.terms }
    }
  }
  return out
}
export function pickBookletTool(raw: unknown): BookletForm {
  const base = defaultForm('2000-01-01', 'ru')
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base
  const o = raw as Record<string, unknown>; const c = o.content && typeof o.content === 'object' ? o.content as Record<string, unknown> : {};
  const b = blankContent(c.language === 'en' ? 'en' : 'ru')
  for (const k of ['place', 'language'] as const) b[k] = str(c[k], BOOKLET_LIMITS.short)
  for (const k of ['invitation', 'placeText', 'foodText', 'preparation', 'paymentsText', 'contact'] as const) b[k] = str(c[k], BOOKLET_LIMITS.text)
  for (const k of ['fitFor', 'notFor', 'included', 'notIncluded', 'packing', 'rules'] as const) b[k] = strings(c[k], BOOKLET_LIMITS.short) as never
  b.days = strings(c.days, BOOKLET_LIMITS.short, BOOKLET_LIMITS.days)
  b.placePhotoIds = photos(c.placePhotoIds); if (typeof c.coverPhotoId === 'string' && PHOTO_ID.test(c.coverPhotoId)) b.coverPhotoId = c.coverPhotoId
  b.bookingSteps = strings(c.bookingSteps, BOOKLET_LIMITS.short); if (!b.bookingSteps.length) b.bookingSteps = blankContent(b.language === 'en' ? 'en' : 'ru').bookingSteps
  b.experiences = Array.isArray(c.experiences) ? c.experiences.slice(0, 30).map((x) => { const q = x && typeof x === 'object' ? x as Record<string, unknown> : {};
  return { text: str(q.text, BOOKLET_LIMITS.text), serves: str(q.serves, BOOKLET_LIMITS.text) } }) : []
  for (const k of ['leaders', 'team'] as const) b[k] = Array.isArray(c[k]) ? c[k].slice(0, 8).map(person) : []
  b.testimonials = Array.isArray(c.testimonials) ? c.testimonials.slice(0, 8).map((x) => { const q = x && typeof x === 'object' ? x as Record<string, unknown> : {};
  return { quote: str(q.quote, 2000), author: str(q.author, 120), consent: q.consent === true } }) : []
  b.faq = Array.isArray(c.faq) ? c.faq.slice(0, 20).map((x) => { const q = x && typeof x === 'object' ? x as Record<string, unknown> : {};
  return { q: str(q.q, BOOKLET_LIMITS.short), a: str(q.a, BOOKLET_LIMITS.text) } }) : []
  const tr = c.travel && typeof c.travel === 'object' ? c.travel as Record<string, unknown> : {};
  b.travel = { startTime: str(tr.startTime, 120), endTime: str(tr.endTime, 120), airport: str(tr.airport, 120), travelTime: str(tr.travelTime, 120), notes: str(tr.notes, 2000) }
  const enabled = Array.isArray(o.enabled) ? o.enabled.filter((x): x is SectionId => typeof x === 'string' && (SECTION_IDS as readonly string[]).includes(x)) : []
  return { passport: pickPassport(o.passport), content: b, enabled: enabledSections({ enabled }),
  imports: pickedImports(o.imports), paper: o.paper === 'letter' ? 'letter' : 'a4', accent: ['sand', 'sage', 'clay',
  'ink'].includes(o.accent as string) ? o.accent as Accent : 'sand' }
}
export function draftOf(form: BookletForm): string { return JSON.stringify({ passport: pickPassport(form.passport), content: form.content, enabled: enabledSections(form),
  imports: form.imports, paper: form.paper, accent: form.accent }) }
export function formFromDraft(text: string | null, today: IsoDate, lang: Lang): BookletForm | null { if (!text) return null;
  try { const picked = pickBookletTool(JSON.parse(text)); const base = defaultForm(today, lang);
  return { ...picked, passport: { ...base.passport, ...picked.passport }, content: { ...base.content, ...picked.content } } } catch { return null } }
export function bookletHash(form: BookletForm): string { return encodeToolLink({ v: 1, retreat: pickPassport(form.passport), tool: { content: form.content,
  enabled: enabledSections(form), imports: form.imports, paper: form.paper, accent: form.accent } }) }
export function formFromDecoded(d: DecodedTool<{ content?: BookletContent; enabled?: SectionId[]; imports?: BookletImports; paper?: Paper;
  accent?: Accent }>, today: IsoDate, lang: Lang): BookletForm | null {
  if (!d.ok) return null
  const base = defaultForm(today, lang)
  if (d.kind === 'calc') return { ...base, passport: { ...base.passport, ...d.calc } }
  const t = d.link.tool
  return { passport: { ...base.passport, ...d.link.retreat }, content: { ...base.content, ...t.content }, enabled: enabledSections({ enabled: t.enabled ?? [] }),
  imports: t.imports ?? {}, paper: t.paper ?? base.paper, accent: t.accent ?? base.accent }
}
export function exportJson(form: BookletForm): string { return JSON.stringify({ v: 1, booklet: { passport: pickPassport(form.passport), content: form.content,
  enabled: enabledSections(form), imports: form.imports, paper: form.paper, accent: form.accent } }, null, 2) }
export function importJson(text: string, today: IsoDate, lang: Lang): BookletForm | null { try { const o = JSON.parse(text) as Record<string, unknown>;
  if (o.v !== 1 || !o.booklet) return null; const b = o.booklet as Record<string, unknown>;
  return formFromDecoded({ ok: true, kind: 'tool', link: { v: 1, retreat: pickPassport(b.passport), tool: pickBookletTool(b) } }, today, lang) } catch { return null } }
