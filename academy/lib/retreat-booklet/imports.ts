import type { Lang } from '../retreat-calc/engine'
import { decodeLink, type LinkData } from '../retreat-calc/link'
import { decodeToolLink } from '../retreat-core/tool-link'
import { pickPassport, passportFromCalcLink } from '../retreat-core/passport'
import { PROGRAM_PATH } from '../retreat-program/form'
import { pickProgramTool } from '../retreat-program/grid'
import { MENU_PATH, pickMenuTool } from '../retreat-menu/form'
import { TIMELINE_PATH, CALC_PATH, pickTimelineTool, formFromDecoded as timelineForm } from '../retreat-timeline/form'
import { formFromDecoded, type BookletForm } from './form'
import type { IsoDate } from '../retreat-core/dates'

const pathOf = (url: string) => { try { return new URL(url, 'https://local.invalid').pathname.replace(/\/+$/, '/') } catch { return `${url.split('#')[0].replace(/\/+$/, '/')}/` } }
const localPaths = (path: string) => [path, `/en${path}`]
const text = (lang: Lang, ru: string, en: string) => lang === 'ru' ? ru : en
export interface CalcAccommodation { name: string; guests: number; surcharge: number; cost: number }
export function calcAccommodation(data: LinkData): CalcAccommodation[] {
  const raw = (data as { accommodation?: unknown }).accommodation
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)).filter((x) =>
    typeof x.name === 'string' && [x.guests, x.surcharge, x.cost].every((v) => typeof v === 'number' && Number.isFinite(v) && v >= 0),
  ).map((x) => ({ name: x.name as string, guests: x.guests as number, surcharge: x.surcharge as number, cost: x.cost as number }))
}
export function importLink(form: BookletForm, url: string, lang: Lang, today: IsoDate): { ok: true; form: BookletForm;
  kind: 'program' | 'menu' | 'calc' | 'timeline' } | { ok: false; error: string } {
  const path = pathOf(url);
  const kind = localPaths(PROGRAM_PATH).includes(path) ? 'program'
    : localPaths(MENU_PATH).includes(path) ? 'menu'
      : localPaths(CALC_PATH).includes(path) ? 'calc'
        : localPaths(TIMELINE_PATH).includes(path) ? 'timeline' : null
  if (!kind) return { ok: false, error: text(lang, 'неизвестный путь инструмента', 'unknown tool path') }
  const hash = url.includes('#') ? url.slice(url.indexOf('#')) : ''
  const decoded: any = kind === 'calc' ? decodeToolLink(hash, pickProgramTool, lang) : kind === 'program' ? decodeToolLink(hash, pickProgramTool,
  lang) : kind === 'menu' ? decodeToolLink(hash, pickMenuTool, lang) : decodeToolLink(hash, pickTimelineTool, lang)
  if (!decoded.ok) return { ok: false, error: decoded.error }
  if (decoded.kind === 'calc' && kind !== 'calc') return { ok: false, error: text(lang,
    'Это ссылка калькулятора — вставьте её с адресом калькулятора',
    'This is a calculator link — paste it with the calculator address') }
  if (decoded.kind !== 'calc' && kind === 'calc') return { ok: false, error: text(lang,
    'Это не ссылка калькулятора', 'This is not a calculator link') }
  const next: BookletForm = { ...form, passport: { ...form.passport }, imports: { ...form.imports } }
  if (kind === 'calc') {
    const calc = decoded.kind === 'calc' ? decoded.calc : null
    if (!calc) return { ok: false, error: text(lang, 'данные калькулятора повреждены', 'calculator data is damaged') }
    const linked = passportFromCalcLink(calc, today);
  next.passport = { ...next.passport, ...Object.fromEntries(Object.entries(linked).filter(([k,
  v]) => (next.passport[k as keyof typeof next.passport] === undefined
    || next.passport[k as keyof typeof next.passport] === '') && v !== undefined)) }
  next.imports.calc = { at: today, data: calc }
  return { ok: true, form: next, kind: 'calc' }
  }
  const linked = decoded.link.retreat;
  next.passport = { ...next.passport, ...Object.fromEntries(Object.entries(linked).filter(([k,
  v]) => (next.passport[k as keyof typeof next.passport] === undefined || next.passport[k as keyof typeof next.passport] === '') && v !== undefined)) }
  if (kind === 'program') { const tool = decoded.link.tool as ReturnType<typeof pickProgramTool>;
  next.imports.program = { at: today, retreat: pickPassport(linked), blocks: tool.blocks, cards: tool.cards } }
  if (kind === 'menu') { const tool = decoded.link.tool as ReturnType<typeof pickMenuTool>;
  next.imports.menu = { at: today, retreat: pickPassport(linked), grid: tool.grid, diets: tool.diets } }
  if (kind === 'timeline') { const timeline = timelineForm(decoded as never, today);
  if (!timeline) return { ok: false, error: text(lang, 'данные таймлайна повреждены', 'timeline data is damaged') };
  next.imports.timeline = { at: today, retreat: pickPassport(linked), terms: timeline.terms } }
  return { ok: true, form: next, kind }
}
