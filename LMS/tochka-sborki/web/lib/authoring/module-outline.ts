// lib/authoring/module-outline.ts
// Ф2 S1 «module-pack wizard»: типизированный контракт МОДУЛЯ, который гостевой
// мастер (пример: Наташа — модуль астрологии) авторит внутри существующего курса.
// Pure-валидатор, no I/O; список занятых модульных каталогов приносит caller.
import type { Bi } from '@/lib/course'
import { lintDehustle } from './dehustle'

export interface ModuleAuthor { name: string; contact?: string }
export interface ModuleUnitOutline { slug: string; title: Bi; objective: Bi }

export interface ModuleOutline {
  /** NN-kebab, как каталоги контента: 02-astrologia-vnutrennego-neba */
  slug: string
  author: ModuleAuthor
  title: Bi
  description: Bi
  /** 1..8 юнитов */
  units: ModuleUnitOutline[]
}

const MODULE_SLUG = /^\d{2}-[a-z0-9-]+$/
const UNIT_SLUG = /^u\d+-[a-z0-9-]+$/
const MAX_UNITS = 8

function biComplete(b: Bi | undefined | null): boolean {
  return !!b && typeof b.ru === 'string' && b.ru.trim().length > 0
    && typeof b.en === 'string' && b.en.trim().length > 0
}

/** Возвращает [] когда outline валиден, иначе список человекочитаемых ошибок.
 *  existingModuleDirs — имена модульных каталогов content/ru/ целевого pack'а. */
export function validateModuleOutline(o: ModuleOutline, existingModuleDirs: string[]): string[] {
  const errors: string[] = []

  if (!MODULE_SLUG.test(o.slug ?? '')) {
    errors.push(`module slug "${o.slug}" must match NN-slug (e.g. 02-astrologia)`)
  } else {
    const nn = o.slug.slice(0, 2)
    const taken = existingModuleDirs.find(d => d.slice(0, 2) === nn)
    if (taken) errors.push(`module number ${nn} is already taken by "${taken}" — pick a free NN`)
  }

  if (!o.author || typeof o.author.name !== 'string' || o.author.name.trim().length === 0) {
    errors.push('author.name must be a non-empty string')
  }
  if (o.author && o.author.contact !== undefined && typeof o.author.contact !== 'string') {
    errors.push('author.contact, when present, must be a string')
  }

  if (!biComplete(o.title)) errors.push('module title must be non-empty in ru and en')
  if (!biComplete(o.description)) errors.push('module description must be non-empty in ru and en')

  if (!o.units || o.units.length === 0) errors.push('module must have at least one unit')
  if (o.units && o.units.length > MAX_UNITS) errors.push(`module must have at most ${MAX_UNITS} units`)

  const unitSlugs = new Set<string>()
  for (const u of o.units ?? []) {
    if (!UNIT_SLUG.test(u.slug)) errors.push(`unit slug "${u.slug}" must match uN-slug (e.g. u1-intro)`)
    if (unitSlugs.has(u.slug)) errors.push(`duplicate unit slug "${u.slug}"`)
    unitSlugs.add(u.slug)
    if (!biComplete(u.title)) errors.push(`unit "${u.slug}" title must be non-empty in ru and en`)
    if (!biComplete(u.objective)) errors.push(`unit "${u.slug}" objective must be non-empty in ru and en`)
  }

  // de-hustle по всем строкам outline (dedup)
  const hits = new Set<string>()
  const scan = (s: string | undefined) => { if (s) for (const t of lintDehustle(s)) hits.add(t) }
  scan(o.title?.ru); scan(o.title?.en); scan(o.description?.ru); scan(o.description?.en)
  for (const u of o.units ?? []) {
    scan(u.title?.ru); scan(u.title?.en); scan(u.objective?.ru); scan(u.objective?.en)
  }
  for (const t of hits) errors.push(`de-hustle: banned term "${t}"`)

  return errors
}
