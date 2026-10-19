// Форма генератора меню: паспорт, сетка и числа гостей по диетам; перенос из ссылок (своей, таймлайна,
// калькулятора), черновик и ссылки наружу. Меню и числа по диетам — агрегаты без имён, им в ссылке можно быть;
// данных конкретных гостей здесь нет. Деньги в ссылке меню — целые центы (свой формат инструмента).

import { LIMITS } from '../retreat-calc/engine'
import { encodeLink } from '../retreat-calc/link'
import type { IsoDate } from '../retreat-core/dates'
import { pickPassport, passportFromCalcLink, type RetreatPassport } from '../retreat-core/passport'
import { encodeToolLink, type DecodedTool } from '../retreat-core/tool-link'
import { defaultForm as timelineDefaultForm } from '../retreat-timeline/form'
import { ALLERGENS, type AllergenId } from './allergens'
import { cellKey, DIETS, emptyCell, menuSlots, type Diets, type MenuCell, type MenuGrid, type SpecialDiet } from './engine'

export interface MenuForm { passport: RetreatPassport; grid: MenuGrid; diets: Diets }
export interface MenuLinkTool { grid?: MenuGrid; diets?: Diets }

export const MENU_DRAFT_KEY = 'retreat-menu:draft'
export const MENU_PATH = '/instrumenty/generator-menyu/'
/** Обрезка текста при записи: неделя со всеми полями по максимуму остаётся короче TOOL_MAX_FRAGMENT. */
export const MENU_LIMITS = { text: 80, optionName: 40, cells: 400 } as const

const KEY = /^(\d{1,3})-(breakfast|lunch|dinner)$/
const SPECIAL: SpecialDiet[] = ['vegetarian', 'vegan', 'gluten-free', 'vegan-gluten-free']
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
const cents = (v: unknown): number | null => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= LIMITS.moneyCents ? (v as number) : null)

function pickCell(raw: unknown): MenuCell {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return emptyCell()
  const o = raw as Record<string, unknown>
  const variants: MenuCell['variants'] = {}
  if (typeof o.variants === 'object' && o.variants !== null) {
    for (const d of SPECIAL) {
      const raw = (o.variants as Record<string, unknown>)[d]
      const v = str(raw, MENU_LIMITS.text)
      if (v) variants[d] = v
      else if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
        const variant = raw as Record<string, unknown>
        const name = str(variant.name, MENU_LIMITS.text)
        const allergens = Array.isArray(variant.allergens)
          ? [...new Set(variant.allergens.filter((a): a is AllergenId => ALLERGENS.includes(a as AllergenId)))]
          : []
        if (name) variants[d] = { name, allergens }
      }
    }
  }
  const allergens = Array.isArray(o.allergens) ? [...new Set(o.allergens.filter((a): a is AllergenId => ALLERGENS.includes(a as AllergenId)))] : []
  let option: MenuCell['option'] = null
  if (typeof o.option === 'object' && o.option !== null) {
    const op = o.option as Record<string, unknown>
    const name = str(op.name, MENU_LIMITS.optionName)
    const price = cents(op.priceCents)
    // опция живёт, если есть название или цена больше нуля: цена, введённая раньше названия, не теряется
    if (name || (price !== null && price > 0)) option = { name, priceCents: price ?? 0 }
  }
  return {
    dish: str(o.dish, MENU_LIMITS.text), side: str(o.side, MENU_LIMITS.text), drink: str(o.drink, MENU_LIMITS.text),
    meat: o.meat === true, variants, allergens, priceCents: cents(o.priceCents), option,
  }
}

/** Allowlist полей меню: чужие ключи, не те типы и лишняя длина отбрасываются; так же — при записи. */
export function pickMenuTool(raw: unknown): { grid: MenuGrid; diets: Diets } {
  const grid: MenuGrid = {}
  const diets: Diets = {}
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { grid, diets }
  const o = raw as Record<string, unknown>
  if (typeof o.grid === 'object' && o.grid !== null && !Array.isArray(o.grid)) {
    for (const [k, v] of Object.entries(o.grid).filter(([k]) => KEY.test(k)).slice(0, MENU_LIMITS.cells)) grid[k] = pickCell(v)
  }
  if (typeof o.diets === 'object' && o.diets !== null) {
    for (const d of DIETS) {
      const n = (o.diets as Record<string, unknown>)[d]
      if (Number.isInteger(n) && (n as number) >= 0 && (n as number) <= LIMITS.guests) diets[d] = n as number
    }
  }
  return { grid, diets }
}

/** Ячейки по ключу «день-приём»: заполненные сохраняются (и вне текущей сетки — на случай, если ночей снова станет больше), недостающие — пустые. */
export function reconcileGrid(grid: MenuGrid, p: RetreatPassport): MenuGrid {
  const out: MenuGrid = { ...grid }
  for (const s of menuSlots(p)) if (!out[cellKey(s)]) out[cellKey(s)] = emptyCell()
  return out
}

export function defaultForm(today: IsoDate): MenuForm {
  const passport = timelineDefaultForm(today).passport
  return { passport, grid: reconcileGrid({}, passport), diets: {} }
}

/** Только непустые ячейки — пустые восстанавливает reconcileGrid; так ссылка короче. */
function filled(grid: MenuGrid): MenuGrid {
  return Object.fromEntries(Object.entries(grid).filter(([, c]) => c.dish || c.side || c.drink || c.priceCents !== null || c.option))
}

export function menuHash(f: MenuForm): string {
  return encodeToolLink({ v: 1, retreat: pickPassport(f.passport), tool: pickMenuTool({ grid: filled(f.grid), diets: f.diets }) })
}

export function draftOf(f: MenuForm): string {
  return JSON.stringify({ passport: pickPassport(f.passport), tool: pickMenuTool({ grid: filled(f.grid), diets: f.diets }) })
}

/** Своя ссылка, ссылка таймлайна (берётся паспорт) или калькулятора v1. Ошибка ссылки — null. */
export function formFromDecoded(d: DecodedTool<{ grid: MenuGrid; diets: Diets }>, today: IsoDate): MenuForm | null {
  if (!d.ok) return null
  const base = defaultForm(today)
  if (d.kind === 'calc') {
    const passport = { ...base.passport, ...passportFromCalcLink(d.calc, today) }
    return { passport, grid: reconcileGrid({}, passport), diets: {} }
  }
  const passport = { ...base.passport, ...d.link.retreat }
  return { passport, grid: reconcileGrid(d.link.tool.grid, passport), diets: d.link.tool.diets }
}

/** Куда откладывается своё меню, когда по ссылке (например, из урока) открывается чужое: его можно вернуть кнопкой. */
export const MENU_PREV_KEY = 'retreat-menu:draft-before-link'

/** Стоит ли отложить черновик перед открытием меню из ссылки: в нём есть свои блюда, и он не совпадает со ссылкой. */
export function draftWorthKeeping(saved: string | null, fromLink: MenuForm, today: IsoDate): boolean {
  const d = formFromDraft(saved, today)
  if (!d || !Object.values(d.grid).some((c) => c.dish.trim() || c.priceCents !== null || c.option)) return false
  // черновик с тем же названием, что в ссылке, — то же учебное меню (открыли урок снова, поправили): его не откладываем,
  // иначе оно перезаписало бы уже отложенное настоящее меню ведущего
  if (d.passport.title && d.passport.title === fromLink.passport.title) return false
  return draftOf(d) !== draftOf(fromLink)
}

/** Ссылка без меню (из таймлайна или калькулятора) не затирает черновик: паспорт — из ссылки, сетка и диеты — из черновика. */
export function withDraftMenu(fromLink: MenuForm, draft: MenuForm | null, linkHasMenu: boolean): MenuForm {
  if (linkHasMenu || !draft) return fromLink
  return { ...fromLink, grid: reconcileGrid(draft.grid, fromLink.passport), diets: Object.keys(fromLink.diets).length ? fromLink.diets : draft.diets }
}

export function formFromDraft(text: string | null, today: IsoDate): MenuForm | null {
  if (!text) return null
  try {
    const o = JSON.parse(text) as Record<string, unknown>
    return formFromDecoded({ ok: true, kind: 'tool', link: { v: 1, retreat: pickPassport(o.passport), tool: pickMenuTool(o.tool) } }, today)
  } catch {
    return null
  }
}

/** Меню с паспортом из соседнего инструмента и пустой сеткой. */
export const menuHashFromPassport = (p: RetreatPassport) => encodeToolLink({ v: 1, retreat: pickPassport(p), tool: {} })

/** Соседние инструменты с тем же паспортом: таймлайн (условия — по умолчанию) и калькулятор (ссылка v1). */
export const timelineHashFromPassport = (p: RetreatPassport) => encodeToolLink({ v: 1, retreat: pickPassport(p), tool: {} })
export const calcHashFromPassport = (p: RetreatPassport) =>
  encodeLink({ v: 1, title: p.title, currency: p.currency, guests: p.guests, nights: p.nights })
